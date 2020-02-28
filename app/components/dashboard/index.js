// @flow

import React, { PureComponent } from 'react';
import { Image, Platform, RefreshControl, ScrollView, StatusBar, Text, View } from 'react-native';
import Config from 'react-native-config';
import { Navigation } from 'react-native-navigation';

import Row from 'components/common/row';
import debounceUI from 'helpers/debounceUI';
import tracker from 'helpers/googleAnalytics';
import i18n from 'i18next';
import styles from './styles';

const settingsIcon = require('assets/settings.png');
const nextIcon = require('assets/next.png');
const areasIcon = require('assets/areas.png');
const reportsIcon = require('assets/reports.png');
const routesIcon = require('assets/routes.png');

type Props = {
  componentId: string,
  setAreasRefreshing: boolean => void,
  hasSeenWelcomeScreen: boolean,
  isConnected: boolean,
  needsUpdate: boolean,
  appSyncing: boolean,
  refreshing: boolean,
  pristine: boolean,
  setSelectedAreaId: string => void,
  setPristine: boolean => void,
  setWelcomeScreenSeen: boolean => void,
  updateApp: () => void,
  showNotConnectedNotification: () => void,
  activeRoute: Route
};

class Dashboard extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: Config.APP_NAME
        },
        largeTitle: {
          visible: true
        }
      }
    };
  }

  static disableListener() {
    return false;
  }

  areasAction: { callback: () => void, icon: any };

  reportsAction: { callback: () => void, icon: any };

  routesAction: { callback: () => void, icon: any };

  settingsAction: { callback: () => void, icon: any };

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);

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
  }

  componentDidMount() {
    tracker.trackScreenView('Home - Dashboard');
    this.checkNeedsUpdate();
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

    this.showWelcomeScreenIfNecessary();
  }

  componentWillUnmount() {
    // Not mandatory
    if (this.navigationEventListener) {
      this.navigationEventListener.remove();
    }
  }

  componentDidAppear() {
    this.showWelcomeScreenIfNecessary();
  }

  showWelcomeScreenIfNecessary = debounceUI(() => {
    const { hasSeenWelcomeScreen } = this.props;
    if (!hasSeenWelcomeScreen) {
      this.props.setWelcomeScreenSeen(true);
      Navigation.showModal({
        component: {
          name: 'ForestWatcher.Welcome',
          options: {
            // animations: {
            //   showModal: {
            //     waitForRender: true,
            //     // Works on Android but not iOS
            //     alpha: {
            //       from: 0,
            //       to: 1,
            //       duration: 250
            //     },
            //     // Only works on iOS
            //     content: {
            //       alpha: {
            //         from: 0,
            //         to: 1,
            //         duration: 250
            //       }
            //     }
            //   }
            // },
            layout: { backgroundColor: 'rgba(0,0,0,0.8)' },
            screenBackgroundColor: 'rgba(0,0,0,0.8)',
            modalPresentationStyle: 'overCurrentContext'
          }
        }
      });
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

  onRefresh = () => {
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

  onPressAreas = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Areas'
      }
    });
  });

  onPressReports = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Reports'
      }
    });
  });

  onPressRoutes = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Routes'
      }
    });
  });

  onPressSettings = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Settings'
      }
    });
  });

  getPristine = (): boolean => this.props.pristine;

  checkNeedsUpdate() {
    const { needsUpdate, updateApp } = this.props;
    if (needsUpdate) {
      updateApp();
    }
  }

  disablePristine = () => {
    this.props.setPristine(false);
  };

  render() {
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
          onScroll={disablePristine}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={this.onRefresh} />}
        >
          <View
            onStartShouldSetResponder={iOSListener}
            onResponderRelease={iOSHandler}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            scrollEnabled
          >
            <Row action={this.areasAction}>
              <View style={styles.tableRowContent}>
                <Image source={areasIcon} />
                <Text style={styles.tableRowText}>{i18n.t('dashboard.areas')}</Text>
              </View>
            </Row>
            <Row action={this.routesAction}>
              <View style={styles.tableRowContent}>
                <Image source={routesIcon} />
                <Text style={styles.tableRowText}>{i18n.t('dashboard.routes')}</Text>
              </View>
            </Row>
            <Row action={this.reportsAction}>
              <View style={styles.tableRowContent}>
                <Image source={reportsIcon} />
                <Text style={styles.tableRowText}>{i18n.t('dashboard.reports')}</Text>
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
