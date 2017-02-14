import React from 'react';
import Text from './text';
import Radio from './radio';

export default function getInputForm(question, onChange) {
  switch (question.type) {
    case 'text':
      return <Text {...question} onChange={onChange} />;
    case 'radio':
      return <Radio {...question} onChange={onChange} />;

    default:
      return null;
  }
}
