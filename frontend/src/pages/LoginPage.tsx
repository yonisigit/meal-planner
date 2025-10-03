import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlanHeading from '../components/PlanMealHeading';
import api from '../lib/axios';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const [mode, setMode] = useState<'idle' | 'login' | 'signup'>('idle');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit() {
    setLoading(true);
    setError(null);
    // client-side validation
    if (!username || !password) {
      toast.error('Please enter both username and password');
      setLoading(false);
      return;
    }
    if (username.length < 4) {
      toast.error('Username must be at least 4 characters');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    try {
      if (mode === 'signup') {
        // create the account first
        await api.post('/auth/signup', { username, password });
      }

      // always attempt login (either after signup or when mode === 'login')
      const loginRes = await api.post('/auth/login', { username, password });

      // save returned user id in localStorage for now (will replace with proper auth later)
      const id = loginRes?.data?.id;
      try {
        if (id) localStorage.setItem('userId', String(id));
      } catch {
        // ignore localStorage errors
      }

      toast.success(mode === 'login' ? 'Logged in' : 'Signed up and logged in');
      navigate('/home');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Request failed';
      // friendly messages for common cases
      if (e?.response?.status === 401) {
        toast.error('Invalid username or password');
      } else {
        toast.error(msg);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <PlanHeading />

        {mode === 'idle' && (
          <div className="flex flex-col gap-2">
            <button className="btn btn-primary" onClick={() => setMode('login')}>Login</button>
            <button className="btn btn-primary text-sm" onClick={() => setMode('signup')}>Sign up</button>
          </div>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <div className="card p-4 shadow mt-4">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="input input-bordered w-full mb-2" />
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input input-bordered w-full mb-4" />

            <div className="flex items-center gap-2">
              <button className="btn btn-primary" onClick={() => submit()} disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign up'}
              </button>
              <button className="btn btn-ghost" onClick={() => setMode('idle')} disabled={loading}>Cancel</button>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        )}
        <Toaster />
      </div>
    </div>
  );
}

export default LoginPage;
