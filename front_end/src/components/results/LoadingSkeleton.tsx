import React from 'react';
import { getText } from '../../utils/languageUtils';

/**
 * Props for the LoadingSkeleton component
 */
interface LoadingSkeletonProps {
  language: string;
}

/**
 * Loading skeleton component displayed while fetching data
 * 
 * @param {LoadingSkeletonProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ language }) => {
  return (
    <div className="loadingSkeleton">
      <p>{getText("loading...", "chargement...", "加载中...", language)}</p>
    </div>
  );
};

export default LoadingSkeleton;