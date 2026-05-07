import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Home, Shield} from 'lucide-react';
import { postsApi } from '../services/api';
import type { Post } from '../services/api';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
      if (
        (searchRef.current && !searchRef.current.contains(e.target as Node)) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(e.target as Node))
      ) {
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
    setMobileOpen(false);
    navigate(`/post/${id}`);
  };

  /** Shared search results dropdown */
  const SearchResults = () => (
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
  );

  /** Shared search input */
  const SearchInput = () => (
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
  );

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

      {/* Desktop Search */}
      <div className="navbar-center" ref={searchRef} style={{ position: 'relative' }}>
        <SearchInput />
        <SearchResults />
      </div>

      {/* Desktop Nav Links */}
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

      </div>

      {/* Mobile hamburger toggle */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        className="mobile-menu-btn"
        aria-label="Toggle mobile menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile dropdown drawer */}
      <div className={`mobile-menu-drawer ${mobileOpen ? 'open' : ''}`}>
        {/* Mobile Search */}
        <div className="mobile-search-wrapper" ref={mobileSearchRef} style={{ position: 'relative' }}>
          <SearchInput />
          <SearchResults />
        </div>

        {/* Mobile Nav Links */}
        <div className="mobile-nav-links">
          <button className="mobile-nav-link" onClick={() => { setMobileOpen(false); navigate('/'); }}>
            <Home size={16} /> Home
          </button>
          <a
            className="mobile-nav-link"
            href="/admin/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Shield size={16} /> Admin Panel
          </a>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

