import React from 'react';

/**
 * Props for the ThemeToggle component
 */
interface ThemeToggleProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Theme toggle component for switching between light and dark mode
 * 
 * @param {ThemeToggleProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, setIsDark }) => {
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

export default ThemeToggle;