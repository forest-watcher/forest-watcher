import React, { Component } from 'react';
import {
  View,
  TouchableHighlight,
  Text
} from 'react-native';
import styles from './styles';

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideHeader: this.props.navigation.header
    };
  }

  componentWillReceiveProps(props) {
    this.state = {
      hideHeader: props.navigation.header
    };
  }

  render() {
    return (
      this.state.hideHeader
      ?
        <View style={styles.container}>
          {this.props.navigation.index > 0
            ? <TouchableHighlight
              underlayColor="transparent"
              style={styles.backButton}
              onPress={this.props.navigateBack}
              hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableHighlight>
            : null
          }
          <Text style={styles.title}>FOREST WATCHER 2.0</Text>
        </View>
      : null
    );
  }
}

Header.propTypes = {
  navigateBack: React.PropTypes.func.isRequired,
  navigation: React.PropTypes.object.isRequired
};

export default Header;
