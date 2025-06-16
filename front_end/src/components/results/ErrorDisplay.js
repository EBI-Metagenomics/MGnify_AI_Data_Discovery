import React from 'react';
import PropTypes from 'prop-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism, dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getText } from '../../utils/languageUtils';

/**
 * Component for displaying error messages
 * 
 * @param {Object} props - Component props
 * @param {string} props.error - The error message
 * @param {string} props.errorType - The type of error
 * @param {Object} props.errorDetails - Additional error details
 * @param {boolean} props.isDark - Whether dark mode is enabled
 * @param {string} props.language - The selected language
 * @returns {JSX.Element} - Rendered component
 */
const ErrorDisplay = ({ error, errorType, errorDetails, isDark, language }) => {
  return (
    <div className="return-line error-container">
      <h4>{getText("Error", "Erreur", "错误", language)}</h4>
      <div className="error-message">
        <p>
          <strong>{errorType || getText('Error', 'Erreur', '错误', language)}:</strong> {error}
        </p>

        {/* Show additional error details if available */}
        {errorDetails && (
          <div className="error-details">
            <h5>{getText("Additional Information:", "Informations supplémentaires :", "附加信息:", language)}</h5>

            {/* Show line number if available */}
            {errorDetails.line_number && (
              <p>
                <strong>{getText("Error at line:", "Erreur à la ligne :", "错误行号:", language)}</strong> {errorDetails.line_number}
              </p>
            )}

            {/* Show code context with line numbers if available */}
            {errorDetails.code_context && (
              <div className="error-code-context">
                <p>
                  <strong>{getText("Code Context:", "Contexte du code :", "代码上下文:", language)}</strong>
                </p>
                <pre className="error-code-with-lines">{errorDetails.code_context}</pre>
              </div>
            )}

            {/* Show full code if available and no context is provided */}
            {errorDetails.code && !errorDetails.code_context && (
              <div className="error-code-preview">
                <p>
                  <strong>{getText("Generated Code:", "Code généré :", "生成的代码:", language)}</strong>
                </p>
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
                  {errorDetails.code}
                </SyntaxHighlighter>
              </div>
            )}

            {errorDetails.output && (
              <div>
                <p>
                  <strong>{getText("Output:", "Sortie :", "输出:", language)}</strong>
                </p>
                <pre className="error-output">{errorDetails.output}</pre>
              </div>
            )}

            {/* Show suggestions based on error type */}
            <div className="error-suggestions">
              <p>
                <strong>{getText("Suggestions:", "Suggestions :", "建议:", language)}</strong>
              </p>
              {errorType === 'ValidationError' && (
                <p>
                  {getText(
                    "Please check your query format and try again.",
                    "Veuillez vérifier le format de votre requête et réessayer.",
                    "请检查您的查询格式并重试。",
                    language
                  )}
                </p>
              )}
              {errorType === 'NetworkError' && (
                <p>
                  {getText(
                    "Please check your internet connection and try again.",
                    "Veuillez vérifier votre connexion internet et réessayer.",
                    "请检查您的网络连接并重试。",
                    language
                  )}
                </p>
              )}
              {errorType === 'DeepSeekAPIError' && (
                <p>
                  {getText(
                    "There was an issue with the DeepSeek API. Try using ChatGPT model instead.",
                    "Il y a eu un problème avec l'API DeepSeek. Essayez d'utiliser le modèle ChatGPT à la place.",
                    "DeepSeek API出现问题。请尝试使用ChatGPT模型代替。",
                    language
                  )}
                </p>
              )}
              {errorType === 'OpenAIAPIError' && (
                <p>
                  {getText(
                    "There was an issue with the OpenAI API. Try using DeepSeek model instead.",
                    "Il y a eu un problème avec l'API OpenAI. Essayez d'utiliser le modèle DeepSeek à la place.",
                    "OpenAI API出现问题。请尝试使用DeepSeek模型代替。",
                    language
                  )}
                </p>
              )}
              {errorType === 'SyntaxError' && (
                <p>
                  {getText(
                    "The generated code contains syntax errors. Try rephrasing your query.",
                    "Le code généré contient des erreurs de syntaxe. Essayez de reformuler votre requête.",
                    "生成的代码包含语法错误。请尝试重新表述您的查询。",
                    language
                  )}
                </p>
              )}
              {errorType === 'ExecutionError' && (
                <p>
                  {getText(
                    "There was an error executing the generated code. Try being more specific in your query.",
                    "Une erreur s'est produite lors de l'exécution du code généré. Essayez d'être plus précis dans votre requête.",
                    "执行生成的代码时出错。请尝试在查询中更加具体。",
                    language
                  )}
                </p>
              )}
              {errorType === 'TranslationError' && (
                <p>
                  {getText(
                    "There was an error translating your query. Please try again or use English.",
                    "Une erreur s'est produite lors de la traduction de votre requête. Veuillez réessayer ou utiliser l'anglais.",
                    "翻译您的查询时出错。请重试或使用英语。",
                    language
                  )}
                </p>
              )}
              {!['ValidationError', 'NetworkError', 'DeepSeekAPIError', 'OpenAIAPIError', 'SyntaxError', 'ExecutionError', 'TranslationError'].includes(errorType) && (
                <p>
                  {getText(
                    "Try rephrasing your query or selecting a different model.",
                    "Essayez de reformuler votre requête ou de sélectionner un modèle différent.",
                    "尝试重新表述您的查询或选择不同的模型。",
                    language
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ErrorDisplay.propTypes = {
  error: PropTypes.string.isRequired,
  errorType: PropTypes.string,
  errorDetails: PropTypes.object,
  isDark: PropTypes.bool.isRequired,
  language: PropTypes.string.isRequired
};

export default ErrorDisplay;