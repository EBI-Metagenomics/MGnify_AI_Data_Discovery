import React, {useState, FormEvent} from 'react';
import './App.css';

// Import components
import ThemeToggle from './components/layout/ThemeToggle';
import SearchForm from './components/search/SearchForm';
import LoadingSkeleton from './components/results/LoadingSkeleton';
import {ResultsContainer} from './components/results/ResultDisplay';

// Import services
import {generateSearchResults} from './services/api';

// Import types
import {ResultResponse, SearchResultData} from './types';
import EBIHeader from "./components/layout/EBIHeader";
import EBIFooter from "./components/layout/EBIFooter";
import EBIHero from "./components/layout/EBIHero";

/**
 * Main application component
 *
 * @returns {JSX.Element} - Rendered application
 */
function App(): JSX.Element {
    // State for search form
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [chosenModel, setChosenModel] = useState<string>('DeepSeek');
    const [language, setLanguage] = useState<string>('en');

    // State for UI
    const [loading, setLoading] = useState<boolean>(false);
    const [returnVisible, setReturnVisible] = useState<boolean>(false);
    const [isDark, setIsDark] = useState<boolean>(false);

    // State for search results
    const [dataGot, setDataGot] = useState<SearchResultData>({
        accession: '',
        code: '',
        error: '',
        traceback: '',
        output: '',
        errorType: '',
        errorDetails: {}
    });

    /**
     * Handle form submission
     *
     * @param {FormEvent<HTMLFormElement>} e - Form submit event
     */
    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setReturnVisible(false);

        // Disable form elements during search
        const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
        const inputField = document.getElementById("input") as HTMLInputElement;
        const modelsSelect = document.getElementById("models") as HTMLSelectElement;

        if (submitBtn) submitBtn.disabled = true;
        if (inputField) inputField.disabled = true;
        if (modelsSelect) modelsSelect.disabled = true;

        setLoading(true);
        generateResult();
    };

    /**
     * Generate search results by calling the API service
     */
    const generateResult = async (): Promise<void> => {
        try {
            const result: ResultResponse = await generateSearchResults({
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
                errorType: result.errorType || '',
                errorDetails: result.errorDetails || {}
            });
        } catch (error: any) {
            console.error("Error in generateResult:", error);
            setDataGot({
                accession: {},
                code: '',
                error: `Application error: ${error.message || 'Unknown error'}`,
                errorType: 'ApplicationError',
                errorDetails: {message: error.toString()},
                traceback: '',
                output: ''
            });
        } finally {
            setLoading(false);

            // Re-enable form elements
            const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
            const inputField = document.getElementById("input") as HTMLInputElement;
            const modelsSelect = document.getElementById("models") as HTMLSelectElement;

            if (submitBtn) submitBtn.disabled = false;
            if (inputField) inputField.disabled = false;
            if (modelsSelect) modelsSelect.disabled = false;

            setReturnVisible(true);
        }
    };

    // Dynamically set flex direction based on whether results/loading skeleton are visible
    const layoutClass = returnVisible || loading;

    return (
        <>
            <EBIHeader/>
            <EBIHero
                heading={{
                    text: 'MGnify AI-Powered Data Discovery Platform\n',
                    link: 'JavaScript:Void(0);'
                }}
                subheading="Search our dataset - in English, French or Chinese."
                text="The MGnify AI-Powered Data Discovery Platform is a cutting-edge tool designed to help researchers and scientists explore and analyze metagenomic data. By leveraging advanced AI models, it enables users to uncover insights from complex datasets, facilitating breakthroughs in microbiome research and beyond."
                textLinks={[
                    {
                        text: 'systems–level approaches',
                        link: 'JavaScript:Void(0);'
                    },
                    {
                        text: 'gene expression',
                        link: 'JavaScript:Void(0);'
                    },
                    {
                        text: 'cell metabolism',
                        link: 'JavaScript:Void(0);'
                    }
                ]}
                callToAction={{
                    text: 'Learn more',
                    link: 'JavaScript:Void(0);'
                }}/>
            <div
                className={`app-container`}
                layout-className={layoutClass ? "horizontal" : "vertical"}
                data-theme={isDark ? "'dark'" : "light"}
            >
                {/*<ThemeToggle isDark={isDark} setIsDark={setIsDark}/>*/}

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
                    {loading && <LoadingSkeleton language={language}/>}
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
