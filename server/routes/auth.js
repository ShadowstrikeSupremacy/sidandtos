const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../uploads/mailer');
const { db } = require('../database/init');
require('dotenv').config();

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    db.run(
      `INSERT INTO users (email, username, password) VALUES (?, ?, ?)`,
      [email, username, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '24h'
      });

      res.json({ 
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password (send OTP)
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    db.run(
      `UPDATE users SET otp_code = ?, otp_expires = ? WHERE email = ?`,
      [otpCode, otpExpires, email],
      function (err) {
        if (err) {
          console.error('Database error when updating OTP:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Email not found' });
        }

        // Log OTP for testing
        console.log(`\n=== OTP FOR TESTING ===`);
        console.log(`Email: ${email}`);
        console.log(`OTP Code: ${otpCode}`);
        console.log(`Expires: ${new Date(otpExpires)}`);
        console.log(`========================\n`);

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Password Reset OTP - Sidandtos',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
              <p>You requested a password reset for your Sidandtos account.</p>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0;">${otpCode}</h3>
                <p style="margin: 10px 0 0 0; color: #666;">Your verification code</p>
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          `
        };

        sendMail(mailOptions)
          .then(info => {
            console.log('📧 Email sent:', info.messageId);
            res.json({ message: 'OTP sent successfully to your email', email });
          })
          .catch(error => {
            console.log('❌ Email error:', error);
            res.json({
              message: 'OTP generated (email failed, check console for OTP)',
              email,
              otp: process.env.NODE_ENV !== 'production' ? otpCode : undefined
            });
          });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (
        !user ||
        user.otp_code !== otp ||
        Date.now() > user.otp_expires
      ) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Don't clear OTP here - keep it for password reset
      res.json({ 
        message: 'OTP verified successfully',
        verified: true,
        email: email
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (
        !user ||
        user.otp_code !== otp ||
        Date.now() > user.otp_expires
      ) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      db.run(
        `UPDATE users SET password = ?, otp_code = NULL, otp_expires = NULL WHERE email = ?`,
        [hashedPassword, email],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to reset password' });
          }
          res.json({ message: 'Password reset successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      res.json({ 
        valid: true, 
        user: decoded 
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
