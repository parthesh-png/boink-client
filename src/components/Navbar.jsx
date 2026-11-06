import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Home, LogOut, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setSearching(false);
      return undefined;
    }

    let active = true;
    setSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await api.get('/users/search', { params: { q: query } });
        if (active) setSearchResults(res.data.users || []);
      } catch {
        if (active) setSearchResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        
        {/* Brand */}
        <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
            <h1 className="text-3xl font-black tracking-tight
  bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500
  bg-clip-text text-transparent">
  B♡INK..
</h1>
        </Link>

        <div className="relative mx-2 min-w-0 flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or ID"
            aria-label="Search people by name or user ID"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 focus:bg-white"
          />
          {searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {searching ? (
                <p className="px-3 py-3 text-xs text-slate-500">Searching...</p>
              ) : searchResults.length ? (
                searchResults.map((result) => (
                  <button
                    key={result._id}
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      navigate(`/profile/${result._id}`);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <img
                      src={result.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${result.name}`}
                      alt=""
                      className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-slate-800">{result.name}</span>
                      <span className="block truncate text-[10px] text-slate-400">{result._id}</span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-3 text-xs text-slate-500">No people found.</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>

          {user && (
            <Link
              to={`/profile/${user._id}`}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <img
                src={user.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`;
                }}
              />
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors ml-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
