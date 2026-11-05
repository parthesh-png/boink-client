import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { editProfileSchema } from '../schemas/validation';
import { X, Lock, Loader2, AlertCircle, Upload } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ general: 'Image must be under 5MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result); // Base64 data URL
      };
      reader.readAsDataURL(file);
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = editProfileSchema.safeParse({ name, bio, profilePicture });
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const updated = await updateProfile({ name, bio, profilePicture });
      if (onProfileUpdated) onProfileUpdated(updated);
      onClose();
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || err.message || 'Failed to update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errors.general && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Profile Picture Upload & Preview */}
          <div className="flex items-center gap-4">
            <img
              src={profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${name || 'User'}`}
              alt="Avatar preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 bg-slate-50"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${name || 'User'}`;
              }}
            />

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>
              <p className="text-[11px] text-slate-400 mt-1">Select an image from your computer</p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Name (min 3 chars)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              placeholder="Your full name"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm outline-none ${
                errors.name ? 'border-rose-400' : 'border-slate-200 focus:bg-white focus:border-indigo-500'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          {/* Email (READONLY) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <span>Email</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px]">
                <Lock className="w-2.5 h-2.5" /> Readonly
              </span>
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              disabled
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed outline-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a little about yourself..."
              maxLength={500}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditProfileModal;
