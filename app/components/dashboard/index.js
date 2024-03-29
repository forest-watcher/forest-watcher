// @flow

import React, { PureComponent } from 'react';
import {
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { checkMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';

import Row from 'components/common/row';
import debounceUI from 'helpers/debounceUI';
import { trackMenuButtonPress, trackScreenView } from 'helpers/analytics';
import i18n from 'i18next';
import styles from './styles';
import { showLocationPermissionsScreen, showWelcomeScreen } from 'screens/common';
import Theme from 'config/theme';
import type { Team } from '../../types/teams.types';
import type { AppUpdateType } from '../../types/app.types';

const settingsIcon = require('assets/settings.png');
const nextIcon = require('assets/next.png');
const areasIcon = require('assets/areas.png');
const reportsIcon = require('assets/reports.png');
const routesIcon = require('assets/routes.png');
const teamsIcon = require('assets/teams.png');

type Props = {
  componentId: string,
  setAreasRefreshing: boolean => void,
  hasSeenWelcomeScreen: boolean,
  isConnected: boolean,
  needsUpdate: boolean,
  appSyncing: boolean,
  refreshing: boolean,
  pristine: boolean,
  setPristine: boolean => void,
  invites: Array<Team>,
  needsAppUpdate: AppUpdateType,
  isAppUpdate: boolean,
  setWelcomeScreenSeen: () => void,
  updateApp: () => void,
  showNotConnectedNotification: () => void,
  getTeamInvites: () => void,
  checkAppVersion: () => void
};

class Dashboard extends PureComponent<Props> {
  static options(passProps: {}) {
    return {
      topBar: {
        title: {
          text: i18n.t('commonText.appName'),
          fontSize: Platform.OS === 'android' ? 24 : 20
        },
        largeTitle: {
          visible: true
        },
        background: {
          color: Theme.background.main
        }
      }
    };
  }

  static disableListener() {
    return false;
  }

  areasAction: { callback: () => void, icon: any };

  teamsAction: { callback: () => void, icon: any };

  reportsAction: { callback: () => void, icon: any };

  routesAction: { callback: () => void, icon: any };

  settingsAction: { callback: () => void, icon: any };

  doneLocationPermissionsShowCheck: boolean;

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);

    this.doneLocationPermissionsShowCheck = false;

    this.areasAction = {
      callback: this.onPressAreas,
      icon: nextIcon
    };

    this.reportsAction = {
      callback: this.onPressReports,
      icon: nextIcon
    };

    this.routesAction = {
      callback: this.onPressRoutes,
      icon: nextIcon
    };

    this.settingsAction = {
      callback: this.onPressSettings,
      icon: nextIcon
    };

    this.teamsAction = {
      callback: this.onPressTeams,
      icon: nextIcon
    };
  }

  async componentDidMount() {
    trackScreenView('Home - Dashboard');
    this.props.checkAppVersion();
    this.checkNeedsUpdate();
    this.props.getTeamInvites();
    if (this.props.refreshing && !this.props.appSyncing) {
      this.props.setAreasRefreshing(false);
    }

    // Can remove when this is fixed: https://github.com/wix/react-native-navigation/issues/4432
    if (Platform.OS === 'android') {
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          elevation: 0
        }
      });
    }

    Linking.addEventListener('url', link => {
      if (link && link.url) {
        this.launchImportBundleModal(link.url);
      }
    });

    const deepLink: ?string = await Linking.getInitialURL();
    if (deepLink) {
      this.launchImportBundleModal(deepLink);
    }

    // This is called both here and componentDidAppear because componentDidAppear isn't called when setting
    // the app root using RNN
    this.showOnboardingScreensIfNecessary();
  }

  componentDidAppear() {
    // This is called both here and componentDidAppear because componentDidAppear isn't called when setting
    // the app root using RNN
    this.showOnboardingScreensIfNecessary();
  }

  showOnboardingScreensIfNecessary: () => any = debounceUI(async () => {
    const { hasSeenWelcomeScreen, isAppUpdate } = this.props;
    if (!hasSeenWelcomeScreen) {
      if (isAppUpdate) {
        this.onRefresh();
      }
      this.props.setWelcomeScreenSeen();
      showWelcomeScreen(() => {
        this.showOnboardingScreensIfNecessary();
      });
      // Only show location permission prompt on iOS 14+, don't track whether this has been seen in redux
      // state, because we need to show it every launch until user has responded to permission
    } else if (
      Platform.OS === 'ios' &&
      parseInt(Platform.Version, 10) >= 14 &&
      !this.doneLocationPermissionsShowCheck
    ) {
      this.doneLocationPermissionsShowCheck = true;
      // Check both location permissions as we want to make sure neither have been requested!
      const permissionsToCheck = [PERMISSIONS.IOS.LOCATION_ALWAYS, PERMISSIONS.IOS.LOCATION_WHEN_IN_USE];
      const locationPermissions = await checkMultiple(permissionsToCheck);
      // According to Docs: DENIED = The permission has not been requested / is denied but requestable
      // this is what we want for our check because location permissions are NOT requestable if already denied
      if (
        Object.values(locationPermissions).filter(permission => permission === RESULTS.DENIED).length ===
        permissionsToCheck.length
      ) {
        showLocationPermissionsScreen();
      }
    } else if (Platform.OS === 'android' && !this.doneLocationPermissionsShowCheck) {
      const fineLocationCheck = await PermissionsAndroid.checkPermission(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (!fineLocationCheck) {
        showLocationPermissionsScreen();
        this.doneLocationPermissionsShowCheck = true;
      }
    }
  });

  componentDidDisappear() {
    const { pristine, setPristine, refreshing, setAreasRefreshing } = this.props;
    if (pristine) {
      setPristine(false);
    }
    if (refreshing) {
      setAreasRefreshing(false);
    }
  }

  onRefresh: () => void = () => {
    const { isConnected, appSyncing, updateApp, setAreasRefreshing, showNotConnectedNotification } = this.props;
    if (appSyncing) {
      return;
    }

    if (isConnected) {
      setAreasRefreshing(true);
      updateApp();
    } else {
      showNotConnectedNotification();
    }
  };

  onPressAreas: () => void = debounceUI(() => {
    trackMenuButtonPress('areas');
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Areas'
      }
    });
  });

  onPressReports: () => void = debounceUI(() => {
    trackMenuButtonPress('reports');
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Reports'
      }
    });
  });

  onPressRoutes: () => void = debounceUI(() => {
    trackMenuButtonPress('routes');
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Routes'
      }
    });
  });

  onPressSettings: () => void = debounceUI(() => {
    trackMenuButtonPress('settings');
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Settings'
      }
    });
  });

  onPressTeams: () => void = debounceUI(() => {
    trackMenuButtonPress('teams');
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Teams'
      }
    });
  });

  onPressInvite(team: Team) {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.TeamDetails',
        passProps: {
          team,
          invited: true
        }
      }
    });
  }

  launchImportBundleModal: () => void = debounceUI((bundlePath: string) => {
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.ImportBundleStart',
              options: {
                modalPresentationStyle: 'overCurrentContext'
              },
              passProps: {
                bundlePath
              }
            }
          }
        ]
      }
    });
  });

  getPristine: () => boolean = () => this.props.pristine;

  checkNeedsUpdate() {
    const { needsUpdate, updateApp } = this.props;
    if (needsUpdate) {
      updateApp();
    }
  }

  disablePristine: () => void = () => {
    this.props.setPristine(false);
  };

  getNotice(): ?React$Element<any> {
    if (this.props.needsAppUpdate.shouldUpdate) {
      return (
        <Row
          action={{
            icon: nextIcon,
            callback: () => Linking.openURL(this.props.needsAppUpdate.url)
          }}
          rowStyle={{ ...styles.noticeRow, opacity: 1, marginVertical: 0 }}
          iconStyle={{ tintColor: 'white' }}
        >
          <View>
            <Text style={styles.noticeTitle}>{i18n.t('update.title')}</Text>
            <Text style={styles.noticeSubtitle}>{i18n.t('update.subtitle')}</Text>
          </View>
        </Row>
      );
    } else if (this.props.invites?.length > 0) {
      const localisationKey =
        this.props.invites?.length > 1
          ? 'teams.notifications.newInviteTitle_other'
          : 'teams.notifications.newInviteTitle_one';
      return (
        <Row
          action={{
            icon: nextIcon,
            callback: () => this.onPressInvite(this.props.invites[0])
          }}
          rowStyle={{ ...styles.noticeRow, opacity: 1, marginVertical: 0 }}
          iconStyle={{ tintColor: 'white' }}
        >
          <View>
            <Text style={styles.noticeTitle}>{i18n.t(localisationKey, { count: this.props.invites?.length })}</Text>
            <Text style={styles.noticeSubtitle}>{i18n.t('teams.notifications.newInviteSubtitle')}</Text>
          </View>
        </Row>
      );
    } else {
      return null;
    }
  }

  render(): React$Element<any> {
    const { pristine, refreshing, appSyncing } = this.props;
    const isIOS = Platform.OS === 'ios';
    // we remove the event handler to improve performance
    // this is done this way because in android the event listener needs to be at...
    // ...the root and in iOS needs to be a children to scroll view
    const disablePristine = pristine ? this.disablePristine : undefined;
    const androidListener = !isIOS ? this.getPristine : Dashboard.disableListener;
    const iOSListener = isIOS ? this.getPristine : Dashboard.disableListener;
    const androidHandler = !isIOS ? this.disablePristine : undefined;
    const iOSHandler = isIOS ? this.disablePristine : undefined;
    return (
      <View style={styles.container} onStartShouldSetResponder={androidListener} onResponderRelease={androidHandler}>
        <StatusBar networkActivityIndicatorVisible={appSyncing} />
        <ScrollView
          contentInsetAdjustmentBehavior={'always'}
          onScroll={disablePristine}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={this.onRefresh} />}
        >
          {this.getNotice()}
          <View onStartShouldSetResponder={iOSListener} onResponderRelease={iOSHandler} style={styles.list}>
            <Row action={this.areasAction}>
              <View style={styles.tableRowContent}>
                <Image source={areasIcon} />
                <Text style={styles.tableRowText}>{i18n.t('dashboard.areas')}</Text>
              </View>
            </Row>
            <Row action={this.teamsAction}>
              <View style={styles.tableRowContent}>
                <Image source={teamsIcon} />
                <Text style={styles.tableRowText}>{i18n.t('dashboard.teams')}</Text>
              </View>
            </Row>
            <Row action={this.reportsAction}>
              <View style={styles.tableRowContent}>
                <Image source={reportsIcon} />
                <Text style={styles.tableRowText}>{i18n.t('dashboard.reports')}</Text>
              </View>
            </Row>
            <Row action={this.routesAction}>
              <View style={styles.tableRowContent}>
                <Image source={routesIcon} />
                <Text style={styles.tableRowText}>{i18n.t('dashboard.routes')}</Text>
              </View>
            </Row>
            <Row action={this.settingsAction}>
              <View style={styles.tableRowContent}>
                <Image source={settingsIcon} />
                <Text style={styles.tableRowText}>{i18n.t('dashboard.settings')}</Text>
              </View>
            </Row>
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default Dashboard;
