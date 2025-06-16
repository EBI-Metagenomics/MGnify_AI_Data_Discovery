import React from 'react';

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  errorText?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

/**
 * Form input component following Visual Framework styling
 */
const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  value,
  onChange,
  helperText,
  errorText,
  placeholder,
  required = false,
  type = 'text'
}) => {
  return (
    <div className="vf-form__item vf-stack">
      <label htmlFor={id} className={`vf-form__label ${required ? 'vf-form__label--required' : ''}`}>
        {label}
        {required && (
          <>
            <span className="vf-u-sr-only">this field is required.</span>
            <svg className="vf-icon vf-icon--asterick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>asterick</title>
              <path d="M23.555,8.729a1.505,1.505,0,0,0-1.406-.98H16.062a.5.5,0,0,1-.472-.334L13.405,1.222a1.5,1.5,0,0,0-2.81,0l-.005.016L8.41,7.415a.5.5,0,0,1-.471.334H1.85A1.5,1.5,0,0,0,.887,10.4l5.184,4.3a.5.5,0,0,1,.155.543L4.048,21.774a1.5,1.5,0,0,0,2.31,1.684l5.346-3.92a.5.5,0,0,1,.591,0l5.344,3.919a1.5,1.5,0,0,0,2.312-1.683l-2.178-6.535a.5.5,0,0,1,.155-.543l5.194-4.306A1.5,1.5,0,0,0,23.555,8.729Z" />
            </svg>
          </>
        )}
      </label>

      {helperText && <p className="vf-form__helper">{helperText}</p>}

      <input 
        type={type} 
        id={id} 
        className="vf-form__input" 
        value={value} 
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />

      {errorText && <p className="vf-form__helper vf-form__helper--error">{errorText}</p>}
    </div>
  );
};

export default FormInput;