import React, { Component } from 'react';
import {
  StatusBar,
  View,
  NavigationExperimental
} from 'react-native';

import renderScene from 'routes';
import Header from 'containers/common/header';
import Login from 'containers/login';
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
          onNavigate={this.props.navigate}
          onNavigateBack={this.props.navigateBack}
          renderHeader={renderHeader}
          renderScene={renderScene}
          style={styles.main}
        />
        <Login />
      </View>
    );
  }
}

App.propTypes = {
  navigationRoute: React.PropTypes.object.isRequired,
  navigate: React.PropTypes.func.isRequired,
  navigateBack: React.PropTypes.func.isRequired
};

export default App;
