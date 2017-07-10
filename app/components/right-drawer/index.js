import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text
} from 'react-native';
import Row from 'components/common/row';
import styles from './styles';

class RightDrawer extends Component {

  static propTypes = {
    navigator: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      dummyValue: false
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    switch (event.id) {
      case 'didAppear':
        this.onDidAppear();
        break;
      case 'didDisappear':
        this.onDidDisappear();
        break;
      default:
    }
  }

  onDidAppear = () => {
    tron.log('Im here');
  }

  onDidDisappear = () => {
    tron.log('Im out');
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text>Map settings</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.contextualLayersContainer}>
            <Text>Contextual layers</Text>
            <Row
              text="Protected Areas"
              value={this.state.dummyValue}
              onValueChange={val => this.setState({ dummyValue: val })}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default RightDrawer;
