import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { login } from '../services/api';

export default function LoginModal({ onClose, onSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const loginStore = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      toast.error('請輸入密碼 / Please enter passcode');
      return;
    }
    setLoading(true);
    try {
      const { student, token } = await login(passcode);
      loginStore(student, token);
      onSuccess?.();
    } catch (err) {
      toast.error('登入失敗 / Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>登入 / Login</h2>
        <p className="modal-hint">Demo: 輸入任意密碼即可進入 / Enter any passcode for demo</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="密碼 / Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose}>取消</button>
            <button type="submit" disabled={loading}>{loading ? '登入中...' : '登入'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
