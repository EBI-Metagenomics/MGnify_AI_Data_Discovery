import React from 'react';
import PropTypes from 'prop-types';
import { getText } from '../../utils/languageUtils';

/**
 * Search form component for entering a query and selecting options
 * 
 * @param {Object} props - Component props
 * @param {string} props.searchQuery - The current search query
 * @param {Function} props.setSearchQuery - Function to update the search query
 * @param {string} props.chosenModel - The currently selected model
 * @param {Function} props.setChosenModel - Function to update the chosen model
 * @param {string} props.language - The selected language
 * @param {Function} props.setLanguage - Function to update the language
 * @param {Function} props.handleSubmit - Function to handle form submission
 * @returns {JSX.Element} - Rendered component
 */
const SearchForm = ({
  searchQuery,
  setSearchQuery,
  chosenModel,
  setChosenModel,
  language,
  setLanguage,
  handleSubmit
}) => {
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleModelChoice = (e) => {
    setChosenModel(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="search-wrapper">
      <div className="ebi-header">
        <span className="ebi-header-section">MGnify</span> - Metagenomics Search Tool
      </div>
      <h1>Search our dataset - in English, French or Chinese.</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="input">
          {getText("What are you searching for?", "Que recherchez-vous ?", "您在搜索什么？", language)}
        </label>
        <input
          id="input"
          type="text"
          placeholder={getText("I want data on...", "Je veux des données sur...", "我想要关于...的数据", language)}
          value={searchQuery}
          onChange={handleSearchChange}
          required
        />
        <label htmlFor="models">
          {getText("Select a model to search with:", "Sélectionnez un modèle pour la recherche :", "选择搜索模型:", language)}
        </label>
        <select
          className="models"
          name="models"
          id="models"
          onChange={handleModelChoice}
          value={chosenModel}
        >
          <option value="DeepSeek">DeepSeek</option>
          <option value="ChatGPT">ChatGPT</option>
        </select>

        <label htmlFor="language">
          {getText("Select language:", "Sélectionnez la langue :", "选择语言:", language)}
        </label>
        <select
          className="models"
          name="language"
          id="language"
          onChange={handleLanguageChange}
          value={language}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="zh">中文</option>
        </select>

        <button id="submitBtn" type="submit">
          {getText("Get Results", "Obtenir les résultats", "获取结果", language)}
        </button>
      </form>
    </div>
  );
};

SearchForm.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  chosenModel: PropTypes.string.isRequired,
  setChosenModel: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  setLanguage: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

export default SearchForm;