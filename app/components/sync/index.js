import React, { PureComponent } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Theme from 'config/theme';
import Constants from 'config/constants';
import I18n from 'locales';
import ActionButton from 'components/common/action-button';
import styles from './styles';

const WIFI = Constants.reach.WIFI;
const MOBILE = Constants.reach.MOBILE;

class Sync extends PureComponent {
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
    const { canSyncDataOnMobile, completeTimeoutFlag, dismissTimeoutFlag } = this.state;
    const { readyState, actionsPending } = this.props;
    const hasToSync = () => (
      (canSyncDataOnMobile && prevState.canSyncDataOnMobile !== canSyncDataOnMobile) || actionsPending > 0
    );
    if (hasToSync()) {
      this.syncData();
    }
    if (readyState && completeTimeoutFlag && (readyState !== prevState.readyState
      || completeTimeoutFlag !== prevState.completeTimeoutFlag)) {
      this.dismissTimeout = setTimeout(this.dismiss, 1000);
    }
    if (readyState && dismissTimeoutFlag && dismissTimeoutFlag !== prevState.dismissTimeoutFlag) {
      this.dismissModal();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.completeTimeout);
    clearTimeout(this.dismissTimeout);
  }

  getTexts = () => {
    const { isConnected, reach, readyState } = this.props;
    const texts = {};
    if (isConnected) {
      if (!this.state.completeTimeoutFlag || !readyState) {
        texts.title = WIFI.includes(reach) ? I18n.t('home.title.updating') : I18n.t('home.title.outOfDate');
        texts.subtitle = WIFI.includes(reach) ? I18n.t('home.subtitle.takesTime') : I18n.t('home.subtitle.mobile');
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
    if (this.state.canSyncDataOnMobile || (isConnected && WIFI.includes(reach))) {
      this.completeTimeout = setTimeout(this.complete, 2000);
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
    this.props.navigator.dismissModal();
  }

  render() {
    const { isConnected, reach, readyState } = this.props;
    const { completeTimeoutFlag } = this.state;
    const { title, subtitle } = this.getTexts();

    return (
      <View style={[styles.mainContainer, styles.center]}>
        <View>
          <View style={styles.textContainer}>
            {isConnected && WIFI.includes(reach) && (!readyState || !completeTimeoutFlag) &&
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
          {!MOBILE.includes(reach) && (!readyState || !completeTimeoutFlag) &&
            <View>
              <ActionButton
                monochrome
                noIcon
                style={styles.button}
                onPress={this.dismissModal}
                text={I18n.t('home.skip').toUpperCase()}
              />
            </View>
          }
          {isConnected && MOBILE.includes(reach) &&
          <View style={styles.buttonGroupContainer}>
            <ActionButton
              style={[styles.groupButton, styles.groupButtonLeft]}
              monochrome
              noIcon
              onPress={this.dismissModal}
              text={I18n.t('home.skip').toUpperCase()}
            />
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
  isConnected: React.PropTypes.bool.isRequired,
  reach: React.PropTypes.string.isRequired,
  navigator: React.PropTypes.object.isRequired,
  readyState: React.PropTypes.bool.isRequired,
  actionsPending: React.PropTypes.number.isRequired,
  syncApp: React.PropTypes.func.isRequired
};

export default Sync;
