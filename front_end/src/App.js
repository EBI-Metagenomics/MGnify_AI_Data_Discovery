import React, { useState } from 'react';
import './App.css';

// Import components
import ThemeToggle from './components/layout/ThemeToggle';
import EBIHeader from './components/layout/EBIHeader';
import SearchForm from './components/search/SearchForm';
import LoadingSkeleton from './components/results/LoadingSkeleton';

import { ResultsContainer } from './components/results/ResultDisplay';
// Import services
import { generateSearchResults } from './services/api';
import EBIFooter from "./components/layout/EBIFooter";

/**
 * Main application component
 * 
 * @returns {JSX.Element} - Rendered application
 */
function App() {
  // State for search form
  const [searchQuery, setSearchQuery] = useState('');
  const [chosenModel, setChosenModel] = useState('DeepSeek');
  const [language, setLanguage] = useState('en');

  // State for UI
  const [loading, setLoading] = useState(false);
  const [returnVisible, setReturnVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // State for search results
  const [dataGot, setDataGot] = useState({
    accession: '',
    code: '',
    error: '',
    traceback: '',
    output: ''
  });

  /**
   * Handle form submission
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setReturnVisible(false);

    // Disable form elements during search
    document.getElementById("submitBtn").disabled = true; 
    document.getElementById("input").disabled = true;
    document.getElementById("models").disabled = true;

    setLoading(true);
    generateResult();
  };

  /**
   * Generate search results by calling the API service
   */
  const generateResult = async () => {
    try {
      const result = await generateSearchResults({
        model: chosenModel,
        query: searchQuery,
        language: language
      });

      setDataGot({
        accession: result.accession,
        code: result.code,
        error: result.error,
        traceback: result.traceback,
        output: result.output,
        errorType: result.errorType,
        errorDetails: result.errorDetails
      });
    } catch (error) {
      console.error("Error in generateResult:", error);
      setDataGot({
        accession: {},
        code: '',
        error: `Application error: ${error.message || 'Unknown error'}`,
        errorType: 'ApplicationError',
        errorDetails: { message: error.toString() }
      });
    } finally {
      setLoading(false);

      // Re-enable form elements
      document.getElementById("submitBtn").disabled = false;
      document.getElementById("input").disabled = false;
      document.getElementById("models").disabled = false;

      setReturnVisible(true);
    }
  };

  // Dynamically set flex direction based on whether results/loading skeleton are visible
  const layoutClass = returnVisible || loading;

  return (
      <>
        <EBIHeader/>
            <div
      className={`app-container`}
      layout-class={layoutClass ? "horizontal" : "vertical"}
      data-theme={isDark ? "dark" : "light"}
    >
      <ThemeToggle isDark={isDark} setIsDark={setIsDark} />

      <SearchForm
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        chosenModel={chosenModel}
        setChosenModel={setChosenModel}
        language={language}
        setLanguage={setLanguage}
        handleSubmit={handleSubmit}
      />

      <div className="return-wrapper">
        {loading && <LoadingSkeleton language={language} />}
        {returnVisible && (
          <ResultsContainer
            data={dataGot}
            isDark={isDark}
            language={language}
          />
        )}
      </div>
    </div>
        <EBIFooter/>
      </>
  );
}

export default App;
