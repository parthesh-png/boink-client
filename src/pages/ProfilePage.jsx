import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import EditProfileModal from '../components/EditProfileModal';
import { Edit3, UserPlus, UserCheck, Lock, Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const { id: paramId } = useParams();
  const { user: currentUser, updateUserLocal } = useAuth();
  
  const targetId = paramId || currentUser?._id;
  const isOwnProfile = currentUser && targetId === currentUser._id;

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfileAndPosts = async () => {
    setLoading(true);
    try {
      const userRes = await api.get(`/users/${targetId}`);
      if (userRes.data.success) {
        setProfileUser(userRes.data.user);
      }

      const postsRes = await api.get(`/posts/user/${targetId}`);
      if (postsRes.data.success) {
        setUserPosts(postsRes.data.posts || []);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      fetchProfileAndPosts();
    }
  }, [targetId]);

  const isFollowing = currentUser?.following?.some(
    (id) => (typeof id === 'string' ? id : id._id) === targetId
  );

  const handleToggleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);

    try {
      const res = await api.post(`/users/${targetId}/follow`);
      if (res.data.success) {
        const nextIsFollowing = res.data.isFollowing;

        // Update target user followers list in state
        setProfileUser((prev) => ({
          ...prev,
          followers: nextIsFollowing
            ? [...(prev.followers || []), currentUser._id]
            : (prev.followers || []).filter((id) => (id._id || id) !== currentUser._id),
        }));

        // Update logged in user following list in AuthContext
        updateUserLocal((prev) => {
          const currentFollowing = prev?.following || [];
          const updated = nextIsFollowing
            ? [...currentFollowing, targetId]
            : currentFollowing.filter((id) => id !== targetId);
          return { ...prev, following: updated };
        });
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setUserPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handleProfileUpdated = (updatedUser) => {
    setProfileUser((prev) => ({
      ...prev,
      name: updatedUser.name,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-20 text-slate-500">User not found</div>
      </div>
    );
  }

  const avatarUrl =
    profileUser.profilePicture ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${profileUser.name}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Details Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={avatarUrl}
                alt={profileUser.name}
                className="w-16 h-16 rounded-full object-cover border border-slate-200"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profileUser.name}`;
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900">{profileUser.name}</h1>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <span>{profileUser.email}</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">
                    <Lock className="w-2.5 h-2.5" /> Readonly
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Action: Edit Profile or Follow */}
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isFollowing
                    ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                }`}
              >
                {followLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Bio */}
          {profileUser.bio && (
            <p className="mt-4 text-sm text-slate-700 leading-relaxed">
              {profileUser.bio}
            </p>
          )}

          {/* Stats: Posts, Followers, Following */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100 text-sm">
            <div>
              <span className="font-bold text-slate-900">{userPosts.length}</span>{' '}
              <span className="text-slate-500 text-xs">Posts</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">{profileUser.followers?.length || 0}</span>{' '}
              <span className="text-slate-500 text-xs">Followers</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">{profileUser.following?.length || 0}</span>{' '}
              <span className="text-slate-500 text-xs">Following</span>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {isOwnProfile ? 'My Posts' : `${profileUser.name}'s Posts`}
          </h2>

          {userPosts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
              No posts found.
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handlePostDeleted}
              />
            ))
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default ProfilePage;
