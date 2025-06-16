import React from 'react';
import PropTypes from 'prop-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism, dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getText } from '../../utils/languageUtils';

/**
 * Component for displaying generated Python code
 * 
 * @param {Object} props - Component props
 * @param {string} props.code - The code to display
 * @param {boolean} props.isDark - Whether dark mode is enabled
 * @param {string} props.language - The selected language
 * @returns {JSX.Element} - Rendered component
 */
const CodeWindow = ({ code, isDark, language }) => {
  if (!code) return null;
  
  return (
    <div id="code-container">
      <h4>{getText("Generated Python Code", "Code Python généré", "生成的Python代码", language)}</h4>
      <SyntaxHighlighter
        language="python"
        id="code-show"
        style={isDark ? dark : prism}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

CodeWindow.propTypes = {
  code: PropTypes.string,
  isDark: PropTypes.bool.isRequired,
  language: PropTypes.string.isRequired
};

export default CodeWindow;