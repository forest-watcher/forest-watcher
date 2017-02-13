import React from 'react';
import {
  View,
  StatusBar
} from 'react-native';

import { StackNavigator } from 'react-navigation';
import { Routes, RoutesConfig } from 'routes';

import Login from 'containers/login';
import styles from './styles';

function App() {
  StatusBar.setBarStyle('default', true);

  const AppNavigator = StackNavigator(Routes, RoutesConfig);
  return (
    <View style={styles.mainContainer}>
      <AppNavigator />
      <Login />
    </View>
  );
}

App.propTypes = {};

export default App;
