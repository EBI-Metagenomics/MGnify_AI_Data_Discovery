import { useState } from 'react';
import './App.css';
import downloadDark from "./images/download-icon-black.jpg";
import downloadLight from "./images/download-icon-white.png";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [searchQuery, setSearchQuery] = useState('');               // Keep the input string as state
  const [chosenModel, setChosenModel] = useState('DeepSeek');       // Keep the chosen model as state, default to DeepSeek
  const [formJson, setFormJson] = useState({model: '', query: ''}); // Keep the values of the submit form as a JSON object
  const [returnVisible, setReturnVisible] = useState(false);        // Hide the return elements until ready to serve to user
  const [codeClicked, setCodeClicked] = useState(false);            // Hide or show the generated code to users
  const [isDark, setIsDark] = useState(false);                      // Allow user to view in dark mode.
  const [dataGot, setDataGot] = useState({code: '', data: ''});     // Keep the stuff received from the back end as state 
                                                                    // (currently assuming this will be sent as a single JSON 
                                                                    // with the code used for the API call, and a single bit of 
                                                                    // return data. This can and should be changed if needed.)

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
    generateResult(chosenModel, searchQuery); // Pass the latest values directly
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
    setReturnVisible(true); // Only show results after data is received
  }

  // Finally serve the user the results of the query via the download button.
  // The current version uses dummy file data for testing the front end, this
  // is easily fixed by using the 'dataGot' variable kept as state.
  function downloadSearchInfo() {
    // create file contents.
    // The file contents should be {dataGot.data} once the comms with the back end are set up,
    // so at that point we should skip the creation of the data, and just make a blob with that.
    const fileData = `You searched for ${formJson.query} in the MGNify database with ${formJson.model}!`
    // create a blob with those contents 
    const blob = new Blob([fileData], { type: "text/plain" });
    // create a link in the DOM from the blob 
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${formJson.query.substring(0,10)}.txt`; // filetype may be specified by backend, clarify later.
    link.href = url;
    // click the link and download file.
    link.click();
  }

  // Components we only want you to see when we have the data back from the web server
  function ReturnComponents() {
    // the "WriteResponse" component is going to have all the download options.
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

  // Display the download options.
  // Currently serves a single downloadable text file indicating the query that was made.
  function WriteResponse(){
    return(
      <div className="download-all-lines">
        <div className="download-line">
          <p>Click here to download the {formJson.query.substring(0,10)} data:</p>
          <button id="downloadBtn" onClick={downloadSearchInfo} type="button">
            <img src={isDark ? downloadDark : downloadLight} className="button-Image">
            </img>
          </button> 
        </div>
      </div>
    )
  }

  // Display the generated code.
  // Currently displays a notice that says we do not have any code to return.
  // Should display {dataGot.code} when comms with the backend are set up.
  // function WriteCode(){
  //   return( 
  //     <div className="codeReturn">
  //       <p> No code generated yet! sorry!</p>
  //       <p>It will be written here for users to read and check.</p>
  //     </div>
  //   )
  // }

  // Update CodeWindow to use a non-fixed style
  function CodeWindow() {
    if (!dataGot.code) return null;
    return (
      <div style={{
        marginTop: "1em",
        background: isDark ? "#1e1e1e" : "#f5f5f5",
        padding: "1em",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: "6px",
        maxWidth: "100%",
        overflowX: "auto"
      }}>
        <h4 style={{margin: 0, color: isDark ? "#fff" : "#222"}}>Generated Python Code</h4>
        <SyntaxHighlighter
          language="python"
          style={isDark ? vscDarkPlus : prism}
          customStyle={{
            maxHeight: "200px",
            overflowY: "auto",
            fontSize: "1em",
            borderRadius: "6px",
            marginTop: "0.5em"
          }}
        >
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
        <form onSubmit={handleSubmit}>
          <label>What are you searching for?</label>
          <input 
            type="text" 
            placeholder="I want data on..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <label>Select a model to search with: </label>
          <select className="models" name="models" id="models" onChange={handleModelChoice} required>
            <option value="DeepSeek">DeepSeek</option>
            <option value="Claude">Claude</option>
            <option value="ChatGPT">ChatGPT</option>
            <option value="Grok">Grok</option>
          </select>
          <button id="submitBtn" type="submit">Get Results</button>
        </form>
        {returnVisible && <ReturnComponents />}
      </div>
    </div>
  );
}

export default App;
