from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Post
from .serializers import PostSerializer, PostListSerializer
from . import ai_utils


class PostListView(APIView):
    """GET /api/posts/ — List all blog posts."""

    def get(self, request):
        posts = Post.objects.all()
        serializer = PostListSerializer(posts, many=True)
        return Response({
            'count': posts.count(),
            'results': serializer.data,
        })


class PostDetailView(APIView):
    """GET /api/posts/<id>/ — Single post detail."""

    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        serializer = PostSerializer(post)
        return Response(serializer.data)


class PostRecommendationsView(APIView):
    """GET /api/posts/<id>/recommendations/ — AI-powered related posts."""

    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        all_posts = list(Post.objects.all())
        recommended = ai_utils.get_recommendations(post, all_posts)
        serializer = PostListSerializer(recommended, many=True)
        return Response({
            'recommendations': serializer.data,
            'source': 'gemini-ai',
        })


class AutoTagView(APIView):
    """POST /api/posts/<id>/autotag/ — Auto-generate tags via AI."""

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        tags = ai_utils.auto_tag_post(post.title, post.body)
        if tags:
            post.tags = tags
            post.save()
            return Response({
                'success': True,
                'tags': tags,
                'tags_list': post.get_tags_list(),
            })
        return Response(
            {'success': False, 'error': 'Could not generate tags'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )


class ChatbotView(APIView):
    """POST /api/chat/ — AI chatbot grounded in blog content."""

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Provide blog context to Gemini
        posts = Post.objects.all()[:15]
        posts_context = [
            {
                'title': p.title,
                'excerpt': p.excerpt,
                'tags': p.tags,
            }
            for p in posts
        ]

        ai_response = ai_utils.get_chat_response(user_message, posts_context)
        return Response({
            'message': user_message,
            'reply': ai_response,
            'source': 'gemini-ai',
        })


class SearchView(APIView):
    """GET /api/search/?q=query — Search posts by title, body, tags."""

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'results': [], 'query': ''})

        posts = Post.objects.filter(
            title__icontains=query
        ) | Post.objects.filter(
            body__icontains=query
        ) | Post.objects.filter(
            tags__icontains=query
        )
        posts = posts.distinct().order_by('-created_at')
        serializer = PostListSerializer(posts, many=True)
        return Response({
            'query': query,
            'count': posts.count(),
            'results': serializer.data,
        })