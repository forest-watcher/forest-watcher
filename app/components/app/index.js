import React, { Component } from 'react';
import {
  View,
  NavigationExperimental,
  ActivityIndicator,
  StatusBar
} from 'react-native';

import renderScene from 'routes';
import Header from 'containers/common/header';
import Login from 'containers/login';
import { getToken, setToken, getSetupStatus } from 'helpers/user';
import styles from './styles';

const {
  CardStack: NavigationCardStack
} = NavigationExperimental;

function renderHeader() {
  return <Header />;
}

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
      this.props.navigate({
        key: 'setup',
        section: 'setup'
      });
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
    setToken('');
    const userToken = await getToken();

    if (!userToken) {
      this.props.setLoginModal(true);
    } else {
      this.checkSetup();
    }
  }

  render() {
    return (
      this.state.loading
        ? renderLoading()
        : <View style={styles.mainContainer}>
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
