// ══════════════════════════════════════════════════════════════════════════════════════
// FOOTER COMPONENT
// ══════════════════════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import './Footer.css';

/**
 * Application Footer Component
 *
 * A simple, elegant footer that appears at the bottom of the application.
 * Features a developer credit with smooth entrance animation that appears
 * after the main content has loaded.
 *
 * Design Features:
 * - Delayed entrance animation for polish
 * - Minimal, clean design that doesn't distract from main content
 * - Decorative heart element for personal touch
 * - Responsive typography and spacing
 *
 * @returns {JSX.Element} The application footer
 */
const Footer = () => {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0, y: 20 }}    // Start invisible and below position
      animate={{ opacity: 1, y: 0 }}     // Fade in and slide to final position
      transition={{
        delay: 1,                         // Wait 1 second after page load
        duration: 0.6                     // Smooth 600ms animation
      }}
    >
      <div className="footer-content">
        {/* Developer credit text */}
        <span className="made-by">Made by</span>

        {/* Developer name */}
        <span className="developer-name">Bilal Karadeniz</span>

        {/* Decorative element */}
        <div className="footer-decoration">
          <span className="heart">♥</span>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;