import React, { Component } from 'react';
import {
  View,
  ActivityIndicator,
  StatusBar
} from 'react-native';

import { AppNavigator } from 'app/main';
import { addNavigationHelpers } from 'react-navigation';

import Login from 'containers/login';
import { getToken, setToken, getSetupStatus } from 'helpers/user';
import styles from './styles';
import Theme from 'config/theme';

function renderLoading() {
  return (
    <View style={[styles.mainContainer, styles.center]}>
      <ActivityIndicator
        style={{ height: 80 }}
        size="large"
      />
      <Login />
    </View>
  );
}

class App extends Component {
  static navigationOptions = {
    header: {
      visible: false
    }
  }

  constructor() {
    super();

    this.state = {
      loading: true
    };
    this.setup = false;
  }

  componentDidMount() {
    StatusBar.setBarStyle('dark-content', true);
    // StatusBar.setTranslucent(true);
    // StatusBar.setBarStyle('default', false);

    // StatusBar.setBackgroundColor(Theme.background.main);
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
    // setToken('');
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
