import React, { Component } from 'react';
import {
  View
} from 'react-native';

import StepsSlider from 'components/common/steps-slider';
import inputForms from 'components/common/form-inputs';
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

  onChange = (e) => {
    console.log(e, 'changed');
  }

  onPress = (e) => {
    console.log(e, 'press');
  }

  render() {
    const { questions } = this.props;
    if (!questions || !questions.length) return null;
    const disabled = questions[this.state.page].answer === undefined;
    const btnText = disabled ? 'Choose at least one option to continue' : 'Next';
    return (
      <View style={styles.container}>
        <StepsSlider
          page={this.state.page}
          onChangeTab={this.updatePage}
        >
          {questions.map((question, index) => (
            <View key={index}>
              {inputForms(question, this.onChange)}
            </View>
          ))}
        </StepsSlider>
        <ActionButton style={styles.buttonPos} disabled={disabled} onPress={this.onPress} text={btnText} />
      </View>
    );
  }
}

Reports.propTypes = {
  getQuestions: React.PropTypes.func.isRequired,
  questions: React.PropTypes.array.isRequired
};

export default Reports;
