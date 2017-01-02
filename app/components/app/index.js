import React, { Component } from 'react';
import {
  StatusBar,
  View,
  NavigationExperimental
} from 'react-native';

import renderScene from 'routes';
import Header from 'containers/common/header';
import styles from './styles';

const {
  CardStack: NavigationCardStack
} = NavigationExperimental;

function renderHeader() {
  return <Header />;
}

class App extends Component {
  componentDidMount() {
    StatusBar.setBarStyle('light-content');
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <NavigationCardStack
          navigationState={this.props.navigationRoute}
          onNavigate={this.props.onNavigate}
          onNavigateBack={this.props.onNavigateBack}
          renderHeader={renderHeader}
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
