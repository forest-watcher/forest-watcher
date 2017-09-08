import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Theme from 'config/theme';
import FormStep from 'containers/common/form/form-step';
import tracker from 'helpers/googleAnalytics';

class Form extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    form: PropTypes.string.isRequired,
    step: PropTypes.number,
    questionsToSkip: PropTypes.number,
    title: PropTypes.string.isRequired,
    screen: PropTypes.string.isRequired,
    finish: PropTypes.func.isRequired
  };

  static defaultProps = {
    questionsToSkip: 0
  };

  componentDidMount() {
    tracker.trackScreenView('Reports');
  }

  render() {
    const { step, ...props } = this.props;
    const index = typeof step !== 'undefined' ? step : this.props.questionsToSkip;
    const extendedProps = { index, ...props };
    if (this.props.form) {
      return (<FormStep {...extendedProps} />);
    }
    return null;
  }
}

export default Form;
