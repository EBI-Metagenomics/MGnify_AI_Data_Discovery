import React, { ReactNode } from 'react';

interface FormFieldsetProps {
  legend: string;
  children: ReactNode;
  className?: string;
}

/**
 * Form fieldset component following Visual Framework styling
 * Used to group related form elements like checkboxes or radio buttons
 */
const FormFieldset: React.FC<FormFieldsetProps> = ({
  legend,
  children,
  className = ''
}) => {
  return (
    <fieldset className={`vf-form__fieldset vf-stack vf-stack--400 ${className}`}>
      <legend className="vf-form__legend">{legend}</legend>
      {children}
    </fieldset>
  );
};

export default FormFieldset;