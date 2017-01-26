import React, { Component } from 'react';
import {
  StatusBar,
  View,
  NavigationExperimental,
  ActivityIndicator
} from 'react-native';

import renderScene from 'routes';
import Header from 'containers/common/header';
import Login from 'containers/login';
import { getToken, setToken } from 'helpers/user';
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
  }

  componentDidMount() {
    StatusBar.setBarStyle('light-content');
    this.checkSetup();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.loggedIn) {
      this.setState({ loading: false });
    }
  }

  async checkSetup() {
    const userToken = await getToken();

    if (!userToken) {
      this.props.setLoginModal(true);
    } else {
      this.props.setLoginStatus({
        loggedIn: true,
        token: userToken
      });
      this.setState({ loading: false });
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
