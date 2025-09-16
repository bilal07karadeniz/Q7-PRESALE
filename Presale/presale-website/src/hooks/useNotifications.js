// ══════════════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS MANAGEMENT HOOK
// ══════════════════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';

/**
 * Custom Hook for Managing Application Notifications
 *
 * Provides a complete notification system for user feedback throughout the application.
 * Handles notification creation, removal, and automatic cleanup with consistent behavior.
 *
 * Features:
 * - Automatic ID generation for each notification
 * - Auto-removal with configurable duration
 * - Multiple notification types (success, error, info, warning)
 * - Manual removal capability
 * - Bulk clear functionality
 * - Transaction hash support for blockchain operations
 *
 * Notification Structure:
 * {
 *   id: string,           // Unique identifier
 *   type: string,         // 'success' | 'error' | 'info' | 'warning'
 *   title: string,        // Notification title
 *   message: string,      // Notification content
 *   duration: number,     // Auto-dismiss time in milliseconds
 *   txHash?: string       // Optional transaction hash for blockchain operations
 * }
 *
 * @returns {Object} Notification management interface
 */
export const useNotifications = () => {
  // ────────────────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ────────────────────────────────────────────────────────────────────────────────────

  /** Array of active notifications */
  const [notifications, setNotifications] = useState([]);

  // ────────────────────────────────────────────────────────────────────────────────────
  // NOTIFICATION REMOVAL
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Remove a specific notification by ID
   *
   * Filters out the notification with matching ID from the active notifications array.
   * Used both manually (user clicking close) and automatically (timeout).
   *
   * @param {string} id - Unique notification ID to remove
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // ────────────────────────────────────────────────────────────────────────────────────
  // NOTIFICATION CREATION
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Add a new notification to the system
   *
   * Creates a notification with automatic ID generation and setup for auto-removal.
   * Supports all notification types and optional properties.
   *
   * @param {Object} notification - Notification configuration
   * @param {string} notification.type - Type: 'success', 'error', 'info', 'warning'
   * @param {string} notification.title - Notification title
   * @param {string} notification.message - Notification content
   * @param {number} [notification.duration=5000] - Auto-dismiss time in ms
   * @param {string} [notification.txHash] - Optional transaction hash
   * @returns {string} Generated notification ID
   */
  const addNotification = useCallback((notification) => {
    // Generate unique ID for this notification
    const id = Math.random().toString(36).substr(2, 9);

    // Set default duration if not provided
    const duration = notification.duration || 5000; // 5 seconds default

    // Create complete notification object with defaults
    const newNotification = {
      id,
      type: 'info',          // Default type
      title: '',             // Default empty title
      message: '',           // Default empty message
      duration,
      ...notification,       // Override with provided properties
    };

    // Add to notifications array
    setNotifications(prev => [...prev, newNotification]);

    // Set up automatic removal after specified duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);

    // Return ID for potential manual removal
    return id;
  }, [removeNotification]);

  // ────────────────────────────────────────────────────────────────────────────────────
  // BULK OPERATIONS
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Clear all active notifications
   *
   * Removes all notifications from the system at once.
   * Useful for cleanup or reset scenarios.
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ────────────────────────────────────────────────────────────────────────────────────
  // HOOK INTERFACE
  // ────────────────────────────────────────────────────────────────────────────────────

  return {
    /** Current array of active notifications */
    notifications,

    /** Function to add a new notification */
    addNotification,

    /** Function to remove a specific notification by ID */
    removeNotification,

    /** Function to clear all notifications */
    clearAllNotifications,
  };
};