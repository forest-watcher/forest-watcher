import React from 'react';
import Text from './text';
import Radio from './radio';
import Select from './select';
import Date from './date';
import Blob from './blob';
// TODO: fix numbers input in iOS as we can't accept the value
// import Number from './number';


function FormField(props) {
  if (!props.question) return null;

  switch (props.question.type) {
    case 'text':
      return <Text {...props} />;
    case 'number':
      return <Text {...props} />; // Use the number component here
    case 'radio':
      return <Radio {...props} />;
    case 'select':
      return <Select {...props} />;
    case 'date':
      return <Date {...props} />;
    case 'point':
      return <Text {...props} />;
    case 'blob':
      return <Blob {...props} />;
    default:
      return null;
  }
}

export default FormField;
