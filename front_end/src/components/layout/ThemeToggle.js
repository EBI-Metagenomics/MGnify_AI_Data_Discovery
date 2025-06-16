import React from 'react';
import PropTypes from 'prop-types';

/**
 * Theme toggle component for switching between light and dark mode
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isDark - Whether dark mode is enabled
 * @param {Function} props.setIsDark - Function to toggle dark mode
 * @returns {JSX.Element} - Rendered component
 */
const ThemeToggle = ({ isDark, setIsDark }) => {
  return (
    <div className="theme-toggle">
      <input
        type="checkbox"
        id="check"
        className="toggle"
        onChange={() => setIsDark(!isDark)}
        checked={isDark}
      />
      <label className="toggleAnim" htmlFor="check"></label>
    </div>
  );
};

ThemeToggle.propTypes = {
  isDark: PropTypes.bool.isRequired,
  setIsDark: PropTypes.func.isRequired
};

export default ThemeToggle;