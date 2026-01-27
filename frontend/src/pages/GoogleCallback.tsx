import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function GoogleCallback() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        setError('Google sign-in was cancelled or failed');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        const response = await api.post('/auth/google/callback', {
          code,
          redirectUri: `${window.location.origin}/auth/google/callback`
        });

        setToken(response.data.token);
        setUser(response.data.user);
        navigate('/');
      } catch (err: any) {
        console.error('Google auth error:', err);
        setError(err.response?.data?.error || 'Authentication failed');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [navigate, setToken, setUser]);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {error ? (
          <>
            <h2>Authentication Failed</h2>
            <p style={{ color: '#c33' }}>{error}</p>
            <p>Redirecting to login...</p>
          </>
        ) : (
          <>
            <h2>Signing you in...</h2>
            <div style={{ margin: '20px 0' }}>
              <div className="spinner"></div>
            </div>
            <p>Please wait...</p>
          </>
        )}
      </div>
    </div>
  );
}
