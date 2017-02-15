import React from 'react';
import Text from './text';
import Radio from './radio';

// REDUX-FORM custom inputs
// https://github.com/erikras/redux-form/blob/master/examples/react-widgets/src/ReactWidgetsForm.js#L25
export default function getInputForm(props) {
  switch (props.question.type) {
    case 'text':
      return <Text {...props} />;
    case 'radio':
      return <Radio {...props} />;

    default:
      return <Text {...props} />;
  }
}

getInputForm.propTypes = {
  question: React.PropTypes.shape({
    value: React.PropTypes.string,
    type: React.PropTypes.string.isRequired,
    defaultValue: React.PropTypes.string
  }).isRequired
};
