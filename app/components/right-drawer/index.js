import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';
import styles from './styles';

class RightDrawer extends Component {

  static propTypes = {
    navigator: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    switch (event.id) {
      case 'didAppear':
        tron.log('Im here');
        break;
      case 'didDisappear':
        tron.log('Im out');
        break;
      default:
    }
  }

  render() {
    return (
      <View style={styles.mainContainer} />
    );
  }
}

export default RightDrawer;
