import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Heart, Trash2 } from 'lucide-react';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(() => {
    return post.likes?.some((like) => {
      const id = typeof like === 'string' ? like : like._id;
      return id === user?._id;
    });
  });
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = user && post.author && (post.author._id === user._id || post.author === user._id);

  const handleToggleLike = async () => {
    // Optimistic toggle
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await api.post(`/posts/${post._id}/like`);
      if (res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/posts/${post._id}`);
      if (res.data.success && onDelete) {
        onDelete(post._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post.');
    } finally {
      setDeleting(false);
    }
  };

  const author = post.author || {};
  const authorName = author.name || 'User';
  const authorAvatar =
    author.profilePicture ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${authorName}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      {/* Author Row */}
      <div className="flex items-center justify-between mb-3">
        <Link
          to={`/profile/${author._id || author}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
            onError={(e) => {
              e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${authorName}`;
            }}
          />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{authorName}</h3>
            <p className="text-xs text-slate-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Link>

        {/* Delete button: only for author */}
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete post"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Text */}
      {post.text && (
        <p className="text-sm text-slate-800 leading-relaxed mb-3 whitespace-pre-line">
          {post.text}
        </p>
      )}

      {/* Post Image */}
      {post.image && (
        <div className="mb-3 rounded-xl overflow-hidden border border-slate-100 max-h-96">
          <img
            src={post.image}
            alt="Post media"
            className="w-full h-auto object-cover max-h-96"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Likes Button */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
            isLiked ? 'text-rose-600 font-semibold' : 'text-slate-600 hover:text-rose-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
          <span>{likesCount}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
