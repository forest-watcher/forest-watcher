// @flow
import type { Answer, Question } from 'types/reports.types';
import React from 'react';
import Text from './text';
import Radio from './radio';
import Select from './select';
import Date from './date';
import Blob from './blob';
import Number from './number';
import { AudioInput } from './audio';

type Props = {
  reportName: string,
  question: Question,
  answer: Answer,
  onChange: Answer => void
};

function FormField(props: Props) {
  if (!props.question) {
    return null;
  }

  switch (props.question.type) {
    case 'text':
      return <Text {...props} />;
    case 'number':
      return <Number {...props} />;
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
    case 'audio':
      return <AudioInput {...props} />;
    default:
      return null;
  }
}

export default FormField;
