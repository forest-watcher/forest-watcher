import React, { Component } from 'react';
import {
  View
} from 'react-native';
import { Field, reduxForm } from 'redux-form';

import StepsSlider from 'components/common/steps-slider';
import getInputForm from 'components/common/form-inputs';
import ActionButton from 'components/common/action-button';
import styles from './styles';

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
    const enabled = answers && questions.length && answers[questions[this.state.page]._id] // eslint-disable-line
    const btnText = enabled ? 'Next' : 'Choose at least one option to continue';
    return (
      <View style={styles.container}>
        <StepsSlider
          page={this.state.page}
          onChangeTab={this.updatePage}
        >
          {questions.map((question, index) => (
            <View key={index}>
              <Field
                name={question._id} // eslint-disable-line
                component={getInputForm}
                question={question}
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
