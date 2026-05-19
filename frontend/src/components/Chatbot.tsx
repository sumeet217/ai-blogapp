import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { postsApi } from '../services/api';


interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
}

const WELCOME_MSG: Message = {
  id: 0,
  role: 'bot',
  text: "Hi! I'm your AI blog assistant, Ask me anything about the articles here, or let me help you find what you're looking for!",
};

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await postsApi.chat(text);
      const botMsg: Message = {
        id: Date.now() + 1,
        role: 'bot',
        text: data.reply,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          text: "Oops, I couldn't connect to the AI right now. Please try again! 🔌",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        className="chatbot-trigger"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI chatbot"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageSquare size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-avatar">🤖</div>
                <div>
                  <div className="chatbot-header-name">Blog AI Assistant</div>
                  <div className="chatbot-header-status">
                    <span className="chatbot-status-dot" />
                    Powered by GROQ
                  </div>
                </div>
              </div>
              <button className="chatbot-close" onClick={() => setOpen(false)}>
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="chatbot-messages">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`chat-message ${msg.role === 'user' ? 'chat-message-user' : 'chat-message-bot'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {msg.role === 'bot' ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  className="chat-typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="chat-typing-dot" />
                  <div className="chat-typing-dot" />
                  <div className="chat-typing-dot" />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chatbot-input-area">
              <input
                ref={inputRef}
                className="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any post…"
                disabled={loading}
              />
              <button
                className="chatbot-send"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;