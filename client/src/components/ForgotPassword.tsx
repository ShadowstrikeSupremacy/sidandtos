import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setMessage('OTP sent to your email! Please check your inbox.');
      // Store email for OTP verification step
      localStorage.setItem('resetEmail', email);
      // Navigate to OTP verification after a short delay
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
          <div className="text-center mb-4">
            <h1 style={{ color: '#333', marginBottom: '8px' }}>Forgot Password</h1>
            <p className="text-muted">Enter your email to reset your password</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '16px' }}
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>

          <div className="text-center">
            <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
