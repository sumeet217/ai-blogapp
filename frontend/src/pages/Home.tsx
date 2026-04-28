import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Zap, Brain, Tag } from 'lucide-react';
import { postsApi } from '../services/api';
import type { Post } from '../services/api';
import PostCard from '../components/PostCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    postsApi
      .getAll()
      .then((data) => setPosts(data.results))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered Blog Platform
          </div>

          <h1 className="hero-title">
            <span className="gradient-text">Ideas Worth</span>
            <br />
            Sharing
          </h1>

          <p className="hero-subtitle">
            Explore articles on technology, development, and innovation
            enhanced with AI-powered recommendations and an intelligent chatbot.
          </p>

          <motion.a
            href="#posts"
            className="hero-cta"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Explore Posts <ArrowDown size={16} />
          </motion.a>

          {/* AI Features callout */}
          <motion.div
            style={{
              display: 'flex', justifyContent: 'center', gap: '1.5rem',
              flexWrap: 'wrap', marginTop: '2.5rem',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[
              { icon: <Brain size={14} />, label: 'Smart Recommendations' },
              { icon: <Zap size={14} />, label: 'AI Chatbot' },
              { icon: <Tag size={14} />, label: 'Auto-Tagging' },
            ].map((feat) => (
              <div key={feat.label} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.78rem', color: 'var(--text-muted)',
              }}>
                <span style={{ color: 'var(--accent-blue)' }}>{feat.icon}</span>
                {feat.label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div>
            <div className="hero-stat-value gradient-text">{posts.length || '—'}</div>
            <div className="hero-stat-label">Articles</div>
          </div>
          <div>
            <div className="hero-stat-value gradient-text">AI</div>
            <div className="hero-stat-label">Powered</div>
          </div>
          <div>
            <div className="hero-stat-value gradient-text">∞</div>
            <div className="hero-stat-label">Insights</div>
          </div>
        </motion.div>
      </section>

      {/* ── Posts Grid ── */}
      <main className="posts-section" id="posts">
        <div className="section-header">
          <div>
            <div className="section-label">Latest Articles</div>
            <h2 className="section-title">Recent Posts</h2>
          </div>
          {!loading && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {posts.length} article{posts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card" style={{ padding: '1.75rem', height: '260px' }}>
                <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '8px', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '22px', width: '80%', marginBottom: '0.75rem' }} />
                <div className="skeleton" style={{ height: '14px', width: '100%', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '14px', width: '70%' }} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <div className="empty-state-title">Couldn't load posts</div>
            <p>Make sure the Django server is running on port 8000.</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No posts yet</div>
            <p>Create your first post in the <a href="/admin/" style={{ color: 'var(--accent-blue)' }}>Django admin</a>.</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <motion.div
            className="posts-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </motion.div>
        )}
      </main>
    </>
  );
};

export default Home;
