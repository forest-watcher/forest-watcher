import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, ActivityIndicator, Text } from 'react-native';
import Theme from 'config/theme';
import Constants from 'config/constants';
import I18n from 'locales';
import ActionButton from 'components/common/action-button';
import styles from './styles';

const Timer = require('react-native-timer');

const WIFI = Constants.reach.WIFI;
const MOBILE = Constants.reach.MOBILE;

class Sync extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };

  constructor(props) {
    super(props);
    this.state = {
      canSyncDataOnMobile: false,
      completeTimeoutFlag: false,
      dismissTimeoutFlag: false
    };
  }

  componentDidMount() {
    this.syncData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { completeTimeoutFlag, dismissTimeoutFlag, canSyncDataOnMobile } = this.state;
    const { actionsPending } = this.props;
    if (actionsPending > 0) {
      this.syncData();
    }
    if (canSyncDataOnMobile && canSyncDataOnMobile !== prevState.canSyncDataOnMobile) {
      this.syncData();
    }
    if (actionsPending === 0 && completeTimeoutFlag && !Timer.timeoutExists(this, 'dismissModal')) {
      Timer.setTimeout(this, 'dismissModal', this.dismiss, 1000);
    }
    if (actionsPending === 0 && dismissTimeoutFlag && dismissTimeoutFlag !== prevState.dismissTimeoutFlag) {
      this.dismissModal();
    }
  }

  componentWillUnmount() {
    Timer.clearTimeout(this, 'completeModal');
    Timer.clearTimeout(this, 'dismissModal');
  }

  onSkipPress = () => {
    this.props.setSyncSkip(true);
    this.dismissModal();
  }

  getTexts = () => {
    const { isConnected, reach, actionsPending } = this.props;
    const { canSyncDataOnMobile } = this.state;
    const texts = {};
    if (isConnected) {
      if (!this.state.completeTimeoutFlag || actionsPending > 0) {
        texts.title = (WIFI.includes(reach) || canSyncDataOnMobile) ? I18n.t('home.title.updating') : I18n.t('home.title.outOfDate');
        texts.subtitle = (WIFI.includes(reach) || canSyncDataOnMobile) ? I18n.t('home.subtitle.takesTime') : I18n.t('home.subtitle.mobile');
      } else {
        texts.title = I18n.t('home.title.updated');
        texts.subtitle = I18n.t('home.subtitle.updated');
      }
    } else {
      texts.title = I18n.t('home.title.outOfDate');
      texts.subtitle = I18n.t('home.subtitle.noConnection');
    }
    return texts;
  }

  syncData = () => {
    const { isConnected, reach } = this.props;
    if (isConnected && (this.state.canSyncDataOnMobile || WIFI.includes(reach))) {
      Timer.setTimeout(this, 'completeModal', this.complete, 2000);
      this.props.syncApp();
    }
  }

  complete = () => {
    this.setState({ completeTimeoutFlag: true });
  }

  dismiss = () => {
    this.setState({ dismissTimeoutFlag: true });
  }

  dismissModal = () => {
    this.props.setSyncModal(false);
    // FIXME: this should only dismiss one modal
    this.props.navigator.dismissAllModals();
  }

  render() {
    const { isConnected, reach, actionsPending, hasAreas } = this.props;
    const { completeTimeoutFlag, canSyncDataOnMobile } = this.state;
    const { title, subtitle } = this.getTexts();

    const showSkipSyncingBtn = (!MOBILE.includes(reach) || canSyncDataOnMobile) && (actionsPending > 0 || !completeTimeoutFlag) && hasAreas;

    return (
      <View style={[styles.mainContainer, styles.center]}>
        <View>
          <View style={styles.textContainer}>
            {isConnected && (WIFI.includes(reach) || canSyncDataOnMobile) && (actionsPending > 0 || !completeTimeoutFlag) &&
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
          {showSkipSyncingBtn &&
            <View>
              <ActionButton
                monochrome
                noIcon
                style={styles.button}
                onPress={this.onSkipPress}
                text={I18n.t('home.skip').toUpperCase()}
              />
            </View>
          }
          {isConnected && MOBILE.includes(reach) && !canSyncDataOnMobile &&
          <View style={styles.buttonGroupContainer}>
            {hasAreas &&
              <ActionButton
                style={[styles.groupButton, styles.groupButtonLeft]}
                monochrome
                noIcon
                onPress={this.onSkipPress}
                text={I18n.t('home.skip').toUpperCase()}
              />
            }
            <ActionButton
              style={[styles.groupButton, styles.groupButtonRight]}
              main
              noIcon
              onPress={() => this.setState({ canSyncDataOnMobile: true })}
              text={I18n.t('home.update').toUpperCase()}
            />
          </View>
          }
        </View>
      </View>
    );
  }
}

Sync.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  hasAreas: PropTypes.bool.isRequired,
  reach: PropTypes.string.isRequired,
  navigator: PropTypes.object.isRequired,
  actionsPending: PropTypes.number.isRequired,
  syncApp: PropTypes.func.isRequired,
  setSyncModal: PropTypes.func.isRequired,
  setSyncSkip: PropTypes.func.isRequired
};

export default Sync;
