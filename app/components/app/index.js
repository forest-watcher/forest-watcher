import React, { Component } from 'react';
import {
  View,
  ActivityIndicator,
  StatusBar
} from 'react-native';

import { AppNavigator } from 'app/main';
import { addNavigationHelpers } from 'react-navigation';

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
      <Login />
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
    const setupStatus = true; //await getSetupStatus();
    if (!setupStatus) {
      this.props.navigate('Setup');
      this.props.setLoginStatus({
        loggedIn: true,
        token: userToken
      });
      this.setState({ loading: false });
    } else {
      this.props.setLoginStatus({
        loggedIn: true,
        token: userToken
      });
      this.setState({ loading: false });
    }
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
    const { dispatch, navigation } = this.props;
    return (
      this.state.loading
        ? renderLoading()
        : <View style={styles.mainContainer}>
          <AppNavigator navigation={addNavigationHelpers({ dispatch, state: navigation })} />
          <Login />
        </View>
    );
  }
}

App.propTypes = {
  navigation: React.PropTypes.object.isRequired,
  setLoginModal: React.PropTypes.func.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

export default App;
