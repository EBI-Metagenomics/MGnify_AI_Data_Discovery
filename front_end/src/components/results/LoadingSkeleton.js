import React from 'react';
import PropTypes from 'prop-types';
import { getText } from '../../utils/languageUtils';

/**
 * Loading skeleton component displayed while fetching data
 * 
 * @param {Object} props - Component props
 * @param {string} props.language - The selected language
 * @returns {JSX.Element} - Rendered component
 */
const LoadingSkeleton = ({ language }) => {
  return (
    <div className="loadingSkeleton">
      <p>{getText("loading...", "chargement...", "加载中...", language)}</p>
    </div>
  );
};

LoadingSkeleton.propTypes = {
  language: PropTypes.string.isRequired
};

export default LoadingSkeleton;