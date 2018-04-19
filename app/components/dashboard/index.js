// @flow

import React, { PureComponent } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Platform,
  Text,
  StatusBar
} from 'react-native';

import AreaList from 'containers/common/area-list';
import Row from 'components/common/row';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import I18n from 'locales';
import styles from './styles';

const settingsIcon = require('assets/settings.png');
const nextIcon = require('assets/next.png');

const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line

type Props = {
  navigator: Object,
  setAreasRefreshing: boolean => void,
  areasOutdated: boolean,
  appSyncing: boolean,
  refreshing: boolean,
  pristine: boolean,
  updateSelectedIndex: number => void,
  setPristine: boolean => void,
  updateApp: () => void
};

class Dashboard extends PureComponent<Props> {

  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main,
    navBarNoBorder: true
  };

  static navigatorButtons = {
    rightButtons: [
      {
        icon: settingsIcon,
        id: 'settings'
      }
    ]
  };

  static disableListener() {
    return false;
  }

  reportsAction: { callback: () => void, icon: any } = {
    callback: this.onPressReports,
    icon: nextIcon
  }

  constructor(props: Props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      Location.requestAlwaysAuthorization();
    }
    tracker.trackScreenView('Dashboard');
    this.checkNeedsUpdate();
    if (this.props.refreshing && !this.props.appSyncing) {
      this.props.setAreasRefreshing(false);
    }
  }

  onRefresh = () => {
    this.props.setAreasRefreshing(true);
    this.props.updateApp();
  }

  onAreaPress = (areaId: string, name: string, index?: number) => {
    if (typeof index === 'undefined') return;
    this.props.updateSelectedIndex(index);
    this.props.navigator.push({
      screen: 'ForestWatcher.Map',
      title: I18n.t('dashboard.map')
    });
  }

  onPressReports = () => {
    this.props.navigator.push({
      screen: 'ForestWatcher.Reports',
      title: I18n.t('dashboard.myReports')
    });
  }

  onNavigatorEvent = (event: { type: string, id: string }) => {
    const { navigator, pristine, setPristine, refreshing, setAreasRefreshing } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'settings') {
        navigator.push({
          screen: 'ForestWatcher.Settings',
          title: 'Settings'
        });
      }
    } else if (event.id === 'willDisappear') {
      if (pristine) {
        setPristine(false);
      }
      if (refreshing) {
        setAreasRefreshing(false);
      }
    }
  }

  getPristine = (): boolean => (this.props.pristine)

  checkNeedsUpdate() {
    const { areasOutdated, appSyncing, updateApp } = this.props;
    if (areasOutdated && !appSyncing) {
      updateApp();
      this.showUpdatingNotification();
    }
  }

  showUpdatingNotification() {
    this.props.navigator.showInAppNotification({
      screen: 'ForestWatcher.ToastNotification',
      passProps: {
        text: 'Getting the latest alerts'
      },
      autoDismissTimerSec: 2
    });
  }

  disablePristine = () => {
    this.props.setPristine(false);
  }

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
      <View
        style={styles.container}
        onStartShouldSetResponder={androidListener}
        onResponderRelease={androidHandler}
      >
        <StatusBar networkActivityIndicatorVisible={appSyncing} />
        <View style={styles.backgroundHack} />
        <Text style={styles.label}>
          {I18n.t('settings.yourAreas')}
        </Text>
        <ScrollView
          style={styles.containerScroll}
          onScroll={disablePristine}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.onRefresh}
            />
          }
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
        <Row style={styles.row} action={this.reportsAction}>
          <Text style={styles.textMyReports}>{I18n.t('dashboard.myReports')}</Text>
        </Row>
      </View>
    );
  }
}

export default Dashboard;
