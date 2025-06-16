/**
 * API service for making requests to the backend
 */

/**
 * Generate search results by calling the backend API
 * @param {Object} params - Search parameters
 * @param {string} params.model - The model to use (DeepSeek or ChatGPT)
 * @param {string} params.query - The search query
 * @param {string} params.language - The language of the query (en, fr, zh)
 * @returns {Promise<Object>} - The search results
 */
export const generateSearchResults = async ({ model, query, language }) => {
  const backendPort = process.env.REACT_APP_BACKEND_PORT || 5000;
  const backendUrl = `http://localhost:${backendPort}/code`;
  const payload = { model, query, language };

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        accession: {},
        code: '',
        error: data.error ? 
          (data.error.message || 'An error occurred with the server request') : 
          `Server error: ${response.status} ${response.statusText}`,
        errorType: data.error ? data.error.type : 'ServerError',
        errorDetails: data.error ? data.error.details : null
      };
    }

    return {
      success: true,
      accession: data.accession || {},
      code: data.code || '',
      error: '',
      traceback: '',
      output: ''
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      success: false,
      accession: {},
      code: '',
      error: `Network error: ${error.message || 'Could not connect to the server'}`,
      errorType: 'NetworkError',
      errorDetails: { message: error.toString() }
    };
  }
};