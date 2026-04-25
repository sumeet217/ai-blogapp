import React from 'react';

interface TagBadgeProps {
  tag: string;
  index?: number;
}

const TAG_COLORS = ['blue', 'purple', 'cyan', 'pink'] as const;

const TagBadge: React.FC<TagBadgeProps> = ({ tag, index = 0 }) => {
  const color = TAG_COLORS[index % TAG_COLORS.length];
  return (
    <span className={`tag-badge tag-badge-${color}`}>
      #{tag}
    </span>
  );
};

export default TagBadge;
