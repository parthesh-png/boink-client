import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { createPostSchema } from '../schemas/validation';
import { Image, Upload, X, Loader2, AlertCircle } from 'lucide-react';

const CreatePostCard = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ general: 'Image must be under 5MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Base64 data URL
      };
      reader.readAsDataURL(file);
      setErrors({});
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = createPostSchema.safeParse({ text, image });
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] || 'general'] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/posts', { text, image });
      if (res.data.success) {
        setText('');
        setImage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onPostCreated) onPostCreated(res.data.post);
      }
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || 'Failed to create post.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (errors.text) setErrors((prev) => ({ ...prev, text: null }));
          }}
          placeholder={`What's happening, ${user?.name ? user.name.split(' ')[0] : 'there'}?`}
          className="w-full text-slate-800 placeholder-slate-400 text-sm outline-none resize-none"
        />

        {/* Error notification */}
        {(errors.text || errors.general) && (
          <p className="text-xs text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.text || errors.general}</span>
          </p>
        )}

        {/* Image Preview if selected */}
        {image && (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-60 bg-slate-50">
            <img src={image} alt="Preview" className="w-full h-auto max-h-60 object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {/* Direct Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || (!text.trim() && !image.trim())}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            <span>Post</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostCard;
