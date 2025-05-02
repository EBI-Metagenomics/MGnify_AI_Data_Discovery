import { useState } from 'react';
import './App.css';


import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [searchQuery, setSearchQuery] = useState('');         // Keep the input string as state
  const [chosenModel, setChosenModel] = useState('DeepSeek'); // Keep the chosen model as state, default to DeepSeek
  const [loading, setLoading] = useState(false);              // Show a loading skeleton while we wait for comms with the back end to complete
  const [returnVisible, setReturnVisible] = useState(false);  // Hide the return elements until ready to serve to user
  const [codeClicked, setCodeClicked] = useState(false);      // Hide or show the generated code to users
  const [isDark, setIsDark] = useState(false);                // Allow user to view in dark mode.
  const [dataGot, setDataGot] = useState({code: '',           // Keep the stuff received from the back end as state 
                                          accession: '',      
                                          error: '',           
                                          traceback: '',       
                                          output: ''},);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // e.target is our input field
  };

  const handleModelChoice = (e) => {
    setChosenModel(e.target.value) // e.target is the select element.
  }


  // Once the form is submit, we need to pass the input back to the LLM,
  // and then we need to wait to hear back from this and the web server,
  // and serve the results to the user.
  const handleSubmit = (e) => {
    e.preventDefault();
    setReturnVisible(false);
    document.getElementById("submitBtn").disabled = true; // don't allow the form to be resubmit
    setLoading(true); // draw the loading skeleton
    generateResult(chosenModel, searchQuery); // Pass the latest values directly
    document.getElementById("submitBtn").disabled = false // allow the form to be resubmit
  };
  
  // This should pass off the JSON to the back end, and serve us the results (and the generated code).
  async function generateResult(model, query) {
    const backendPort = process.env.REACT_APP_BACKEND_PORT || 5000;
    const backendUrl = `http://localhost:${backendPort}/code`;
    const payload = { model, query };
    const postResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const testData = await postResponse.json();
    console.log(testData);
    setDataGot(testData);
    setLoading(false); // hide the loading skeleton
    setReturnVisible(true); // Only show results after data is received
  }

  // presents a basic loading skeleton
  function LoadingSkeleton(){
    return(
      <div className="loadingSkeleton">
          <p>loading...</p>
      </div>
    )
  }

  // Components we only want you to see when we have the data back from the web server
  function ReturnComponents() {
    // the "WriteResponse" component is going to display the links to the analyses.
    // the "WriteCode" component is going to display the generated code.
    return (
      <div className="returnSection">
        <WriteResponse />
        <div className="code-show">
          <p> Advanced: </p>
          <button id="apiBtn" onClick={handleCodeClick} type="button"> Click here to show/hide the code we generated</button>
          {codeClicked && <CodeWindow />}
        </div>
      </div>
    )
  }

  // Display the hyperlink when download was successful, and error message when it isn't.
  function WriteResponse(){
    if (dataGot.error) return (
        <div className="return-line"><p>There was an error in processing your query.</p></div>
    );
    console.log(JSON.stringify(dataGot, null, 4))
    const url = `https://www.ebi.ac.uk/metagenomics` //`https://www.ebi.ac.uk/metagenomics/analysis/${dataGot.accession}#overview`;
    return(
        <div className="return-line">Click <a href="{url}">here</a> to view the data.</div>
    )
  }

  // CodeWindow uses non-fixed styling
  function CodeWindow() {
    if (!dataGot.code) return null;
    return (
      <div id="code-container">
        <h4>Generated Python Code</h4>
        <SyntaxHighlighter
          language="python"
          id="code-show"
          style={isDark ? vscDarkPlus : prism}>
          {dataGot.code}
        </SyntaxHighlighter>
      </div>
    );
  }

  // Change the state of "codeClicked" when the 'click here to...' button is pressed.
  function handleCodeClick(){
    setCodeClicked(!codeClicked)
  }

  // The main body of the app. Contains all the text labels, inputs, and buttons
  // Page structure should be clear from the code:
  // The 'theme toggle' goes from light to dark, some headers,
  // then an input form with a textbox and a submission button,
  // and then an element containing everything we return upon submission,
  // which is defined above.
  return (
    <div className="app-container" data-theme={isDark ? "dark" : "light"}>
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
        <p className="description">This tool is designed to help generate correct API calls for MGnify using Python. description ........................... description</p>
        <form onSubmit={handleSubmit}>
          <label>What are you searching for?</label>
          <input 
            type="text" 
            placeholder="I want data on..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {/*
          <label>Select a model to search with: </label>
          <select className="models" name="models" id="models" onChange={handleModelChoice} required>
            <option value="DeepSeek">DeepSeek</option>
            <option value="Claude">Claude</option>
            <option value="ChatGPT">ChatGPT</option>
            <option value="Grok">Grok</option>
          </select>
          */}
          <button id="submitBtn" type="submit">Get Results</button>
        </form>
        {loading && <LoadingSkeleton />}
        {returnVisible && <ReturnComponents />}
      </div>
    </div>
  );
}

export default App;
