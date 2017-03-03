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
    if (isConnected) {
      const { data } = this.props;
      if (!data.report) this.props.getReportQuestions();
      if (!data.dailyFeedback) this.props.getFeedbackQuestions('daily');
      if (!data.weeklyFeedback) this.props.getFeedbackQuestions('weekly');
    }
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
      if (this.props.data.areas) {
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
      if (!this.props.areasSynced && !this.props.data.areas) {
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
  data: React.PropTypes.shape({
    areas: React.PropTypes.bool.isRequired,
    report: React.PropTypes.bool.isRequired,
    dailyFeedback: React.PropTypes.bool.isRequired,
    weeklyFeedback: React.PropTypes.bool.isRequired
  }).isRequired,
  getAreas: React.PropTypes.func.isRequired,
  areasSynced: React.PropTypes.bool.isRequired,
  getUser: React.PropTypes.func.isRequired,
  setIsConnected: React.PropTypes.func.isRequired,
  setLoginModal: React.PropTypes.func.isRequired,
  getReportQuestions: React.PropTypes.func.isRequired,
  getFeedbackQuestions: React.PropTypes.func.isRequired,
  setLoginStatus: React.PropTypes.func.isRequired
};

Home.navigationOptions = {
  header: {
    visible: false
  }
};

export default Home;
