import React, { Component } from 'react';
import {
  View,
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
    this.checkBeforeRender();
    tracker.trackScreenView('Home');
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
    this.props.setLoginStatus({
      loggedIn: true,
      token: userToken
    });

    this.props.navigateReset(setupStatus ? 'Dashboard' : 'Setup');
  }

  async checkBeforeRender() {
    await this.props.checkLogged();
    const userToken = await getToken();
    if (!userToken) {
      this.props.setLoginModal(true);
    } else {
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
  setLoginModal: React.PropTypes.func.isRequired,
  setLoginStatus: React.PropTypes.func.isRequired
};

Home.navigationOptions = {
  header: {
    visible: false
  }
};

export default Home;
