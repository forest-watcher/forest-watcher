import React, { Component } from 'react';
import {
  Text,
  View
} from 'react-native';
import Theme from 'config/theme';

const saveReportIcon = require('assets/save_for_later.png');

class Answers extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static propTypes = {
    navigator: React.PropTypes.object.isRequired,
    enableDraft: React.PropTypes.bool.isRequired
  };

  static defaultProps = {
    enableDraft: true
  }

  constructor(props) {
    super(props);
    if (this.props.enableDraft) {
      this.props.navigator.setButtons({
        rightButtons: [
          {
            icon: saveReportIcon,
            id: 'draft'
          }
        ]
      });
      this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
    }
  }

  render() {
    return (
      <View>
        <Text>Hello</Text>
      </View>
    );
  }
}

export default Answers;
