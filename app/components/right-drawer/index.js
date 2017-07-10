import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TouchableHighlight,
  Image
} from 'react-native';
import Theme from 'config/theme';
import Row from 'components/common/row';
import styles from './styles';

const closeIcon = require('assets/close.png');


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

  onPressClose = () => {
    this.props.navigator.toggleDrawer({
      side: 'right',
      animated: true
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Map settings</Text>
          <TouchableHighlight
            activeOpacity={0.5}
            underlayColor="transparent"
            onPress={this.onPressClose}
          >
            <Image style={Theme.icon} source={closeIcon} />
          </TouchableHighlight>
        </View>
        <View style={styles.body}>
          <View style={styles.contextualLayersContainer}>
            <Text style={styles.contextualLayersTitle}>Contextual layers</Text>
            <Row
              value={this.state.dummyValue}
              onValueChange={val => this.setState({ dummyValue: val })}
            >
              <Text>Protected Areas</Text>
            </Row>
          </View>
        </View>
      </View>
    );
  }
}

export default RightDrawer;
