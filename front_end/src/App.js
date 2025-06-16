import { useState } from 'react';
import './App.css';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism, dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function formatJSON(obj) {
  if (!obj) return "{}";
  try {
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return "{}";
  }
} 

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chosenModel, setChosenModel] = useState('DeepSeek');
  const [language, setLanguage] = useState('en'); // 'en' for English, 'fr' for French
  const [loading, setLoading] = useState(false);
  const [returnVisible, setReturnVisible] = useState(false);
  const [codeClicked, setCodeClicked] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [dataGot, setDataGot] = useState({
    accession: '',
    code: '',
    error: '',
    traceback: '',
    output: ''
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleModelChoice = (e) => {
    setChosenModel(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setReturnVisible(false);

    document.getElementById("submitBtn").disabled = true; 
    document.getElementById("input").disabled = true;
    document.getElementById("models").disabled = true;

    setLoading(true);
    generateResult();
  };

  async function generateResult() {
   const backendPort = process.env.REACT_APP_BACKEND_PORT || 5000;
   const backendUrl = `http://localhost:${backendPort}/code`;
   const payload = { model: chosenModel, query: searchQuery, language: language };

   try {
     const postResponse = await fetch(backendUrl, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(payload),
     });

     // Handle HTTP errors
     if (!postResponse.ok) {
       const errorData = await postResponse.json();
       setDataGot({
         accession: {},
         code: '',
         error: errorData.error ? 
           (errorData.error.message || 'An error occurred with the server request') : 
           `Server error: ${postResponse.status} ${postResponse.statusText}`,
         errorType: errorData.error ? errorData.error.type : 'ServerError',
         errorDetails: errorData.error ? errorData.error.details : null
       });
     } else {
       // Process successful response
       const responseData = await postResponse.json();
       setDataGot({
         accession: responseData.accession || {},
         code: responseData.code || '',
         error: responseData.error || '',
         traceback: responseData.traceback || '',
         output: responseData.output || '',
         errorType: responseData.error && responseData.error.type ? responseData.error.type : '',
         errorDetails: responseData.error && responseData.error.details ? responseData.error.details : null
       });
     }
   } catch (error) {
     // Handle network errors or other exceptions
     console.error("Error fetching data:", error);
     setDataGot({
       accession: {},
       code: '',
       error: `Network error: ${error.message || 'Could not connect to the server'}`,
       errorType: 'NetworkError',
       errorDetails: { message: error.toString() }
     });
   } finally {
     setLoading(false);
     // Re-enable inputs/buttons
     document.getElementById("submitBtn").disabled = false;
     document.getElementById("input").disabled = false;
     document.getElementById("models").disabled = false;

     setReturnVisible(true);
   }
  }

  function LoadingSkeleton() {
    return (
      <div className="loadingSkeleton">
        <p>{language === "en" ? "loading..." : "chargement..."}</p>
      </div>
    );
  }

  function ReturnComponents() {
    return (
      <div className="returnSection">
        <WriteResponse />
        <div className="code-show">
          <p>{language === "en" ? "Advanced:" : "Avancé :"}</p>
          <button id="apiBtn" onClick={handleCodeClick} type="button">
            {language === "en" 
              ? "Click here to show/hide the code we generated" 
              : "Cliquez ici pour afficher/masquer le code que nous avons généré"}
          </button>
          {codeClicked && <CodeWindow />}
        </div>
      </div>
    );
  }

  function WriteResponse() {
    // Handle error cases with improved error display
    if (dataGot.error) {
      return (
        <div className="return-line error-container">
          <h4>{language === "en" ? "Error" : "Erreur"}</h4>
          <div className="error-message">
            <p><strong>{dataGot.errorType || (language === "en" ? 'Error' : 'Erreur')}:</strong> {dataGot.error}</p>

            {/* Show additional error details if available */}
            {dataGot.errorDetails && (
              <div className="error-details">
                <h5>{language === "en" ? "Additional Information:" : "Informations supplémentaires :"}</h5>

                {/* Show line number if available */}
                {dataGot.errorDetails.line_number && (
                  <p><strong>{language === "en" ? "Error at line:" : "Erreur à la ligne :"}</strong> {dataGot.errorDetails.line_number}</p>
                )}

                {/* Show code context with line numbers if available */}
                {dataGot.errorDetails.code_context && (
                  <div className="error-code-context">
                    <p><strong>{language === "en" ? "Code Context:" : "Contexte du code :"}</strong></p>
                    <pre className="error-code-with-lines">{dataGot.errorDetails.code_context}</pre>
                  </div>
                )}

                {/* Show full code if available and no context is provided */}
                {dataGot.errorDetails.code && !dataGot.errorDetails.code_context && (
                  <div className="error-code-preview">
                    <p><strong>{language === "en" ? "Generated Code:" : "Code généré :"}</strong></p>
                    <SyntaxHighlighter
                      language="python"
                      style={isDark ? dark : prism}
                      customStyle={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        fontSize: "0.8em",
                        borderRadius: "6px",
                        padding: "0.5em"
                      }}
                      showLineNumbers={true}
                      startingLineNumber={1}
                    >
                      {dataGot.errorDetails.code}
                    </SyntaxHighlighter>
                  </div>
                )}

                {dataGot.errorDetails.output && (
                  <div>
                    <p><strong>{language === "en" ? "Output:" : "Sortie :"}</strong></p>
                    <pre className="error-output">{dataGot.errorDetails.output}</pre>
                  </div>
                )}

                {/* Show suggestions based on error type */}
                <div className="error-suggestions">
                  <p><strong>{language === "en" ? "Suggestions:" : "Suggestions :"}</strong></p>
                  {dataGot.errorType === 'ValidationError' && (
                    <p>{language === "en" ? "Please check your query format and try again." : "Veuillez vérifier le format de votre requête et réessayer."}</p>
                  )}
                  {dataGot.errorType === 'NetworkError' && (
                    <p>{language === "en" ? "Please check your internet connection and try again." : "Veuillez vérifier votre connexion internet et réessayer."}</p>
                  )}
                  {dataGot.errorType === 'DeepSeekAPIError' && (
                    <p>{language === "en" ? "There was an issue with the DeepSeek API. Try using ChatGPT model instead." : "Il y a eu un problème avec l'API DeepSeek. Essayez d'utiliser le modèle ChatGPT à la place."}</p>
                  )}
                  {dataGot.errorType === 'OpenAIAPIError' && (
                    <p>{language === "en" ? "There was an issue with the OpenAI API. Try using DeepSeek model instead." : "Il y a eu un problème avec l'API OpenAI. Essayez d'utiliser le modèle DeepSeek à la place."}</p>
                  )}
                  {dataGot.errorType === 'SyntaxError' && (
                    <p>{language === "en" ? "The generated code contains syntax errors. Try rephrasing your query." : "Le code généré contient des erreurs de syntaxe. Essayez de reformuler votre requête."}</p>
                  )}
                  {dataGot.errorType === 'ExecutionError' && (
                    <p>{language === "en" ? "There was an error executing the generated code. Try being more specific in your query." : "Une erreur s'est produite lors de l'exécution du code généré. Essayez d'être plus précis dans votre requête."}</p>
                  )}
                  {dataGot.errorType === 'TranslationError' && (
                    <p>{language === "en" ? "There was an error translating your query. Please try again or use English." : "Une erreur s'est produite lors de la traduction de votre requête. Veuillez réessayer ou utiliser l'anglais."}</p>
                  )}
                  {!['ValidationError', 'NetworkError', 'DeepSeekAPIError', 'OpenAIAPIError', 'SyntaxError', 'ExecutionError', 'TranslationError'].includes(dataGot.errorType) && (
                    <p>{language === "en" ? "Try rephrasing your query or selecting a different model." : "Essayez de reformuler votre requête ou de sélectionner un modèle différent."}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Handle successful results
    if (
      dataGot.accession &&
      typeof dataGot.accession === 'object' &&
      Object.keys(dataGot.accession).length > 0
    ) {
      return (
        <div className="return-line">
          <h4>{language === "en" ? "Analysis Results (JSON):" : "Résultats d'analyse (JSON) :"}</h4>
          <SyntaxHighlighter
            language="json"
            style={isDark ? dark : prism}
            customStyle={{
              maxHeight: "500px",
              overflowY: "auto",
              fontSize: "0.9em",
              borderRadius: "6px",
              padding: "1em"
            }}
          >
            {formatJSON(dataGot.accession)}
          </SyntaxHighlighter>
        </div>
      );
    }

    if (typeof dataGot.accession === 'string' && dataGot.accession) {
      const url = `https://www.ebi.ac.uk/metagenomics/analysis/${dataGot.accession}#overview`;
      return (
        <div className="return-line">
          <p>
            {language === "en" ? "Click" : "Cliquez"}{" "}
            <a href={url} target="_blank" rel="noopener noreferrer">
              {language === "en" ? "here" : "ici"}
            </a>{" "}
            {language === "en" 
              ? `to view the ${dataGot.accession} data.` 
              : `pour voir les données de ${dataGot.accession}.`}
          </p>
        </div>
      );
    }

    return (
      <div className="return-line">
        <p>{language === "en" ? "No results available." : "Aucun résultat disponible."}</p>
      </div>
    );
  }

  function CodeWindow() {
    if (!dataGot.code) return null;
    return (
      <div id="code-container">
        <h4>{language === "en" ? "Generated Python Code" : "Code Python généré"}</h4>
        <SyntaxHighlighter
          language="python"
          id="code-show"
          style={isDark ? dark : prism}
        >
          {dataGot.code}
        </SyntaxHighlighter>
      </div>
    );
  }

  const handleCodeClick = () => setCodeClicked(!codeClicked);

  // Dynamically set flex direction based on whether results/loading skeleton are visible
  const layoutClass = returnVisible || loading

  return (
    <div className={`app-container`} 
         layout-class={layoutClass ? "horizontal" : "vertical"} 
         data-theme={isDark ? "dark" : "light"}>
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

      <div className="search-wrapper">
        <div className="ebi-header">
          European Bioinformatics Institute
        </div>
        <h1>Search our dataset - in English or French.</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="input">{language === "en" ? "What are you searching for?" : "Que recherchez-vous ?"}</label>
          <input
            id="input"
            type="text"
            placeholder={language === "en" ? "I want data on..." : "Je veux des données sur..."}
            value={searchQuery}
            onChange={handleSearchChange}
            required
          />
          <label htmlFor="models">{language === "en" ? "Select a model to search with:" : "Sélectionnez un modèle pour la recherche :"}</label>
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

          <label htmlFor="language">{language === "en" ? "Select language:" : "Sélectionnez la langue :"}</label>
          <select
            className="models"
            name="language"
            id="language"
            onChange={handleLanguageChange}
            value={language}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>

          <button id="submitBtn" type="submit">
            {language === "en" ? "Get Results" : "Obtenir les résultats"}
          </button>
        </form>
      </div>
      <div className="return-wrapper">
        {loading && <LoadingSkeleton />}
        {returnVisible && <ReturnComponents />}
      </div>
    </div>
  );
}

export default App;
