import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Calendar, Sparkles, Tag, Zap } from 'lucide-react';
import { postsApi } from '../services/api';
import type { Post } from '../services/api';
import TagBadge from '../components/TagBadge';
import Recommendations from '../components/Recommendations';

type PostState = {
  id: string | null;
  post: Post | null;
  error: boolean;
};

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [postState, setPostState] = useState<PostState>({
    id: null,
    post: null,
    error: false,
  });
  const [tagging, setTagging] = useState(false);
  const [tagSuccess, setTagSuccess] = useState(false);
  const { post, error } = postState;
  const loading = postState.id !== (id ?? null);

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    postsApi
      .getById(Number(id))
      .then((data) => {
        if (ignore) return;
        setPostState({ id, post: data, error: false });
        setTagSuccess(false);
      })
      .catch(() => {
        if (!ignore) setPostState({ id, post: null, error: true });
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleAutoTag = async () => {
    if (!post || tagging) return;
    setTagging(true);
    try {
      const data = await postsApi.autoTag(post.id);
      if (data.success) {
        setPostState((prev) => ({
          ...prev,
          post: prev.post ? { ...prev.post, tags: data.tags, tags_list: data.tags_list } : prev.post,
        }));
        setTagSuccess(true);
        setTimeout(() => setTagSuccess(false), 3000);
      }
    } catch {
      // silent fail
    } finally {
      setTagging(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div className="skeleton" style={{ width: '120px', height: '16px', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ width: '70%', height: '48px', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ width: '40%', height: '16px', marginBottom: '2rem' }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: i % 3 === 0 ? '85%' : '100%', height: '16px', marginBottom: '0.75rem' }} />
        ))}
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="empty-state" style={{ marginTop: '4rem' }}>
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">Post not found</div>
        <button
          onClick={() => navigate('/')}
          style={{ marginTop: '1rem', background: 'var(--gradient-accent)', border: 'none',
            color: 'white', padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-pill)',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="post-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Main Article */}
      <article>
        <motion.button
          className="post-detail-back"
          onClick={() => navigate('/')}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ArrowLeft size={15} /> Back to all posts
        </motion.button>

        <motion.h1
          className="post-detail-title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {post.title}
        </motion.h1>

        <motion.div
          className="post-detail-meta"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="post-detail-meta-item">
            <User size={13} /> {post.author || 'Sumeet'}
          </span>
          <span className="post-detail-meta-item">
            <Calendar size={13} /> {formatDate(post.created_at)}
          </span>
          <span className="post-detail-meta-item">
            <Clock size={13} /> {post.reading_time}
          </span>
        </motion.div>

        {/* Tags Row */}
        {post.tags_list.length > 0 && (
          <motion.div
            className="post-detail-tags"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {post.tags_list.map((tag, i) => (
              <TagBadge key={tag} tag={tag} index={i} />
            ))}
          </motion.div>
        )}

        {/* AI Auto-tag button */}
        <motion.div
          style={{ marginBottom: '2rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleAutoTag}
            disabled={tagging}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: tagSuccess
                ? 'rgba(74, 222, 128, 0.1)'
                : 'rgba(167,139,250,0.1)',
              border: `1px solid ${tagSuccess ? 'rgba(74,222,128,0.3)' : 'rgba(167,139,250,0.25)'}`,
              color: tagSuccess ? '#4ade80' : 'var(--accent-purple)',
              borderRadius: 'var(--radius-pill)',
              padding: '0.35rem 0.9rem',
              fontSize: '0.75rem', fontWeight: 600,
              cursor: tagging ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              opacity: tagging ? 0.6 : 1,
            }}
          >
            {tagging ? (
              <><Zap size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating tags…</>
            ) : tagSuccess ? (
              <><Tag size={12} /> Tags updated! ✓</>
            ) : (
              <><Sparkles size={12} /> AI Auto-Tag</>
            )}
          </button>
        </motion.div>

        {/* Article Body */}
        <motion.div
          className="post-detail-body"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {post.body}
        </motion.div>
      </article>

      {/* Sidebar */}
      <aside className="sidebar">
        {id && <Recommendations postId={Number(id)} />}

        {/* About card */}
        <div className="sidebar-card glass-card">
          <div className="sidebar-card-title">
            <User size={14} /> About the Author
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: 48, height: 48, background: 'var(--gradient-accent)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
            }}>
              S
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{post.author || 'Sumeet'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Software Developer & Blogger</div>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Writing about technology, development, and building cool things. Powered by Django + React + Gemini AI.
          </p>
        </div>
      </aside>
    </motion.div>
  );
};

export default PostDetail;
