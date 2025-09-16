// ══════════════════════════════════════════════════════════════════════════════════════
// NOTIFICATION SYSTEM COMPONENT
// ══════════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NotificationSystem.css';

/**
 * Global Notification System Component
 *
 * Provides a comprehensive notification system for user feedback throughout the app.
 * Displays different types of notifications with appropriate styling and animations.
 *
 * Notification Types:
 * - Success: Confirms successful operations (green, 🎉)
 * - Error: Shows errors and failures (red, ❌)
 * - Info: Provides information and updates (blue, ℹ️)
 * - Warning: Alerts about potential issues (yellow, ⚠️)
 *
 * Features:
 * - Smooth entrance/exit animations
 * - Auto-dismiss with progress bar
 * - Manual close option
 * - Transaction hash links to Etherscan
 * - Stacked display for multiple notifications
 * - Responsive design for mobile devices
 *
 * @param {Object} props
 * @param {Array} props.notifications - Array of notification objects
 * @param {Function} props.removeNotification - Function to remove a notification by ID
 * @returns {JSX.Element} The notification system overlay
 */
const NotificationSystem = ({ notifications, removeNotification }) => {
  return (
    <div className="notification-container">
      {/* AnimatePresence handles smooth animations when notifications are added/removed */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            className={`notification ${notification.type}`}
            // ═══ ENTRANCE ANIMATION ═══
            initial={{
              opacity: 0,        // Start invisible
              x: 300,           // Start from right side of screen
              scale: 0.3        // Start small
            }}
            // ═══ VISIBLE STATE ═══
            animate={{
              opacity: 1,        // Fully visible
              x: 0,             // In final position
              scale: 1          // Full size
            }}
            // ═══ EXIT ANIMATION ═══
            exit={{
              opacity: 0,        // Fade out
              x: 300,           // Slide to right
              scale: 0.5        // Shrink slightly
            }}
            transition={{
              duration: 0.4,     // 400ms animation
              ease: "backOut"    // Bouncy easing for satisfying feel
            }}
          >
            {/* Notification icon based on type */}
            <div className="notification-icon">
              {notification.type === 'success' && '🎉'}   {/* Success celebration */}
              {notification.type === 'error' && '❌'}      {/* Error indicator */}
              {notification.type === 'info' && 'ℹ️'}       {/* Information */}
              {notification.type === 'warning' && '⚠️'}    {/* Warning alert */}
            </div>

            {/* Main notification content */}
            <div className="notification-content">
              {/* Notification title */}
              <h4>{notification.title}</h4>

              {/* Notification message */}
              <p>{notification.message}</p>

              {/* Optional transaction hash link for blockchain operations */}
              {notification.txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${notification.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-link"
                >
                  View on Etherscan →
                </a>
              )}
            </div>

            {/* Manual close button */}
            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
              aria-label="Close notification"
            >
              ×
            </button>

            {/* Auto-dismiss timer visualization */}
            <div className="notification-timer">
              <motion.div
                className="timer-bar"
                initial={{ width: '100%' }}               // Start full width
                animate={{ width: '0%' }}                 // Shrink to zero
                transition={{
                  duration: notification.duration / 1000, // Convert ms to seconds
                  ease: "linear"                          // Consistent timing
                }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;