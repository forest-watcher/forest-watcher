import React, { Component } from 'react';
import {
  StatusBar,
  View,
  NavigationExperimental
} from 'react-native';

import renderScene from 'routes';
import styles from './styles';

const {
  CardStack: NavigationCardStack
} = NavigationExperimental;

class App extends Component {
  componentDidMount() {
    StatusBar.setBarStyle('light-content');
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <NavigationCardStack
          direction={'horizontal'}
          navigationState={this.props.navigationRoute}
          onNavigate={this.props.onNavigate}
          onNavigateBack={this.props.onNavigateBack}
          renderScene={renderScene}
          style={styles.main}
        />
      </View>
    );
  }
}

App.propTypes = {
  navigationRoute: React.PropTypes.object.isRequired,
  onNavigate: React.PropTypes.func.isRequired,
  onNavigateBack: React.PropTypes.func.isRequired
};

export default App;
