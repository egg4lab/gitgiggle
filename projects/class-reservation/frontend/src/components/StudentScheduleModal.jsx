import React from 'react';
import { motion } from 'framer-motion';

export default function StudentScheduleModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="schedule-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="schedule-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="schedule-modal-header">
          <h2>我的行程 / My Schedule</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="modal-hint">點擊日曆上的空檔可預約 1-on-1 課程。Demo 模式下此為示意。</p>
      </motion.div>
    </motion.div>
  );
}
