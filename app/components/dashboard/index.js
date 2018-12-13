// @flow

import React, { PureComponent } from 'react';
import { View, ScrollView, RefreshControl, Platform, Text, StatusBar } from 'react-native';
import Config from 'react-native-config';
import { Navigation } from 'react-native-navigation';

import { requestLocationPermissions } from 'helpers/app';
import AreaList from 'containers/common/area-list';
import Row from 'components/common/row';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import i18n from 'locales';
import styles from './styles';
import SafeArea, { withSafeArea } from 'react-native-safe-area';

const SafeAreaView = withSafeArea(View, 'margin', 'bottom');
const settingsIcon = require('assets/settings.png');
const nextIcon = require('assets/next.png');

type Props = {
  componentId: string,
  setAreasRefreshing: boolean => void,
  isConnected: boolean,
  needsUpdate: boolean,
  appSyncing: boolean,
  refreshing: boolean,
  pristine: boolean,
  setSelectedAreaId: string => void,
  setPristine: boolean => void,
  updateApp: () => void,
  showNotConnectedNotification: () => void
};

class Dashboard extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        rightButtons: [
          {
            id: 'settings',
            icon: settingsIcon
          }
        ],
        title: {
          text: Config.APP_NAME
        }
      }
    };
  }

  static disableListener() {
    return false;
  }

  reportsAction: { callback: () => void, icon: any };

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);

    this.reportsAction = {
      callback: this.onPressReports,
      icon: nextIcon
    };
  }

  componentDidMount() {
    requestLocationPermissions();
    tracker.trackScreenView('Home - Dashboard');
    this.checkNeedsUpdate();
    if (this.props.refreshing && !this.props.appSyncing) {
      this.props.setAreasRefreshing(false);
    }

    // Determine the current insets. This is so, for the page indictator view,
    // we can add additional padding to ensure the white background is extended
    // beyond the safe area.
    SafeArea.getSafeAreaInsetsForRootView().then(result => {
      this.setState(state => ({
        bottomSafeAreaInset: result.safeAreaInsets.bottom
      }));
    });

    // Can remove when this is fixed: https://github.com/wix/react-native-navigation/issues/4432
    if (Platform.OS === 'android') {
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          elevation: 0
        }
      });
    }
  }

  componentDidDisappear() {
    const { pristine, setPristine, refreshing, setAreasRefreshing } = this.props;
    if (pristine) {
      setPristine(false);
    }
    if (refreshing) {
      setAreasRefreshing(false);
    }
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'settings') {
      Navigation.push(this.props.componentId, {
        component: {
          name: 'ForestWatcher.Settings'
        }
      });
    }
  }

  onRefresh = () => {
    const { isConnected, appSyncing, updateApp, setAreasRefreshing, showNotConnectedNotification } = this.props;
    if (appSyncing) return;

    if (isConnected) {
      setAreasRefreshing(true);
      updateApp();
    } else {
      showNotConnectedNotification();
    }
  };

  onAreaPress = (areaId: string, name: string) => {
    if (areaId) {
      this.props.setSelectedAreaId(areaId);
      Navigation.push(this.props.componentId, {
        component: {
          name: 'ForestWatcher.Map',
          options: {
            topBar: {
              title: {
                text: name
              }
            }
          }
        }
      });
    }
  };

  onPressReports = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Reports'
      }
    });
  };

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
    const bottomSafeAreaInset = this.state?.bottomSafeAreaInset || 0;
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
        <Text style={styles.label}>{i18n.t('settings.yourAreas')}</Text>
        <ScrollView
          style={styles.containerScroll}
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
            <View>
              <AreaList onAreaPress={this.onAreaPress} showCache pristine={pristine} />
            </View>
          </View>
        </ScrollView>
        <SafeAreaView style={styles.contentContainer}>
          <Row
            style={[
              styles.row,
              {
                height: 64 + bottomSafeAreaInset,
                backgroundColor: Theme.background.white,
                paddingBottom: bottomSafeAreaInset,
                marginBottom: -bottomSafeAreaInset
              }
            ]}
            action={this.reportsAction}
          >
            <Text style={styles.textMyReports}>{i18n.t('dashboard.myReports')}</Text>
          </Row>
        </SafeAreaView>
      </View>
    );
  }
}

export default Dashboard;
