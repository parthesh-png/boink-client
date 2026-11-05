import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CreatePostCard from '../components/CreatePostCard';
import PostCard from '../components/PostCard';
import { Loader2 } from 'lucide-react';

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'mine'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (tab = activeTab) => {
    setLoading(true);
    try {
      const endpoint = tab === 'mine' ? '/posts/me' : '/posts';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
     <div className="flex justify-center items-center">
  <h2 className="text-lg font-bold tracking-wide
    bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500
    bg-clip-text text-transparent">
    🔥 What's Trending...
  </h2>
</div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Create Post Form */}
        <CreatePostCard onPostCreated={handlePostCreated} />

        {/* View Mode Tabs: View all posts / View own posts */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'mine'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Posts
          </button>
        </div>

        {/* Posts Stream */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
            {activeTab === 'mine' ? "You haven't created any posts yet." : "No posts yet. Be the first to post!"}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handlePostDeleted}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedPage;
