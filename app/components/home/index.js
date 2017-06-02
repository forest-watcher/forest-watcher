import React, { Component } from 'react';
import {
  View,
  ActivityIndicator,
  Text
} from 'react-native';
import ActionButton from 'components/common/action-button';

import { getLanguage } from 'helpers/language';
import Theme from 'config/theme';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

class Home extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };

  componentDidMount() {
    this.handleStatus();
    tracker.trackScreenView('Home');
  }

  componentWillReceiveProps(newProps) {
    if ((this.props.user.loggedIn !== newProps.user.loggedIn)
        || (this.props.areasSynced !== newProps.areasSynced)
        || (this.props.language && this.isDifferentLanguage())) {
      this.props = newProps;
      this.handleStatus();
    }
  }

  // TODO: move to container
  isDifferentLanguage() {
    return this.props.language !== getLanguage();
  }

  // TODO: transform into a single action => move to store
  cacheForms() {
    const isDifferentLanguage = this.isDifferentLanguage();
    if (!this.props.report || isDifferentLanguage) this.props.getReportQuestions();
    if (!this.props.dailyFeedback || isDifferentLanguage) this.props.getFeedbackQuestions('daily');
    if (!this.props.weeklyFeedback || isDifferentLanguage) this.props.getFeedbackQuestions('weekly');
  }

  handleStatus() {
    const { token, loggedIn } = this.props.user;
    if (token) {
      tracker.setUser(token);
      this.cacheForms();

      if (!loggedIn) {
        this.props.setLoginStatus({
          loggedIn: true,
          token
        });
      }

      // TODO: why does this escenario is possible?
      if (!this.props.user.hasData) {
        this.props.getUser();
      }

      if (this.isDifferentLanguage()) {
        this.props.setLanguage(getLanguage());
        this.props.getCountries();
      }

      if (this.props.areasSynced) {
        if (this.props.areas) {
          setTimeout(() => {
            this.props.navigator.resetTo({
              screen: 'ForestWatcher.Dashboard',
              title: 'FOREST WATCHER'
            });
          }, 100);
        } else {
          const { setupComplete } = this.props;
          setTimeout(() => {
            if (setupComplete === 'Dashboard') {
              this.props.navigator.resetTo({
                screen: 'ForestWatcher.Dashboard',
                title: 'FOREST WATCHER'
              });
            } else {
              this.props.navigator.resetTo({
                screen: 'ForestWatcher.Setup',
                title: 'Set up',
                passProps: {
                  goBackDisabled: true
                }
              });
            }
          }, 100);
        }
      } else {
        this.props.getAreas();
      }
    } else {
      this.props.navigator.resetTo({
        screen: 'ForestWatcher.Login'
      });
    }
  }

  render() {
    const online = true;
    const reach = 'wifi';
    let title;
    let subtitle;

    if (online) {
      title = reach === 'wifi' ? I18n.t('home.title.updating') : I18n.t('home.title.outOfDate');
      subtitle = reach === 'wifi' ? I18n.t('home.subtitle.takesTime') : I18n.t('home.subtitle.mobile');
    } else {
      title = I18n.t('home.title.outOfDate');
      subtitle = I18n.t('home.subtitle.noConnection');
    }

    return (
      <View style={[styles.mainContainer, styles.center]}>
        <View>
          <View style={styles.textContainer}>
            {online && reach === 'wifi' &&
              <ActivityIndicator
                color={Theme.colors.color1}
                style={{ height: 80 }}
                size="large"
              />
            }
            <Text style={styles.title}>
              {title}
            </Text>
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          </View>
          {reach !== 'mobile' ?
            <View>
              <ActionButton
                monochrome
                noIcon
                style={styles.button}
                onPress={() => {}}
                text={I18n.t('home.skip').toUpperCase()}
              />
            </View>
            :
            <View>
              <ActionButton
                monochrome
                noIcon
                onPress={() => {}}
                text={I18n.t('home.skip').toUpperCase()}
              />
              <ActionButton
                main
                noIcon
                onPress={() => {}}
                text={I18n.t('home.update').toUpperCase()}
              />
            </View>
          }
        </View>
      </View>
    );
  }
}

Home.propTypes = {
  user: React.PropTypes.shape({
    loggedIn: React.PropTypes.bool.isRequired,
    token: React.PropTypes.string,
    hasData: React.PropTypes.bool.isRequired
  }).isRequired,
  language: React.PropTypes.string,
  areas: React.PropTypes.bool.isRequired,
  setupComplete: React.PropTypes.bool.isRequired,
  report: React.PropTypes.bool.isRequired,
  dailyFeedback: React.PropTypes.bool.isRequired,
  weeklyFeedback: React.PropTypes.bool.isRequired,
  getAreas: React.PropTypes.func.isRequired,
  areasSynced: React.PropTypes.bool.isRequired,
  getUser: React.PropTypes.func.isRequired,
  getCountries: React.PropTypes.func.isRequired,
  getReportQuestions: React.PropTypes.func.isRequired,
  getFeedbackQuestions: React.PropTypes.func.isRequired,
  setLoginStatus: React.PropTypes.func.isRequired,
  setLanguage: React.PropTypes.func.isRequired,
  navigator: React.PropTypes.object.isRequired
};

Home.navigationOptions = {
  header: {
    visible: false
  }
};

export default Home;
