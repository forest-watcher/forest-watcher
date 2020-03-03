// @flow

import React, { PureComponent } from 'react';
import { View, Text, ScrollView } from 'react-native';

import Theme from 'config/theme';

import moment from 'moment';
import i18n from 'i18next';
import debounceUI from 'helpers/debounceUI';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';
import { Navigation } from 'react-native-navigation';
// import exportReports from 'helpers/exportReports';

import type { Route } from 'types/routes.types';

import ShareSheet from 'components/common/share';
import VerticalSplitRow from 'components/common/vertical-split-row';

import { formatDistance, getDistanceOfPolyline } from 'helpers/map';
import { routeSVGProperties } from 'helpers/routeSVG';

const nextIcon = require('assets/next.png');
const routeMapBackground = require('assets/routeMapBackground.png');

import Svg, { Path, Circle } from 'react-native-svg';

type Props = {
  componentId: string,
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
      inShareMode: false,
      selectedForExport: []
    };
  }

  componentDidMount() {
    tracker.trackScreenView('My Routes');
  }

  /**
   * Handles the route row being selected while in export mode.
   * Will swap the state for the specified row, to show in the UI if it has been selected or not.
   */
  onRouteSelectedForExport = route => {
    this.setState(state => {
      if (state.selectedForExport.includes(route.areaId + route.id)) {
        return {
          selectedForExport: [...state.selectedForExport].filter(id => route.areaId + route.id != id)
        };
      } else {
        const selected = [...state.selectedForExport];
        selected.push(route.areaId + route.id);
        return {
          selectedForExport: selected
        };
      }
    });
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
  onExportRoutesTapped = debounceUI(selectedRoutes => {
    //const routes = this.props.routes || [];

    // Iterate through the selected reports. If the route has been marked to export, find the full route object.
    //const routesToExport = selectedRoutes.map(key => {
    //  return routes.find(route => route.areaId + route.id === key);
    //});

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
    this.shareSheet?.setSharing?.(false);
    this.setState({
      inShareMode: false
    });

    // if (Platform.OS === 'android') {
    //   NativeModules.Intents.launchDownloadsDirectory();
    // }
  });

  setAllSelected = (selected: boolean) => {
    this.setState({
      selectedForExport: selected ? this.props.routes.map(route => route.areaId + route.id) : []
    });
  };

  setSharing = (sharing: boolean) => {
    // Can set selectedForExport to [] either way as we want to start sharing again with none selected
    this.setState({
      inShareMode: sharing,
      selectedForExport: []
    });
  };

  /**
   * Sorts oroutes in descending date order
   *
   * @param {Array} routes <Route> An array of routes
   * @return {Array} The routes, but sorted...
   */
  sortedRoutes(routes: Array<Route>) {
    const sorted = [...routes];
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

      const svgProperties = routeSVGProperties(item.locations, 100);

            console.log("Render item", svgProperties);

      const combinedId = item.areaId + item.id;
      return (
        <VerticalSplitRow
          key={combinedId}
          onSettingsPress={this.onClickRouteSettings.bind(this, item)}
          onPress={() => {
            onPress(item);
          }}
          renderImageChildren={() => {
            if (!svgProperties) {
              return null;
            }
            return (
              <View style={styles.routeContainer}>
                <Svg style={{ bacgkroundColor: 'red' }} height="100" width="100" viewBox="-16 -16 132 132">
                  <Path
                    d={svgProperties?.path}
                    fill={'transparent'}
                    stroke={Theme.colors.white}
                    strokeWidth="7"
                  />
                  <Circle
                    cx={svgProperties.firstPoint?.x}
                    cy={svgProperties.firstPoint?.y}
                    r="8"
                    strokeWidth="8"
                    stroke={Theme.colors.white}
                    fill={'rgba(220, 220, 220, 1)'}
                  />
                  <Circle
                    cx={svgProperties.lastPoint?.x}
                    cy={svgProperties.lastPoint?.y}
                    r="8"
                    strokeWidth="8"
                    stroke={Theme.colors.white}
                    fill={'rgba(220, 220, 220, 1)'}
                  />
                </Svg>
              </View>
            )
          }}
          imageSrc={routeMapBackground}
          title={item.name}
          subtitle={subtitle}
          selected={this.state.inShareMode ? this.state.selectedForExport.includes(combinedId) : null}
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
    const totalToExport = this.state.selectedForExport.length;
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
          {this.renderRoutesScrollView(this.props.routes, this.state.inShareMode)}
        </ShareSheet>
      </View>
    );
  }
}
