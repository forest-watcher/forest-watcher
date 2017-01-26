import React, { Component } from 'react';
import {
  View,
  NavigationExperimental,
  ActivityIndicator
} from 'react-native';

import renderScene from 'routes';
import Header from 'containers/common/header';
import Login from 'containers/login';
import { getToken, setToken, getSetupStatus } from 'helpers/user';
import config from 'config/theme';
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
    this.checkBeforeRender();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.loggedIn) {
      this.setState({ loading: false });
    }
  }

  async checkBeforeRender() {
    const userToken = await getToken();

    if (!userToken) {
      this.props.setLoginModal(true);
    } else {
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
