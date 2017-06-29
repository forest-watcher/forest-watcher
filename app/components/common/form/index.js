import React, { Component } from 'react';

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
    navigator: React.PropTypes.object.isRequired,
    form: React.PropTypes.string.isRequired,
    step: React.PropTypes.number,
    questionsToSkip: React.PropTypes.number,
    title: React.PropTypes.string.isRequired,
    screen: React.PropTypes.string.isRequired,
    finish: React.PropTypes.func.isRequired
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
