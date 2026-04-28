import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Home />
              </motion.div>
            }
          />
          <Route
            path="/post/:id"
            element={
              <motion.div key="post" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <PostDetail />
              </motion.div>
            }
          />
          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <motion.div
                key="404"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                style={{ textAlign: 'center', padding: '6rem 2rem' }}
              >
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🌌</div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                  Page Not Found
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                  This page doesn't exist in our universe.
                </p>
                <a
                  href="/"
                  style={{
                    background: 'var(--gradient-accent)',
                    color: 'white',
                    padding: '0.7rem 1.75rem',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                  }}
                >
                  Go Home
                </a>
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>

      {/* Footer */}
      <footer className="footer">
        <div>
          © 2026 <span className="footer-highlight">Sumeet's Blog</span>. All rights reserved.
        </div>
        <div className="footer-ai-badge">
          ✦ Content recommendations, chatbot &amp; auto-tagging powered by AI
        </div>
      </footer>

      {/* Floating AI Chatbot */}
      <Chatbot />
    </BrowserRouter>
  );
};

export default App;
