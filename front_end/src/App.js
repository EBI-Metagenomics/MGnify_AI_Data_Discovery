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

  // Helper function to get text based on selected language
  const getText = (en, fr, zh) => {
    if (language === "en") return en;
    if (language === "fr") return fr;
    if (language === "zh") return zh;
    return en; // Default to English
  };

  function LoadingSkeleton() {
    return (
      <div className="loadingSkeleton">
        <p>{getText("loading...", "chargement...", "加载中...")}</p>
      </div>
    );
  }

  function ReturnComponents() {
    return (
      <div className="returnSection">
        <WriteResponse />
        <div className="code-show">
          <p>{getText("Advanced:", "Avancé :", "高级:")}</p>
          <button id="apiBtn" onClick={handleCodeClick} type="button">
            {getText(
              "Click here to show/hide the code we generated", 
              "Cliquez ici pour afficher/masquer le code que nous avons généré",
              "点击此处显示/隐藏我们生成的代码"
            )}
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
          <h4>{getText("Error", "Erreur", "错误")}</h4>
          <div className="error-message">
            <p><strong>{dataGot.errorType || getText('Error', 'Erreur', '错误')}:</strong> {dataGot.error}</p>

            {/* Show additional error details if available */}
            {dataGot.errorDetails && (
              <div className="error-details">
                <h5>{getText("Additional Information:", "Informations supplémentaires :", "附加信息:")}</h5>

                {/* Show line number if available */}
                {dataGot.errorDetails.line_number && (
                  <p><strong>{getText("Error at line:", "Erreur à la ligne :", "错误行号:")}</strong> {dataGot.errorDetails.line_number}</p>
                )}

                {/* Show code context with line numbers if available */}
                {dataGot.errorDetails.code_context && (
                  <div className="error-code-context">
                    <p><strong>{getText("Code Context:", "Contexte du code :", "代码上下文:")}</strong></p>
                    <pre className="error-code-with-lines">{dataGot.errorDetails.code_context}</pre>
                  </div>
                )}

                {/* Show full code if available and no context is provided */}
                {dataGot.errorDetails.code && !dataGot.errorDetails.code_context && (
                  <div className="error-code-preview">
                    <p><strong>{getText("Generated Code:", "Code généré :", "生成的代码:")}</strong></p>
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
                    <p><strong>{getText("Output:", "Sortie :", "输出:")}</strong></p>
                    <pre className="error-output">{dataGot.errorDetails.output}</pre>
                  </div>
                )}

                {/* Show suggestions based on error type */}
                <div className="error-suggestions">
                  <p><strong>{getText("Suggestions:", "Suggestions :", "建议:")}</strong></p>
                  {dataGot.errorType === 'ValidationError' && (
                    <p>{getText(
                      "Please check your query format and try again.", 
                      "Veuillez vérifier le format de votre requête et réessayer.",
                      "请检查您的查询格式并重试。"
                    )}</p>
                  )}
                  {dataGot.errorType === 'NetworkError' && (
                    <p>{getText(
                      "Please check your internet connection and try again.", 
                      "Veuillez vérifier votre connexion internet et réessayer.",
                      "请检查您的网络连接并重试。"
                    )}</p>
                  )}
                  {dataGot.errorType === 'DeepSeekAPIError' && (
                    <p>{getText(
                      "There was an issue with the DeepSeek API. Try using ChatGPT model instead.", 
                      "Il y a eu un problème avec l'API DeepSeek. Essayez d'utiliser le modèle ChatGPT à la place.",
                      "DeepSeek API出现问题。请尝试使用ChatGPT模型代替。"
                    )}</p>
                  )}
                  {dataGot.errorType === 'OpenAIAPIError' && (
                    <p>{getText(
                      "There was an issue with the OpenAI API. Try using DeepSeek model instead.", 
                      "Il y a eu un problème avec l'API OpenAI. Essayez d'utiliser le modèle DeepSeek à la place.",
                      "OpenAI API出现问题。请尝试使用DeepSeek模型代替。"
                    )}</p>
                  )}
                  {dataGot.errorType === 'SyntaxError' && (
                    <p>{getText(
                      "The generated code contains syntax errors. Try rephrasing your query.", 
                      "Le code généré contient des erreurs de syntaxe. Essayez de reformuler votre requête.",
                      "生成的代码包含语法错误。请尝试重新表述您的查询。"
                    )}</p>
                  )}
                  {dataGot.errorType === 'ExecutionError' && (
                    <p>{getText(
                      "There was an error executing the generated code. Try being more specific in your query.", 
                      "Une erreur s'est produite lors de l'exécution du code généré. Essayez d'être plus précis dans votre requête.",
                      "执行生成的代码时出错。请尝试在查询中更加具体。"
                    )}</p>
                  )}
                  {dataGot.errorType === 'TranslationError' && (
                    <p>{getText(
                      "There was an error translating your query. Please try again or use English.", 
                      "Une erreur s'est produite lors de la traduction de votre requête. Veuillez réessayer ou utiliser l'anglais.",
                      "翻译您的查询时出错。请重试或使用英语。"
                    )}</p>
                  )}
                  {!['ValidationError', 'NetworkError', 'DeepSeekAPIError', 'OpenAIAPIError', 'SyntaxError', 'ExecutionError', 'TranslationError'].includes(dataGot.errorType) && (
                    <p>{getText(
                      "Try rephrasing your query or selecting a different model.", 
                      "Essayez de reformuler votre requête ou de sélectionner un modèle différent.",
                      "尝试重新表述您的查询或选择不同的模型。"
                    )}</p>
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
          <h4>{getText("Analysis Results (JSON):", "Résultats d'analyse (JSON) :", "分析结果 (JSON):")}</h4>
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
            {getText("Click", "Cliquez", "点击")}{" "}
            <a href={url} target="_blank" rel="noopener noreferrer">
              {getText("here", "ici", "此处")}
            </a>{" "}
            {getText(
              `to view the ${dataGot.accession} data.`,
              `pour voir les données de ${dataGot.accession}.`,
              `查看${dataGot.accession}数据。`
            )}
          </p>
        </div>
      );
    }

    return (
      <div className="return-line">
        <p>{getText("No results available.", "Aucun résultat disponible.", "没有可用的结果。")}</p>
      </div>
    );
  }

  function CodeWindow() {
    if (!dataGot.code) return null;
    return (
      <div id="code-container">
        <h4>{getText("Generated Python Code", "Code Python généré", "生成的Python代码")}</h4>
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
        <h1>Search our dataset - in English, French or Chinese.</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="input">{getText("What are you searching for?", "Que recherchez-vous ?", "您在搜索什么？")}</label>
          <input
            id="input"
            type="text"
            placeholder={getText("I want data on...", "Je veux des données sur...", "我想要关于...的数据")}
            value={searchQuery}
            onChange={handleSearchChange}
            required
          />
          <label htmlFor="models">{getText("Select a model to search with:", "Sélectionnez un modèle pour la recherche :", "选择搜索模型:")}</label>
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

          <label htmlFor="language">{getText("Select language:", "Sélectionnez la langue :", "选择语言:")}</label>
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
            {getText("Get Results", "Obtenir les résultats", "获取结果")}
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
