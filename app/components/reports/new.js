import React, { Component } from 'react';
import {
  View
} from 'react-native';
import { Field, reduxForm } from 'redux-form';

import StepsSlider from 'components/common/steps-slider';
import getInputForm from 'components/common/form-inputs';
import ActionButton from 'components/common/action-button';
import styles from './styles';

function getBtnTextByType(type) {
  switch (type) {
    case 'text':
      return 'Please write something';
    case 'radio':
      return 'Choose one option to continue';
    case 'select':
      return 'Choose at least one option to continue';
    default:
      return 'Please, fill the answer please';
  }
}

class Reports extends Component {
  constructor() {
    super();

    this.state = {
      page: 0
    };
  }

  componentWillMount() {
    this.props.getQuestions();
  }

  goToNextPage = () => {
    this.setState((prevState) => ({
      page: prevState.page + 1
    }));
  }

  render() {
    const { questions, answers } = this.props;
    if (!questions || !questions.length) return null;
    const question = questions[this.state.page];
    const enabled = answers && answers[question._id];  // eslint-disable-line
    const btnText = enabled ? 'Next' : getBtnTextByType(question.type);
    return (
      <View style={styles.container}>
        <StepsSlider
          page={this.state.page}
          onChangeTab={this.updatePage}
        >
          {questions.map((item, index) => (
            <View key={index}>
              <Field
                name={item._id} // eslint-disable-line
                component={getInputForm}
                question={item}
              />
            </View>
          ))}
        </StepsSlider>
        <ActionButton style={styles.buttonPos} disabled={!enabled} onPress={this.goToNextPage} text={btnText} />
      </View>
    );
  }
}

Reports.propTypes = {
  getQuestions: React.PropTypes.func.isRequired,
  questions: React.PropTypes.array.isRequired,
  answers: React.PropTypes.object.isRequired
};

export default reduxForm({
  destroyOnUnmount: false
})(Reports);
