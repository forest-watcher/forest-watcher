// @flow

import React, { PureComponent } from 'react';
import { NativeModules, Platform, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import Row from 'components/common/row';
import moment from 'moment';
import i18n from 'locales';
import debounceUI from 'helpers/debounceUI';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';
import { colors } from 'config/theme';
import { Navigation } from 'react-native-navigation';
import { withSafeArea } from 'react-native-safe-area';
// import exportReports from 'helpers/exportReports';
import { readableNameForReportName } from 'helpers/reports';

import type { Route } from 'types/routes.types';

import ShareSheet from 'components/common/share';
import VerticalSplitRow from 'components/common/vertical-split-row';

import { formatDistance, getDistanceOfPolyline } from 'helpers/map';

const SafeAreaView = withSafeArea(View, 'padding', 'bottom');

const editIcon = require('assets/edit.png');
const nextIcon = require('assets/next.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');

type Props = {
  routes: Array<Route>,
  setSelectedAreaId: (areaId: string) => void,
  showExportReportsSuccessfulNotification: () => void
};

export default class Routes extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('dashboard.routes')
        }
      }
    };
  }

  constructor(props) {
    super(props);

    // Set an empty starting state for this object. If empty, we're not in export mode. If there's items in here, export mode is active.
    this.state = {
      selectedForExport: {}
    };

    this.onClickShare = this.onClickShare.bind(this);
  }

  componentDidMount() {
    tracker.trackScreenView('My Routes');
  }

  onClickShare() {
    const routes = this.props.routes || [];

    // Create an object that'll contain the 'selected' state for each route.
    let exportData = {};
    routes.forEach(route => {
      exportData[route.areaId + route.id] = false;
    });

    this.setState({
      selectedForExport: exportData
    });
  }

  /**
   * Handles the route row being selected while in export mode.
   * Will swap the state for the specified row, to show in the UI if it has been selected or not.
   */
  onRouteSelectedForExport = route => {
    this.setState(state => ({
      selectedForExport: {
        ...state.selectedForExport,
        [route.areaId + route.id]: !state.selectedForExport[route.areaId + route.id]
      }
    }));
  };

  /**
   * Handles a route row being selected.
   */
  onClickRoute = debounceUI((route: Route) => {
    // Testing against a mocked route? You must provide your own area id here!
    this.props.setSelectedAreaId(route.areaId);
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Map',
        options: {
          topBar: {
            title: {
              text: route.name
            }
          }
        },
        passProps: {
          previousRoute: route
        }
      }
    });
  });

  onClickRouteSettings = debounceUI((route: Route) => {
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.RouteDetail',
              passProps: {
                routeId: route.id,
                routeName: route.name
              }
            }
          }
        ]
      }
    });
  });

  /**
   * Handles the 'export <x> routes' button being tapped.
   *
   * @param  {Object} selectedRoutes A mapping of route identifiers to a boolean dictating whether they've been selected for export.
   */
  onExportRoutesTapped = debounceUI(async selectedRoutes => {
    let routes = this.props.routes || [];
    let routesToExport = [];

    // Iterate through the selected reports. If the route has been marked to export, find the full route object.
    Object.keys(selectedRoutes).forEach(key => {
      const routeIsSelected = selectedRoutes[key];
      if (!routeIsSelected) {
        return;
      }

      const selectedRoute = routes.find(route => route.areaId + route.id === key);
      routesToExport.push(selectedRoute);
    });

    console.log('Export routes', routesToExport);

    // await exportReports(
    //   reportsToExport,
    //   this.props.templates,
    //   this.props.appLanguage,
    //   Platform.select({
    //     android: RNFetchBlob.fs.dirs.DownloadDir,
    //     ios: RNFetchBlob.fs.dirs.DocumentDir
    //   })
    // );

    // // TODO: Handle errors returned from export function.

    // // Show 'export successful' notification, and reset export state to reset UI.
    // this.props.showExportReportsSuccessfulNotification();
    // this.shareSheet?.setSharing?.(false);
    // this.setState({
    //   selectedForExport: {}
    // });

    // if (Platform.OS === 'android') {
    //   NativeModules.Intents.launchDownloadsDirectory();
    // }
  });

  setAllSelected = (selected: boolean) => {
    const mergedRoutes = this.props.routes || [];

    // Create an object that'll contain the 'selected' state for each route.
    let exportData = {};
    mergedRoutes.forEach(route => {
      exportData[route.areaId + route.id] = selected;
    });

    this.setState({
      selectedForExport: exportData
    });
  };

  setSharing = (sharing: boolean) => {
    if (sharing) {
      this.onClickShare();
    } else {
      this.setState({
        selectedForExport: {}
      });
    }
  };

  /**
   * Sorts oroutes in descending date order
   *
   * @param {Array} routes <Route> An array of routes
   * @return {Array} The routes, but sorted...
   */
  sortedRoutes(routes: Array<Route>) {
    let sorted = [...routes];
    sorted.sort((a, b) => {
      if (a.date > b.date) {
        return -1;
      }
      if (a.date < b.date) {
        return +1;
      }
      return 0;
    });
    return sorted;
  }

  /**
   * renderItems - Returns an array of rows, based on the route data provided.
   *
   * @param  {Array} data <Route>  An array of routes.
   * @param  {any} image                The action image.
   * @param  {void} onPress             The action callback.
   * @return {Array}                    An array of route rows.
   */
  renderItems(data: Array<Route>, image: any, onPress: string => void) {
    return this.sortedRoutes(data).map((item, index) => {
      const routeDistance = getDistanceOfPolyline(item.locations);
      const dateText = moment(item.endDate).format('ll');
      const distanceText = formatDistance(routeDistance, 1, false);
      const subtitle = dateText + ', ' + distanceText;
      // const action = {
      //   icon,
      //   callback: () => {
      //     onPress(item.title);
      //   },
      //   position
      // };

      return (
        <VerticalSplitRow
          onSettingsPress={this.onClickRouteSettings.bind(this, item)}
          onPress={() => {
            onPress(item);
          }}
          title={item.name}
          subtitle={subtitle}
          selected={this.state.selectedForExport[item.areaId + item.id]}
        />
      );
    });
  }

  renderSection(title: string, ...options: [Array<Route>, any, (string) => void]) {
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{title}</Text>
        </View>
        {this.renderItems(...options)}
      </View>
    );
  }

  /**
   * renderRoutesScrollView - Renders a list of routes.
   *
   * @param  {array} routes      An array of routes.
   * @param  {bool} inExportMode  Whether the user is in export mode or not. If in export mode, a different callback will be used.
   * @return {ScrollView}         A ScrollView element with all content rendered to it.
   */
  renderRoutesScrollView(routes, inExportMode) {
    const hasRoutes = !!routes.length;

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {hasRoutes ? (
          <View style={styles.container}>
            {routes &&
              routes.length > 0 &&
              this.renderSection(
                i18n.t('routes.myRoutes'),
                routes,
                nextIcon,
                inExportMode ? this.onRouteSelectedForExport : this.onClickRoute
              )}
          </View>
        ) : (
          <View style={styles.containerEmpty}>
            <Text style={styles.emptyTitle}>{i18n.t('routes.empty')}</Text>
          </View>
        )}
      </ScrollView>
    );
  }

  render() {
    // Determine if we're in export mode, and how many routes have been selected to export.
    const inExportMode = Object.keys(this.state.selectedForExport).length > 0;
    const totalToExport = Object.values(this.state.selectedForExport).filter(row => row === true).length;

    const totalRoutes = this.props.routes.length;

    return (
      /* View necessary to fix the swipe back on wix navigation */
      <View style={styles.container}>
        <ShareSheet
          componentId={this.props.componentId}
          enabled={totalToExport > 0}
          onShare={() => {
            this.onExportRoutesTapped(this.state.selectedForExport);
          }}
          onSharingToggled={this.setSharing}
          onToggleAllSelected={this.setAllSelected}
          ref={ref => {
            this.shareSheet = ref;
          }}
          selected={totalToExport}
          selectAllCountText={
            totalRoutes > 1
              ? i18n.t('routes.export.manyRoutes', { count: totalRoutes })
              : i18n.t('routes.export.oneRoute', { count: 1 })
          }
          shareButtonDisabledTitle={i18n.t('routes.share')}
          shareButtonEnabledTitle={
            totalToExport > 0
              ? totalToExport == 1
                ? i18n.t('routes.export.oneRouteAction', { count: 1 })
                : i18n.t('routes.export.manyRoutesAction', { count: totalToExport })
              : i18n.t('routes.export.noneSelected')
          }
          total={totalRoutes}
        >
          {this.renderRoutesScrollView(this.props.routes, inExportMode)}
        </ShareSheet>
      </View>
    );
  }
}
