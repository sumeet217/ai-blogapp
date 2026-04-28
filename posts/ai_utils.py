"""
AI utility functions powered by Groq API (llama-3.3-70b-versatile).

Features:
  - get_recommendations()  → related post suggestions
  - get_chat_response()    → blog-aware chatbot replies
  - auto_tag_post()        → extract relevant tags from content
"""
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def _get_groq_client():
    """Initialize and return a Groq client."""
    try:
        from groq import Groq
        api_key = settings.GROQ_API_KEY
        if not api_key or api_key in ('', 'your-groq-api-key-here'):
            raise ValueError("Groq API key not configured. Set GROQ_API_KEY in .env")
        return Groq(api_key=api_key)
    except ImportError:
        raise ImportError("groq not installed. Run: pip install groq")


def get_recommendations(post, all_posts):
    """
    Given the current post, return AI-recommended post IDs from all_posts.
    Returns a list of up to 3 recommended Post objects.
    """
    if len(all_posts) <= 1:
        return []

    try:
        client = _get_groq_client()

        posts_context = "\n".join([
            f"ID:{p.id} | Title: {p.title} | Tags: {p.tags} | Excerpt: {p.excerpt[:100]}"
            for p in all_posts if p.id != post.id
        ])

        prompt = f"""You are a blog recommendation engine.
Current post:
Title: {post.title}
Tags: {post.tags}
Excerpt: {post.excerpt[:200]}

Available posts:
{posts_context}

Return ONLY the IDs of the 3 most relevant posts as a comma-separated list (e.g. "2,5,8").
No explanation, just the IDs."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=50,
            temperature=0.3,
        )

        text = response.choices[0].message.content.strip()

        # Parse comma-separated IDs
        ids = [int(x.strip()) for x in text.split(',') if x.strip().isdigit()]

        # Map IDs back to post objects
        post_map = {p.id: p for p in all_posts}
        return [post_map[pid] for pid in ids if pid in post_map][:3]

    except Exception as e:
        logger.error(f"Groq recommendations error: {e}")
        # Fallback: return most recent posts excluding current
        return [p for p in all_posts if p.id != post.id][:3]


def get_chat_response(user_message, posts_context):
    """
    Generate a chatbot response grounded in the blog's content.
    posts_context: list of dicts with 'title', 'excerpt', 'tags'
    """
    try:
        client = _get_groq_client()

        blog_summary = "\n".join([
            f"- {p['title']}: {p['excerpt'][:120]} (Tags: {p['tags']})"
            for p in posts_context[:15]
        ])

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are a friendly and knowledgeable AI assistant for a tech blog called "Sumeet's Blog".
You help readers find relevant articles, answer questions about topics covered in the blog, and provide helpful insights.

Blog content available:
{blog_summary}

Respond in a helpful, conversational tone. If the question is about a blog topic, reference relevant posts.
Keep responses concise (2-3 sentences max). Use plain text for post titles."""
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            max_tokens=200,
            temperature=0.7,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        logger.error(f"Groq chat error: {e}")
        return "I'm having trouble connecting to AI right now. Please try again later! 🤖"


def auto_tag_post(title, body):
    """
    Automatically generate 3-6 relevant tags for a blog post.
    Returns a comma-separated string of tags.
    """
    try:
        client = _get_groq_client()

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": f"""You are a blog tagging assistant. Generate 3-6 concise, lowercase tags for this blog post.

Title: {title}
Body excerpt: {body[:500]}

Rules:
- Tags must be lowercase, single words or hyphenated (e.g. machine-learning, not "Machine Learning")
- Be specific and relevant
- Return ONLY a comma-separated list (e.g. python,django,web-development,api)
- No explanation, just the tags"""
                }
            ],
            max_tokens=60,
            temperature=0.3,
        )

        tags = response.choices[0].message.content.strip()

        # Sanitize: lowercase, remove quotes
        tags_clean = ','.join([
            t.strip().lower().replace(' ', '-').strip('"\'')
            for t in tags.split(',')
            if t.strip()
        ])
        return tags_clean

    except Exception as e:
        logger.error(f"Groq auto-tag error: {e}")
        return ""