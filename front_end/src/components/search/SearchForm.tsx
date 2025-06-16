import React, { ChangeEvent, FormEvent } from 'react';
import { getText } from '../../utils/languageUtils';
import { 
  FormInput, 
  FormSelect, 
  FormTextarea 
} from '../form';

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

  const modelOptions = [
    { value: 'DeepSeek', label: 'DeepSeek' },
    { value: 'ChatGPT', label: 'ChatGPT' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'zh', label: '中文' }
  ];

  return (
    <div className="search-wrapper">
      <div className="ebi-header">
        <span className="ebi-header-section">MGnify</span> - Metagenomics Search Tool
      </div>
      <h1>Search our dataset - in English, French or Chinese.</h1>

      <form className="vf-stack vf-stack--400" onSubmit={handleSubmit}>
        <FormInput
          id="input"
          label={getText("What are you seaffwfwrching for?", "Que recherchez-vous ?", "您在搜索什么？", language)}
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={getText("I want data on...", "Je veux des données sur...", "我想要关于...的数据", language)}
          helperText={getText("Enter your search query", "Entrez votre requête de recherche", "输入您的搜索查询", language)}
          required={true}
        />

        <FormSelect
          id="models"
          label={getText("Select a model to search with:", "Sélectionnez un modèle pour la recherche :", "选择搜索模型:", language)}
          options={modelOptions}
          value={chosenModel}
          onChange={handleModelChoice}
        />

        <FormSelect
          id="language"
          label={getText("Select language:", "Sélectionnez la langue :", "选择语言:", language)}
          options={languageOptions}
          value={language}
          onChange={handleLanguageChange}
        />

        <button id="submitBtn" type="submit" className="vf-button vf-button--primary">
          {getText("Get Results", "Obtenir les résultats", "获取结果", language)}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
