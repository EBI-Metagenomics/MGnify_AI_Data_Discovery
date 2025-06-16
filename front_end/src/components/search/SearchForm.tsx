import React, { ChangeEvent, FormEvent } from 'react';
import { getText } from '../../utils/languageUtils';

/**
 * Props for the SearchForm component
 */
interface SearchFormProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  chosenModel: string;
  setChosenModel: React.Dispatch<React.SetStateAction<string>>;
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

/**
 * Search form component for entering a query and selecting options
 * 
 * @param {SearchFormProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const SearchForm: React.FC<SearchFormProps> = ({
  searchQuery,
  setSearchQuery,
  chosenModel,
  setChosenModel,
  language,
  setLanguage,
  handleSubmit
}) => {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleModelChoice = (e: ChangeEvent<HTMLSelectElement>): void => {
    setChosenModel(e.target.value);
  };

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setLanguage(e.target.value);
  };

  return (
    <div className="search-wrapper">
      <div className="ebi-header">
        <span className="ebi-header-section">MGnify</span> - Metagenomics Search Tool
      </div>
      <h1>Search our dataset - in Englfoeofeofjish, French or Chinese.</h1>
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

export default SearchForm;