import React from 'react';

interface FormRadioProps {
  id: string;
  name: string;
  value: string;
  label: string;
  checked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Form radio component following Visual Framework styling
 */
const FormRadio: React.FC<FormRadioProps> = ({
  id,
  name,
  value,
  label,
  checked = false,
  onChange,
  helperText,
  required = false,
  disabled = false
}) => {
  return (
    <div className="vf-form__item vf-form__item--radio">
      <input 
        type="radio" 
        name={name} 
        value={value} 
        id={id} 
        className="vf-form__radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        required={required}
      />
      <label htmlFor={id} className="vf-form__label">
        {label}
      </label>

      {helperText && <p className="vf-form__helper">{helperText}</p>}
    </div>
  );
};

export default FormRadio;