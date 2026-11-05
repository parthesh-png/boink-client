import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerSchema } from '../schemas/validation';
import { User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse({ name, email, password });
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
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || err.message || 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign up for Emilo Mini Social Platform
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Name (min 3 chars)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="Your full name"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm outline-none transition-colors ${
                  errors.name ? 'border-rose-400' : 'border-slate-200 focus:bg-white focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Valid Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="name@example.com"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm outline-none transition-colors ${
                  errors.email ? 'border-rose-400' : 'border-slate-200 focus:bg-white focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password (min 6 chars)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                placeholder="At least 6 characters"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm outline-none transition-colors ${
                  errors.password ? 'border-rose-400' : 'border-slate-200 focus:bg-white focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? 'Registering...' : 'Register'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
