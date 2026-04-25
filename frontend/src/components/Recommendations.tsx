import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { postsApi } from '../services/api';
import type { Post } from '../services/api';

interface RecommendationsProps {
  postId: number;
}

const Recommendations: React.FC<RecommendationsProps> = ({ postId }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadedPostId, setLoadedPostId] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const loading = loadedPostId !== postId;

  useEffect(() => {
    let ignore = false;

    postsApi
      .getRecommendations(postId)
      .then((data) => {
        if (ignore) return;
        setPosts(data.recommendations);
        setError(false);
      })
      .catch(() => {
        if (ignore) return;
        setPosts([]);
        setError(true);
      })
      .finally(() => {
        if (!ignore) setLoadedPostId(postId);
      });

    return () => {
      ignore = true;
    };
  }, [postId]);

  if (loading) {
    return (
      <div className="sidebar-card glass-card">
        <div className="sidebar-card-title">
          <Sparkles size={14} /> AI Recommendations
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.5rem 0' }}>
          <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
          Gemini is thinking…
        </div>
      </div>
    );
  }

  if (error || posts.length === 0) {
    return (
      <div className="sidebar-card glass-card">
        <div className="sidebar-card-title">
          <Sparkles size={14} /> You May Also Like
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {error ? 'Could not load recommendations.' : 'No related posts found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="sidebar-card glass-card">
      <div className="sidebar-card-title">
        <Sparkles size={14} /> AI Picks for You
      </div>
      <AnimatePresence>
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            className="rec-item"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            onClick={() => navigate(`/post/${post.id}`)}
          >
            <div className="rec-item-title">{post.title}</div>
            <div className="rec-item-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={11} /> {post.reading_time}
              <ArrowRight size={11} style={{ marginLeft: 'auto' }} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div style={{ marginTop: '0.75rem', fontSize: '0.68rem', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Sparkles size={10} /> Powered by Gemini AI
      </div>
    </div>
  );
};

export default Recommendations;
