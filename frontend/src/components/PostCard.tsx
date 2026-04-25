import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../services/api';
import TagBadge from './TagBadge';

const POST_ICONS = ['✦', '◈', '⬡', '⊕', '◉', '⬢', '◆', '▸'];

interface PostCardProps {
  post: Post;
  index: number;
}

const PostCard: React.FC<PostCardProps> = ({ post, index }) => {
  const navigate = useNavigate();
  const icon = POST_ICONS[index % POST_ICONS.length];

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <motion.article
      className="post-card glass-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/post/${post.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="post-card-header">
        <div className="post-card-icon">{icon}</div>
        <div className="post-card-meta">
          <User size={12} />
          {post.author || 'Sumeet'}
          <span className="post-card-meta-dot" />
          <Clock size={12} />
          {post.reading_time}
        </div>
      </div>

      <h2 className="post-card-title">{post.title}</h2>
      <p className="post-card-excerpt">
        {post.excerpt || post.body?.slice(0, 180) + '…'}
      </p>

      <div className="post-card-footer">
        <div className="post-card-tags">
          {post.tags_list.slice(0, 3).map((tag, i) => (
            <TagBadge key={tag} tag={tag} index={i} />
          ))}
        </div>
        <span className="post-card-cta">
          Read <ArrowRight size={13} />
        </span>
      </div>
    </motion.article>
  );
};

export default PostCard;
