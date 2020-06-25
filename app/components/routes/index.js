// @flow

import React, { PureComponent } from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';

import _ from 'lodash';
import moment from 'moment';
import i18n from 'i18next';
import debounceUI from 'helpers/debounceUI';
import { trackScreenView } from 'helpers/analytics';
import styles from './styles';
import { Navigation } from 'react-native-navigation';

import EmptyState from 'components/common/empty-state';
import RoutePath from 'components/common/route-path';

import type { Route } from 'types/routes.types';

import ShareSheet from 'components/common/share';
import VerticalSplitRow from 'components/common/vertical-split-row';
import DataCacher from 'containers/common/download';

import { formatDistance, getDistanceOfPolyline } from 'helpers/map';
import Theme, { isSmallScreen } from 'config/theme';

import calculateBundleSize from 'helpers/sharing/calculateBundleSize';
import generateUniqueID from 'helpers/uniqueId';
import { getShareButtonText } from 'helpers/sharing/utils';

const emptyIcon = require('assets/routesEmpty.png');
const routeMapBackground = require('assets/routeMapBackground.png');

const RoutePreviewSize = isSmallScreen ? 86 : 122;

type Props = {|
  +componentId: string,
  +exportRoutes: (ids: Array<string>) => Promise<void>,
  +routes: Array<Route>,
  +initialiseAreaLayerSettings: (string, string) => void,
  +setSelectedAreaId: (areaId: string) => void
|};

type State = {|
  +bundleSize: number | typeof undefined,
  +creatingArchive: boolean,
  +selectedForExport: Array<string>,
  +inShareMode: boolean
|};

export default class Routes extends PureComponent<Props, State> {
  static options(passProps: {}) {
    return {
      topBar: {
        background: {
          color: Theme.colors.veryLightPink
        },
        title: {
          text: i18n.t('dashboard.routes')
        }
      }
    };
  }

  fetchId: ?string = null;
  shareSheet: any;

  constructor(props: Props) {
    super(props);

    // Set an empty starting state for this object. If empty, we're not in export mode. If there's items in here, export mode is active.
    this.state = {
      bundleSize: undefined,
      creatingArchive: false,
      inShareMode: false,
      selectedForExport: []
    };
  }

  componentDidMount() {
    trackScreenView('My Routes');
  }

  fetchExportSize = async (routeIds: Array<string>) => {
    const currentFetchId = generateUniqueID();
    this.fetchId = currentFetchId;
    this.setState({
      bundleSize: undefined
    });
    const fileSize = await calculateBundleSize({
      routes: this.props.routes.filter(route => routeIds.includes(route.id))
    });
    if (this.fetchId === currentFetchId) {
      this.setState({
        bundleSize: fileSize
      });
    }
  };

  onFrequentlyAskedQuestionsPress = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.FaqCategories'
      }
    });
  };

  /**
   * Handles the route row being selected while in export mode.
   * Will swap the state for the specified row, to show in the UI if it has been selected or not.
   */
  onRouteSelectedForExport = (route: Route) => {
    this.setState(
      state => {
        if (state.selectedForExport.includes(route.id)) {
          return {
            selectedForExport: [...state.selectedForExport].filter(id => route.id !== id)
          };
        } else {
          return {
            selectedForExport: [...state.selectedForExport, route.id]
          };
        }
      },
      () => {
        this.fetchExportSize(this.state.selectedForExport);
      }
    );
  };

  /**
   * Handles a route row being selected.
   */
  onClickRoute = debounceUI((route: Route) => {
    // Testing against a mocked route? You must provide your own area id here!
    this.props.setSelectedAreaId(route.areaId);
    this.props.initialiseAreaLayerSettings(route.id, route.areaId);
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
    this.setState({
      creatingArchive: true
    });
    await this.props.exportRoutes(selectedRoutes);
    this.setState({
      creatingArchive: false
    });
    // $FlowFixMe
    this.shareSheet?.setSharing?.(false);
    this.setSharing(false);
  });

  setAllSelected = (selected: boolean) => {
    const selectedForExport = selected ? this.props.routes.map(route => route.id) : [];
    this.fetchExportSize(selectedForExport);
    this.setState({
      selectedForExport
    });
  };

  setSharing = (sharing: boolean) => {
    // Can set selectedForExport to [] either way as we want to start sharing again with none selected
    this.setState({
      bundleSize: undefined,
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
    sorted.sort((a, b) => b.startDate - a.startDate);
    return sorted;
  }

  /**
   * Renders a component for the route's path to be shown on the row
   * @param <Route> route The route to render a path for
   */
  renderRoutePath = (route: Route) => {
    return <RoutePath size={RoutePreviewSize} route={route} />;
  };

  /**
   * renderItems - Returns an array of rows, based on the route data provided.
   *
   * @param  {Array} data <Route>  An array of routes.
   * @param  {void} onPress             The action callback.
   * @return {Array}                    An array of route rows.
   */
  renderItems(data: Array<Route>, onPress: Route => void): any {
    return this.sortedRoutes(data).map((item, index) => {
      const routeDistance = getDistanceOfPolyline(item.locations);
      const dateText = moment(item.endDate).format('ll');
      const distanceText = formatDistance(routeDistance, 1, false);
      const subtitle = dateText + ', ' + distanceText;

      return (
        <View key={`${item.id}-list`} style={styles.rowContainer}>
          <VerticalSplitRow
            backgroundImageResizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
            key={item.id}
            onSettingsPress={this.onClickRouteSettings.bind(this, item)}
            onPress={() => {
              onPress(item);
            }}
            renderImageChildren={this.renderRoutePath.bind(this, item)}
            imageSrc={routeMapBackground}
            title={item.name}
            subtitle={subtitle}
            disableSettingsButton={this.state.inShareMode}
            selected={this.state.inShareMode ? this.state.selectedForExport.includes(item.id) : null}
            largerLeftPadding
            largeImage
          />
          <DataCacher dataType={'route'} id={item.id} disabled={this.state.inShareMode} showTooltip={false} />
        </View>
      );
    });
  }

  renderSection(title: string, ...options: [Array<Route>, (Route) => void]) {
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
   * renderRoutes - Renders a list of routes.
   *
   * @param  {array} routes      An array of routes.
   * @param  {bool} inExportMode  Whether the user is in export mode or not. If in export mode, a different callback will be used.
   * @return {ScrollView}         A ScrollView element with all content rendered to it.
   */
  renderRoutes(routes: Array<Route>, inExportMode: boolean) {
    const hasRoutes = !!routes.length;

    if (!hasRoutes) {
      return (
        <View style={styles.containerEmpty}>
          <EmptyState
            actionTitle={i18n.t('routes.empty.action')}
            body={i18n.t('routes.empty.body')}
            onActionPress={this.onFrequentlyAskedQuestionsPress}
            icon={emptyIcon}
            title={i18n.t('routes.empty.title')}
          />
        </View>
      );
    }

    const [importedRoutes, myRoutes] = _.partition(routes, route => route.isImported);

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.container}>
          {myRoutes &&
            myRoutes.length > 0 &&
            this.renderSection(
              i18n.t('routes.myRoutes'),
              myRoutes,
              inExportMode ? this.onRouteSelectedForExport : this.onClickRoute
            )}
          {importedRoutes &&
            importedRoutes.length > 0 &&
            this.renderSection(
              i18n.t('routes.importedRoutes'),
              importedRoutes,
              inExportMode ? this.onRouteSelectedForExport : this.onClickRoute
            )}
        </View>
      </ScrollView>
    );
  }

  render() {
    // Determine if we're in export mode, and how many routes have been selected to export.
    const totalToExport = this.state.selectedForExport.length;
    const totalRoutes = this.props.routes.length;
    const sharingType = i18n.t('sharing.type.routes');

    return (
      /* View necessary to fix the swipe back on wix navigation */
      <View style={styles.container}>
        <ShareSheet
          componentId={this.props.componentId}
          isSharing={this.state.creatingArchive}
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
          shareButtonInProgressTitle={i18n.t('sharing.inProgress', { type: sharingType })}
          shareButtonDisabledTitle={i18n.t('sharing.title', { type: sharingType })}
          shareButtonEnabledTitle={getShareButtonText(sharingType, totalToExport, this.state.bundleSize)}
        >
          {this.renderRoutes(this.props.routes, this.state.inShareMode)}
        </ShareSheet>
      </View>
    );
  }
}
