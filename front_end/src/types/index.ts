/**
 * Type definitions for the application
 */

// Search parameters
export interface SearchParams {
  model: string;
  query: string;
  language: string;
}

// Error details
export interface ErrorDetails {
  message?: string;
  traceback?: string;
  output?: string;
  code?: string;
  line_number?: number;
  error_line?: string;
  code_context?: string;
}

// Search result data
export interface SearchResultData {
  accession: any; // Can be object, string, or empty
  code: string;
  error: string;
  traceback?: string;
  output?: string;
  errorType?: string;
  errorDetails?: ErrorDetails;
}

// API response
export interface ApiResponse {
  success: boolean;
  accession: any; // Can be object, string, or empty
  code: string;
  error: string;
  traceback?: string;
  output?: string;
  errorType?: string;
  errorDetails?: ErrorDetails;
}

export interface ResultResponse {
  success: boolean;
  accession: string | object;
  code: string;
  error: string;
  traceback: string;
  output: string;
  errorType?: string;
  errorDetails?: object;
}