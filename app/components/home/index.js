import React, { Component } from 'react';
import {
  View,
  NetInfo,
  ActivityIndicator
} from 'react-native';

import { getToken, getSetupStatus } from 'helpers/user';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

class Home extends Component {
  constructor() {
    super();
    this.setup = false;
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener('change', this.handleConnectionChange);
    NetInfo.isConnected.fetch()
      .done((isConnected) => this.props.setIsConnected(isConnected));

    this.checkBeforeRender();
    tracker.trackScreenView('Home');
  }

  componentWillReceiveProps(newProps) {
    if ((newProps.loggedIn && !this.setup) || (this.props.areasSynced !== newProps.areasSynced)) {
      this.checkSetup();
    }
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('change', this.handleConnectionChange);
  }

  handleConnectionChange = (isConnected) => {
    this.props.setIsConnected(isConnected);
  };

  async checkSetup() {
    this.setup = true;
    const userToken = await getToken();
    const setupStatus = await getSetupStatus();
    this.props.setLoginStatus({
      loggedIn: true,
      token: userToken
    });

    if (userToken && !this.props.user) {
      this.props.getUser();
    }

    if (userToken && !this.props.areasSynced) {
      this.props.getAreas();
    }

    if (this.props.areasSynced) {
      if (this.props.hasAreas) {
        this.props.navigateReset('Dashboard');
      } else {
        this.props.navigateReset(setupStatus ? 'Dashboard' : 'Setup');
      }
    }
  }

  async checkBeforeRender() {
    await this.props.checkLogged();
    const userToken = await getToken();
    if (!userToken) {
      this.props.setLoginModal(true);
    } else {
      if (!this.props.areasSynced && !this.props.hasAreas) {
        this.props.getAreas();
      }
      tracker.setUser(userToken);
      this.checkSetup();
    }
  }

  render() {
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
}

Home.propTypes = {
  getAreas: React.PropTypes.func.isRequired,
  hasAreas: React.PropTypes.bool.isRequired,
  areasSynced: React.PropTypes.bool.isRequired,
  getUser: React.PropTypes.func.isRequired,
  setIsConnected: React.PropTypes.func.isRequired,
  setLoginModal: React.PropTypes.func.isRequired,
  setLoginStatus: React.PropTypes.func.isRequired
};

Home.navigationOptions = {
  header: {
    visible: false
  }
};

export default Home;
