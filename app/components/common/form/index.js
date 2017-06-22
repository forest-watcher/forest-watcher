import React, { Component } from 'react';
import {
  Text,
  View
} from 'react-native';

import Theme from 'config/theme';
import I18n from 'locales';
import FormStep from 'containers/common/form/form-step';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

class Form extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  componentDidMount() {
    tracker.trackScreenView('Reports');
  }

  render() {
    const { step, texts, ...props } = this.props;
    const index = step || this.props.questionsToSkip;
    const extendedProps = { index, ...props };
    if (this.props.form) {
      return (<FormStep {...extendedProps} />);
    }
    return (
      <View style={[styles.container, styles.containerCenter]}>
        <Text>{I18n.t(texts.requiredId)}</Text>
      </View>
    );
  }
}

Form.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  form: React.PropTypes.string.isRequired,
  step: React.PropTypes.number,
  questionsToSkip: React.PropTypes.number,
  texts: React.PropTypes.object.isRequired,
  title: React.PropTypes.string.isRequired,
  screen: React.PropTypes.string.isRequired,
  finish: React.PropTypes.func.isRequired
};

export default Form;
