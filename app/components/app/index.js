import React from 'react';
import {
  View,
  StatusBar
} from 'react-native';

import { StackNavigator } from 'react-navigation';
import { Routes, RoutesConfig } from 'routes';

import Login from 'containers/login';
import ConnectionStatus from 'containers/connectionstatus';
import styles from './styles';

StatusBar.setBarStyle('default', true);

const AppNavigator = StackNavigator(Routes, RoutesConfig);

const App = function () {
  return (
    <View style={styles.mainContainer}>
      <AppNavigator />
      <Login />
      <ConnectionStatus />
    </View>
  );
};

App.propTypes = {};

export default App;
