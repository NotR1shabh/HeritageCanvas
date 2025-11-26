// client/src/components/AuthForm.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';

/*
  Patch summary:
  - Trim inputs, validate email format
  - Console.log inputs for debugging
  - Friendly error mapping for common Firebase auth codes
  - Forgot password handler that calls sendPasswordResetEmail
  - Disable buttons while requests are in-flight
*/

const isValidEmail = (v) => {
  if (!v || typeof v !== 'string') return false;
  const s = v.trim();
  // basic RFC-like check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
};

export default function AuthForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [message, setMessage] = useState(null);

  const clearMessage = () => setMessage(null);

  const showMessage = (txt) => {
    setMessage(txt);
    // clear after some time for UX
    setTimeout(() => {
      setMessage(null);
    }, 6000);
  };

  const mapAuthError = (err) => {
    if (!err || !err.code) return err?.message || 'Unknown error';
    switch (err.code) {
      case 'auth/invalid-email': return 'Invalid email address. Use format name@example.com';
      case 'auth/user-not-found': return 'No account found for that email. Please sign up first.';
      case 'auth/wrong-password': return 'Incorrect password. Try again or reset your password.';
      case 'auth/email-already-in-use': return 'Email already registered. Try logging in or reset password.';
      case 'auth/weak-password': return 'Password too weak. Use at least 6 characters.';
      case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
      case 'auth/network-request-failed': return 'Network error — check your connection.';
      default:
        return err.message || err.code || 'Authentication error';
    }
  };

  const debugLog = (label, payload) => {
    try {
      // keep logs terse
      // DO NOT log passwords in production — only for dev troubleshooting.
      console.log(`[AuthForm] ${label}`, { email: payload.email, passwordLength: payload.password?.length });
    } catch (e) {}
  };

  const handleSignIn = async (e) => {
    e && e.preventDefault();
    clearMessage();

    const em = (email || '').trim();
    const pw = (password || '').toString();

    debugLog('attempt-signin', { email: em, password: pw });

    if (!em || !pw) {
      showMessage('Please enter both email and password.');
      return;
    }
    if (!isValidEmail(em)) {
      showMessage('Please enter a valid email address (example: name@example.com).');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, em, pw);
      showMessage('Signed in successfully.');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 500);
      }
    } catch (err) {
      const userMsg = mapAuthError(err);
      showMessage(userMsg);
      console.error('signIn error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e && e.preventDefault();
    clearMessage();

    const em = (email || '').trim();
    const pw = (password || '').toString();

    debugLog('attempt-signup', { email: em, password: pw });

    if (!em || !pw) {
      showMessage('Please enter an email and password to sign up.');
      return;
    }
    if (!isValidEmail(em)) {
      showMessage('Please enter a valid email address.');
      return;
    }
    if (pw.length < 6) {
      showMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, em, pw);
      showMessage('Account created — you are now signed in.');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 500);
      }
    } catch (err) {
      const userMsg = mapAuthError(err);
      showMessage(userMsg);
      console.error('signUp error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    clearMessage();
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showMessage('Signed in with Google.');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 500);
      }
    } catch (err) {
      const userMsg = mapAuthError(err);
      showMessage(userMsg);
      console.error('googleSignIn error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    clearMessage();
    const em = (email || '').trim();
    if (!em) {
      showMessage('Enter your email above and click "Forgot password" to receive a reset email.');
      return;
    }
    if (!isValidEmail(em)) {
      showMessage('Please enter a valid email address before requesting a password reset.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, em);
      showMessage('Password reset email sent — check your inbox.');
    } catch (err) {
      const userMsg = mapAuthError(err);
      showMessage(userMsg);
      console.error('forgotPassword error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 14, maxWidth: 520 }}>
      <h2 style={{ marginTop: 0, opacity: 0.9 }}>{mode === 'login' ? 'Login' : 'Create account'}</h2>

      {message && (
        <div style={{ marginBottom: 12, padding: 10, background: '#fff3cd', borderRadius: 6, color: '#665b00' }}>
          {message}
        </div>
      )}

      <form onSubmit={mode === 'login' ? handleSignIn : handleSignUp}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', fontSize: 13 }}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="name@example.com"
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 13 }}>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Your password"
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#2b7cff',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={mode === 'login' ? handleSignIn : handleSignUp}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            style={{
              background: '#fff',
              border: '1px solid #111',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            {loading ? '…' : 'Sign in with Google'}
          </button>

          <div style={{ marginLeft: 'auto', fontSize: 13 }}>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              disabled={loading}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2b7cff',
                cursor: 'pointer'
              }}
            >
              {mode === 'login' ? 'Create account' : 'Back to login'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleForgot}
            disabled={loading}
            style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer' }}
          >
            Forgot password?
          </button>
          <div style={{ fontSize: 12, color: '#999' }}>We will never share your data publicly.</div>
        </div>
      </form>
    </div>
  );
}
