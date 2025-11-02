import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or localStorage
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem('resetEmail');
    
    if (emailFromState) {
      setEmail(emailFromState);
      localStorage.setItem('resetEmail', emailFromState);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // If no email found, redirect to forgot password
      navigate('/forgot-password');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (timeLeft > 0 && step === 'verify') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setError('OTP has expired. Please request a new one.');
    }
  }, [timeLeft, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await axios.post('/api/auth/verify-otp', { email, otp });
      setMessage('OTP verified successfully! Now you can reset your password.');
      setStep('reset');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      setMessage('Password reset successfully! You can now sign in with your new password.');
      localStorage.removeItem('resetEmail');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setMessage('New OTP sent to your email');
      setTimeLeft(600); // Reset timer
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="container">
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="text-center mb-4">
              <h1 style={{ color: '#333', marginBottom: '8px' }}>Verify OTP</h1>
              <p className="text-muted">Enter the 6-digit code sent to {email}</p>
              {timeLeft > 0 && (
                <p style={{ color: '#667eea', fontWeight: '600' }}>
                  Code expires in: {formatTime(timeLeft)}
                </p>
              )}
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

            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label className="form-label">Enter OTP Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="123456"
                  maxLength={6}
                  style={{ 
                    textAlign: 'center', 
                    fontSize: '24px', 
                    letterSpacing: '8px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '16px' }}
                disabled={loading || timeLeft === 0}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={handleResendOTP}
                className="btn btn-secondary"
                style={{ marginRight: '10px' }}
                disabled={loading}
              >
                Resend OTP
              </button>
              <Link to="/forgot-password" style={{ color: '#667eea', textDecoration: 'none' }}>
                Change Email
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
          <div className="text-center mb-4">
            <h1 style={{ color: '#333', marginBottom: '8px' }}>Reset Password</h1>
            <p className="text-muted">Enter your new password</p>
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

          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '16px' }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
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

export default OTPVerification;
