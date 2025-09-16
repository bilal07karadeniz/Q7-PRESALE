// ══════════════════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ══════════════════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import PresaleWidget from './components/PresaleWidget';
import NotificationSystem from './components/NotificationSystem';
import Footer from './components/Footer';
import { useNotifications } from './hooks/useNotifications';
import './config/wagmi'; // Initialize AppKit for wallet connections
import './App.css';

/**
 * Main Application Component
 *
 * This is the root component that orchestrates the entire presale interface.
 * It handles:
 * - Background particle animations for visual appeal
 * - Global notification system for user feedback
 * - Layout structure with header, main content, and footer
 * - Wallet connection initialization through AppKit
 *
 * @returns {JSX.Element} The complete application interface
 */
function App() {
  // Initialize notification system for user feedback throughout the app
  const { notifications, addNotification, removeNotification } = useNotifications();

  /**
   * Background Animation Effect
   *
   * Creates floating particles that continuously appear and disappear
   * to provide an engaging visual background. Each particle has:
   * - Random horizontal position (0-100% of screen width)
   * - Random animation duration (2-5 seconds)
   * - Random opacity (0.1-0.6 for subtle effect)
   * - Random scale (0.5-1.0 for size variation)
   */
  useEffect(() => {
    /**
     * Creates a single animated particle element
     * The particle will automatically remove itself after 5 seconds
     */
    const createParticle = () => {
      // Create new div element for the particle
      const particle = document.createElement('div');
      particle.className = 'particle';

      // Apply random styling for unique appearance
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
      particle.style.opacity = Math.random() * 0.5 + 0.1;
      particle.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;

      // Add particle to page
      document.body.appendChild(particle);

      // Clean up particle after animation completes
      setTimeout(() => {
        particle.remove();
      }, 5000);
    };

    // Create new particles every 300ms for continuous effect
    const particleInterval = setInterval(createParticle, 300);

    // Cleanup interval when component unmounts
    return () => clearInterval(particleInterval);
  }, []);

  return (
    <div className="app">
      {/* Global notification system - appears over all content */}
      <NotificationSystem
        notifications={notifications}
        removeNotification={removeNotification}
      />

      {/* Animated gradient background */}
      <div className="background-gradient"></div>

      {/* Main content container */}
      <div className="app-container">
        <PresaleWidget addNotification={addNotification} />
      </div>

      {/* Footer with additional information */}
      <Footer />
    </div>
  );
}

export default App;
