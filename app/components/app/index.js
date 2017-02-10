import React, { Component } from 'react';
import {
  View,
  ActivityIndicator,
  StatusBar
} from 'react-native';

import { withNavigation, StackNavigator } from 'react-navigation';
import { Routes, RoutesConfig } from 'routes';

import Login from 'containers/login';
import { getToken, getSetupStatus } from 'helpers/user';
import Theme from 'config/theme';
import styles from './styles';

function renderLoading() {
  return (
    <View style={[styles.mainContainer, styles.center]}>
      <ActivityIndicator
        color={Theme.colors.color1}
        style={{ height: 80 }}
        size="large"
      />
    </View>
  );
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      loading: true
    };
    this.setup = false;
  }

  componentDidMount() {
    StatusBar.setBarStyle('default', true);
    this.checkBeforeRender();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.loggedIn && !this.setup) {
      this.checkSetup();
    }
  }

  async checkSetup() {
    this.setup = true;
    const userToken = await getToken();
    const setupStatus = await getSetupStatus();
    if (!setupStatus) {
      this.props.navigateReset('Dashboard');
    }
    this.props.setLoginStatus({
      loggedIn: true,
      token: userToken
    });
    this.setState({ loading: false });
  }

  async checkBeforeRender() {
    const userToken = await getToken();

    if (!userToken) {
      this.props.setLoginModal(true);
    } else {
      this.checkSetup();
    }
  }

  render() {
    const AppNavigator = StackNavigator(Routes, RoutesConfig);
    return (
      this.state.loading
        ? renderLoading()
        : <View style={styles.mainContainer}>
          <AppNavigator />
          <Login />
        </View>
    );
  }
}

App.propTypes = {
  setLoginModal: React.PropTypes.func.isRequired
};

export default withNavigation(App);
