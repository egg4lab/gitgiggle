import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { bookSession } from '../services/api';

export default function BookingModal({ slot, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const student = useAuthStore((s) => s.student);

  const handleConfirm = async () => {
    if (!slot || !student) return;
    setLoading(true);
    try {
      await bookSession(student.studentId, slot.startTime.toISOString(), slot.location);
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!slot) return null;

  const timeStr = slot.startTime.toLocaleString('zh-TW', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
        <h2>確認預約 / Confirm Booking</h2>
        <p><strong>時段 / Time:</strong> {timeStr}</p>
        <p><strong>地點 / Location:</strong> {slot.location}</p>
        <p className="modal-hint">1-on-1 課程 100 分鐘</p>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>取消</button>
          <button type="button" onClick={handleConfirm} disabled={loading}>
            {loading ? '預約中...' : '確認預約'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
