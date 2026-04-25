import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { postsApi } from '../services/api';
import type { Post } from '../services/api';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setResults([]); setShowResults(false); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await postsApi.search(value);
        setResults(data.results.slice(0, 5));
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const goToPost = (id: number) => {
    setShowResults(false);
    setQuery('');
    navigate(`/post/${id}`);
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <motion.div
        className="navbar-brand"
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="gradient-text">Sumeet</span>
        <span className="dot" />
        <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.95rem' }}>Blog</span>
      </motion.div>

      {/* Search */}
      <div className="navbar-center" ref={searchRef} style={{ position: 'relative' }}>
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Search posts…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
          />
          {searching && (
            <div style={{ position: 'absolute', right: '0.75rem', width: 14, height: 14,
              border: '2px solid var(--border)', borderTop: '2px solid var(--accent-blue)',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          )}
        </div>

        <AnimatePresence>
          {showResults && results.length > 0 && (
            <motion.div
              className="search-results"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {results.map((post) => (
                <div
                  key={post.id}
                  className="search-result-item"
                  onClick={() => goToPost(post.id)}
                >
                  <div className="search-result-title">{post.title}</div>
                  <div className="search-result-excerpt">
                    {post.excerpt || post.body?.slice(0, 80)}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          {showResults && results.length === 0 && query && !searching && (
            <motion.div
              className="search-results"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <div className="search-result-item" style={{ color: 'var(--text-muted)' }}>
                No results for "{query}"
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Links */}
      <div className="navbar-links">
        <button className="navbar-link" onClick={() => navigate('/')}>Home</button>
        <a
          className="navbar-link"
          href="/admin/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-purple)' }}
        >
          Admin
        </a>
        <button
          className="navbar-link"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
            borderRadius: 'var(--radius-pill)', padding: '0.35rem 0.9rem',
            color: 'var(--accent-blue)', cursor: 'default' }}
        >
          <span style={{ fontSize: '0.65rem' }}>✦</span> AI Powered
        </button>
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)',
          cursor: 'pointer', padding: '0.25rem' }}
        className="mobile-menu-btn"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </nav>
  );
};

export default Navbar;
