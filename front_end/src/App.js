import { useState } from 'react';
import './App.css';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
   const payload = { model: chosenModel, query: searchQuery };

   const postResponse = await fetch(backendUrl, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(payload),
   });
    const testData = await postResponse.json();

    setDataGot({
     accession: testData.accession,
     code: testData.code,
     error: testData.error,
     traceback: testData.traceback,
     output: testData.output
    });

    setLoading(false);
    // Re-enable inputs/buttons
    document.getElementById("submitBtn").disabled = false;
    document.getElementById("input").disabled = false;
    document.getElementById("models").disabled = false;

    setReturnVisible(true);
  }

  function LoadingSkeleton() {
    return (
      <div className="loadingSkeleton">
        <p>loading...</p>
      </div>
    );
  }

  function ReturnComponents() {
    return (
      <div className="returnSection">
        <WriteResponse />
        <div className="code-show">
          <p>Advanced:</p>
          <button id="apiBtn" onClick={handleCodeClick} type="button">
            Click here to show/hide the code we generated
          </button>
          {codeClicked && <CodeWindow />}
        </div>
      </div>
    );
  }

  function WriteResponse() {
    if (dataGot.error) {
      return (
        <div className="return-line">
          <p className='error-message'>There was an error in processing your query.</p>
        </div>
      );
    }
  
    if (
      dataGot.accession &&
      typeof dataGot.accession === 'object' &&
      Object.keys(dataGot.accession).length > 0
    ) {
      return (
        <div className="return-line">
          <h4>Analysis Results (JSON):</h4>
          <SyntaxHighlighter
            language="json"
            className='json-viewer'
            style={isDark ? vscDarkPlus : prism}
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
            Click{" "}
            <a href={url} target="_blank" rel="noopener noreferrer">
              here
            </a>{" "}
            to view the {dataGot.accession} data.
          </p>
        </div>
      );
    }
  
    return (
      <div className="return-line">
        <p>No results available.</p>
      </div>
    );
  }

  function CodeWindow() {
    if (!dataGot.code) return null;
    return (
      <div id="code-container">
        <h4>Generated Python Code</h4>
        <SyntaxHighlighter
          language="python"
          id="code-show"
          style={isDark ? vscDarkPlus : prism}
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
        <h1>Search our dataset - with plain English.</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="input">What are you searching for?</label>
          <input
            id="input"
            type="text"
            placeholder="I want data on..."
            value={searchQuery}
            onChange={handleSearchChange}
            required
          />
          <label htmlFor="models">Select a model to search with:</label>
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
          <button id="submitBtn" type="submit">
            Get Results
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
