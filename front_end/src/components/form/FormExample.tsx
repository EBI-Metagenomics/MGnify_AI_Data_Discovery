import React, { useState, FormEvent } from 'react';
import { 
  FormInput, 
  FormCheckbox, 
  FormRadio, 
  FormSelect, 
  FormTextarea, 
  FormFieldset 
} from './index';

/**
 * Example component demonstrating all form elements
 * Based on the HTML example in the issue description
 */
const FormExample: React.FC = () => {
  // State for form values
  const [textInput1, setTextInput1] = useState('');
  const [textInput2, setTextInput2] = useState('');
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [selectedRadio, setSelectedRadio] = useState('');
  const [selectedPet, setSelectedPet] = useState('dog');
  const [textareaValue, setTextareaValue] = useState('');

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedFruits([...selectedFruits, value]);
    } else {
      setSelectedFruits(selectedFruits.filter(fruit => fruit !== value));
    }
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted with values:', {
      textInput1,
      textInput2,
      selectedFruits,
      selectedRadio,
      selectedPet,
      textareaValue
    });
  };

  return (
    <form className="vf-stack vf-stack--400" action="#" method="get" onSubmit={handleSubmit}>
      <FormInput
        id="text1"
        label="Form Label"
        value={textInput1}
        onChange={(e) => setTextInput1(e.target.value)}
        helperText="Form helper text"
        errorText={textInput1 ? '' : 'You have done something wrong.'}
        required={true}
      />

      <FormInput
        id="text2"
        label="Form Label"
        value={textInput2}
        onChange={(e) => setTextInput2(e.target.value)}
        helperText="Form helper text"
        errorText={textInput2 ? '' : 'You have done something wrong.'}
        required={true}
      />

      <FormFieldset legend="Pick your favourite(s).">
        <FormCheckbox
          id="fruit_01"
          name="fruits"
          value="apples"
          label="Apples"
          checked={selectedFruits.includes('apples')}
          onChange={handleCheckboxChange}
        />

        <FormCheckbox
          id="fruit_02"
          name="fruits"
          value="bananas"
          label="Bananas"
          checked={selectedFruits.includes('bananas')}
          onChange={handleCheckboxChange}
          helperText="Some text to help with things"
        />

        <FormCheckbox
          id="fruit_03"
          name="fruits"
          value="mangos"
          label="Mangos"
          checked={selectedFruits.includes('mangos')}
          onChange={handleCheckboxChange}
        />

        <FormCheckbox
          id="fruit_04"
          name="fruits"
          value="oranges"
          label="Oranges"
          checked={selectedFruits.includes('oranges')}
          onChange={handleCheckboxChange}
        />

        <FormCheckbox
          id="fruit_05"
          name="fruits"
          value="pears"
          label="Pears"
          checked={selectedFruits.includes('pears')}
          onChange={handleCheckboxChange}
          disabled={true}
        />

        <FormCheckbox
          id="fruit_06"
          name="fruits"
          value="strawberries"
          label="Strawberries"
          checked={selectedFruits.includes('strawberries')}
          onChange={handleCheckboxChange}
          required={true}
          invalid={!selectedFruits.includes('strawberries')}
          errorText={!selectedFruits.includes('strawberries') ? "You didn't pick Strawberries?" : ''}
        />
      </FormFieldset>

      <FormFieldset legend="Which do you like?">
        <FormRadio
          id="1"
          name="fruits"
          value="Apples"
          label="Apples"
          checked={selectedRadio === 'Apples'}
          onChange={(e) => setSelectedRadio(e.target.value)}
          helperText="Some text to help with things"
        />

        <FormRadio
          id="2"
          name="fruits"
          value="Bananas"
          label="Bananas"
          checked={selectedRadio === 'Bananas'}
          onChange={(e) => setSelectedRadio(e.target.value)}
        />

        <FormRadio
          id="3"
          name="fruits"
          value="Mangos"
          label="Mangos"
          checked={selectedRadio === 'Mangos'}
          onChange={(e) => setSelectedRadio(e.target.value)}
        />

        <FormRadio
          id="4"
          name="fruits"
          value="Oranges"
          label="Oranges"
          checked={selectedRadio === 'Oranges'}
          onChange={(e) => setSelectedRadio(e.target.value)}
        />

        <FormRadio
          id="5"
          name="fruits"
          value="Pears"
          label="Pears"
          checked={selectedRadio === 'Pears'}
          onChange={(e) => setSelectedRadio(e.target.value)}
          disabled={true}
        />

        <FormRadio
          id="6"
          name="fruits"
          value="Strawberries"
          label="Strawberries"
          checked={selectedRadio === 'Strawberries'}
          onChange={(e) => setSelectedRadio(e.target.value)}
        />
      </FormFieldset>

      <FormSelect
        id="vf-form__select"
        label="Choose a pet:"
        options={[
          { value: 'cat', label: 'Cat' },
          { value: 'hamster', label: 'Hamster' },
          { value: 'parrot', label: 'Parrot' },
          { value: 'dog', label: 'Dog', selected: true },
          { value: 'spider', label: 'Spider' },
          { value: 'goldfish', label: 'Goldfish' }
        ]}
        value={selectedPet}
        onChange={(e) => setSelectedPet(e.target.value)}
      />

      <FormTextarea
        id="text-area"
        name="text-area"
        label="Write Some More details"
        value={textareaValue}
        onChange={(e) => setTextareaValue(e.target.value)}
        rows={5}
      />

      <button className="vf-button vf-button--primary" type="submit">Submit</button>
    </form>
  );
};

export default FormExample;