import React from 'react';
import Text from './text';
import Radio from './radio';
import Select from './select';
import Date from './date';

// REDUX-FORM custom inputs
// http://redux-form.com/6.5.0/docs/api/Field.md/
export default function getInputForm(props) {
  switch (props.question.type) {
    case 'text':
      return <Text {...props} />;
    case 'radio':
      return <Radio {...props} />;
    case 'select':
      return <Select {...props} />;
    case 'date':
      return <Date {...props} />;
    case 'point':
      return <Text {...props} />;
    default:
      return null;
  }
}

getInputForm.propTypes = {
  question: React.PropTypes.shape({
    value: React.PropTypes.string,
    type: React.PropTypes.string.isRequired,
    defaultValue: React.PropTypes.string
  }).isRequired
};
