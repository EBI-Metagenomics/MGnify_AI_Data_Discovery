import React, {useState} from 'react';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {prism, dark} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {getText} from '../../utils/languageUtils';
import {formatJSON} from '../../utils/formatUtils';
import ErrorDisplay from './ErrorDisplay';
import CodeWindow from './CodeWindow';

// Import types
import {SearchResultData} from '../../types';

/**
 * Props for the ResultDisplay component
 */
interface ResultDisplayProps {
    data: SearchResultData;
    isDark: boolean;
    language: string;
}

/**
 * Component for displaying search results
 *
 * @param {ResultDisplayProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const ResultDisplay: React.FC<ResultDisplayProps> = ({data, isDark, language}) => {
    // If there's an error, display the error component
    if (data.error) {
        return (
            <ErrorDisplay
                error={data.error}
                errorType={data.errorType || 'UnknownError'}
                errorDetails={data.errorDetails || {}}
                isDark={isDark}
                language={language}
            />

            // <ErrorDisplay
            //   error={data.error}
            //   errorType={data.errorType}
            //   errorDetails={data.errorDetails}
            //   isDark={isDark}
            //   language={language}
            // />
        );
    }

    // Handle successful results with object data
    if (
        data.accession &&
        typeof data.accession === 'object' &&
        Object.keys(data.accession).length > 0
    ) {
        return (
            <div className="return-line">
                <h4>{getText("Analysis Results (JSON):", "Résultats d'analyse (JSON) :", "分析结果 (JSON):", language)}</h4>
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
                    {formatJSON(data.accession)}
                </SyntaxHighlighter>
            </div>
        );
    }

    // Handle successful results with string data (URL)
    if (typeof data.accession === 'string' && data.accession) {
        const url = `https://www.ebi.ac.uk/metagenomics/analysis/${data.accession}#overview`;
        return (
            <div className="return-line">
                <p>
                    {getText("Click", "Cliquez", "点击", language)}{" "}
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        {getText("here", "ici", "此处", language)}
                    </a>{" "}
                    {getText(
                        `to view the ${data.accession} data.`,
                        `pour voir les données de ${data.accession}.`,
                        `查看${data.accession}数据。`,
                        language
                    )}
                </p>
            </div>
        );
    }

    // Default case: no results
    return (
        <div className="return-line">
            <p>{getText("No results available.", "Aucun résultat disponible.", "没有可用的结果。", language)}</p>
        </div>
    );
};

/**
 * Props for the ResultsContainer component
 */
interface ResultsContainerProps {
    data: SearchResultData;
    isDark: boolean;
    language: string;
}

/**
 * Component that wraps the result display with code toggle functionality
 *
 * @param {ResultsContainerProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const ResultsContainer: React.FC<ResultsContainerProps> = ({data, isDark, language}) => {
    const [codeClicked, setCodeClicked] = useState<boolean>(false);

    const handleCodeClick = (): void => setCodeClicked(!codeClicked);

    return (
        <div className="returnSection">
            <ResultDisplay data={data} isDark={isDark} language={language}/>
            <div className="code-show">
                <p>{getText("Advanced:", "Avancé :", "高级:", language)}</p>
                <button id="apiBtn" onClick={handleCodeClick} type="button">
                    {getText(
                        "Click here to show/hide the code we generated",
                        "Cliquez ici pour afficher/masquer le code que nous avons généré",
                        "点击此处显示/隐藏我们生成的代码",
                        language
                    )}
                </button>
                {codeClicked && <CodeWindow code={data.code} isDark={isDark} language={language}/>}
            </div>
        </div>
    );
};

export {ResultDisplay, ResultsContainer};