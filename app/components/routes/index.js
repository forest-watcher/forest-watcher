// @flow

import React, { PureComponent } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native';

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

import VerticalSplitRow from 'components/common/vertical-split-row';
import DataCacher from 'containers/common/download';

import { formatDistance, getDistanceOfPolyline } from 'helpers/map';
import Theme, { isSmallScreen } from 'config/theme';

import calculateBundleSize from 'helpers/sharing/calculateBundleSize';
import generateUniqueID from 'helpers/uniqueId';
import { getShareButtonText } from 'helpers/sharing/utils';
import { pushMapScreen } from 'screens/maps';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import Row from 'components/common/row';

const emptyIcon = require('assets/routesEmpty.png');
const routeMapBackground = require('assets/routeMapBackground.png');

const RoutePreviewSize = isSmallScreen ? 86 : 122;

type Props = {|
  +componentId: string,
  +exportRoutes: (ids: Array<string>) => Promise<void>,
  +routes: Array<Route>,
  +initialiseAreaLayerSettings: (string, string) => void,
  +syncing: boolean,
  +syncRoutes: (routes: Array<Route>) => void
|};

type State = {|
  +bundleSize: number | typeof undefined,
  +creatingArchive: boolean,
  +selectedForExport: Array<string>,
  +inShareMode: boolean,
  +inSyncMode: boolean
|};

export default class Routes extends PureComponent<Props, State> {
  static options(passProps: {}): {
    topBar: { background: { color: any, ... }, title: { text: string, ... }, ... },
    ...
  } {
    return {
      topBar: {
        title: {
          text: i18n.t('dashboard.routes')
        }
      }
    };
  }

  fetchId: ?string = null;

  constructor(props: Props) {
    super(props);

    // Set an empty starting state for this object. If empty, we're not in export mode. If there's items in here, export mode is active.
    this.state = {
      bundleSize: undefined,
      creatingArchive: false,
      inShareMode: false,
      selectedForExport: []
    };

    Navigation.events().bindComponent(this);
  }

  componentDidMount() {
    trackScreenView('My Routes');
  }

  fetchExportSize: (routeIds: Array<string>) => Promise<void> = async (routeIds: Array<string>) => {
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

  onFrequentlyAskedQuestionsPress: () => void = () => {
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
  onRouteSelectedForExport: (route: Route) => void = (route: Route) => {
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
  onClickRoute: any = debounceUI((route: Route) => {
    this.props.initialiseAreaLayerSettings(route.id, route.areaId);
    pushMapScreen(this.props.componentId, { areaId: route.areaId, routeId: route.id }, route.name);
  });

  onClickRouteSettings: any = debounceUI((route: Route) => {
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
  onExportRoutesTapped: any = debounceUI(async selectedRoutes => {
    this.setState({
      creatingArchive: true
    });
    await this.props.exportRoutes(selectedRoutes);
    this.setState({
      creatingArchive: false
    });
    this.setSharing(false);
  });

  setAllSelected: (selected: boolean) => void = (selected: boolean) => {
    const selectedForExport = selected ? this.props.routes.map(route => route.id) : [];
    this.fetchExportSize(selectedForExport);
    this.setState({
      selectedForExport
    });
  };

  setSharing: (sharing: boolean) => void = (sharing: boolean) => {
    // Can set selectedForExport to [] either way as we want to start sharing again with none selected
    this.setState({
      bundleSize: undefined,
      inShareMode: sharing,
      selectedForExport: []
    });
  };

  setSyncing: (syncing: boolean) => void = (syncing: boolean) => {
    this.setState({
      bundleSize: undefined,
      inSyncMode: syncing,
      selectedForExport: []
    });
  };

  setDoneButtonVisible: (visible: boolean) => void = (visible: boolean) => {
    if (!this.props.componentId) {
      return;
    }
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: visible
          ? [
              {
                id: 'key_export_done',
                text: i18n.t('commonText.done'),
                fontSize: 16,
                fontFamily: Theme.font,
                color: Theme.colors.turtleGreen,
                backgroundColor: Theme.background.main
              }
            ]
          : []
      }
    });
  };

  navigationButtonPressed({ buttonId }: any) {
    if (buttonId === 'key_export_done') {
      this.setSharing(false);
      this.setSyncing(false);
      this.setDoneButtonVisible(false);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.syncing && !this.props.syncing) {
      this.setSyncing(false);
    }
  }

  /**
   * Sorts oroutes in descending date order
   *
   * @param {Array} routes <Route> An array of routes
   * @return {Array} The routes, but sorted...
   */
  sortedRoutes(routes: Array<Route>): Array<Route> {
    const sorted = [...routes];
    sorted.sort((a, b) => b.startDate - a.startDate);
    return sorted;
  }

  /**
   * Renders a component for the route's path to be shown on the row
   * @param <Route> route The route to render a path for
   */
  renderRoutePath: (route: Route) => React$Element<typeof RoutePath> = (route: Route) => {
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
      const uploaded = item.status === 'uploaded' ? i18n.t('routes.sync.uploaded') : i18n.t('routes.sync.notUploaded');
      const subtitle = dateText + ', ' + distanceText + '\n' + uploaded;

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
            subtitleStyle={{ fontSize: 12, lineHeight: 16 }}
            disableSettingsButton={this.state.inShareMode || this.state.inSyncMode}
            selected={
              this.state.inShareMode || this.state.inSyncMode ? this.state.selectedForExport.includes(item.id) : null
            }
            largerPadding
            largeImage
            nameContainerStyle={{ paddingBottom: 20, paddingTop: 24 }}
          />
          {!(this.state.inShareMode || this.state.inSyncMode) && (
            <DataCacher dataType={'route'} id={item.id} showTooltip={false} />
          )}
        </View>
      );
    });
  }

  renderSection(title: string, ...options: [Array<Route>, (Route) => void]): React$Element<any> {
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
  renderRoutes(routes: Array<Route>, inExportMode: boolean): React$Element<any> {
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

  render(): React$Element<any> {
    // Determine if we're in export mode, and how many routes have been selected to export.
    const totalToExport = this.state.selectedForExport.length;
    const totalRoutes = this.props.routes.length;
    const sharingType = i18n.t('sharing.type.routes');

    return (
      /* View necessary to fix the swipe back on wix navigation */
      <View style={styles.container}>
        <View style={{ flexGrow: 1 }}>
          {(this.state.inShareMode || this.state.inSyncMode) && (
            <Row
              rowStyle={{
                borderTopColor: Theme.colors.veryLightPinkTwo,
                borderTopWidth: 1,
                marginBottom: 0,
                marginTop: 24
              }}
              style={{ flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }}
            >
              <Text style={styles.rowText}>
                {totalRoutes !== 1
                  ? i18n.t('routes.export.manyRoutes', { count: totalRoutes })
                  : i18n.t('routes.export.oneRoute', { count: 1 })}
              </Text>
              <TouchableOpacity onPress={() => this.setAllSelected(!(totalToExport > 0))}>
                <Text style={styles.buttonText}>
                  {totalToExport > 0 ? i18n.t('commonText.deselectAll') : i18n.t('commonText.selectAll')}
                </Text>
              </TouchableOpacity>
            </Row>
          )}
          {this.renderRoutes(this.props.routes, this.state.inShareMode || this.state.inSyncMode)}
          <BottomTray
            showProgressBar={false}
            requiresSafeAreaView={true}
            style={{ flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between' }}
          >
            {!this.state.inShareMode && (
              <ActionButton
                disabled={(this.state.inSyncMode && totalToExport === 0) || this.props.syncing}
                noIcon
                onPress={() => {
                  if (!this.state.inSyncMode) {
                    this.setSyncing(!this.state.inSyncMode);
                  } else {
                    const routes = this.props.routes.filter(x => this.state.selectedForExport.includes(x.id));
                    this.props.syncRoutes(routes);
                  }
                  this.setDoneButtonVisible(!this.state.inSyncMode);
                }}
                secondary={false}
                text={
                  !this.state.inSyncMode
                    ? i18n.t('routes.sync.buttonTitle')
                    : this.props.syncing
                    ? i18n.t('routes.sync.buttonProgress')
                    : i18n.t('routes.sync.buttonActive')
                }
                style={{ height: 48 }}
                textStyle={{ flexGrow: 0 }}
              />
            )}
            {!this.state.inSyncMode && (
              <ActionButton
                disabled={this.state.creatingArchive || (this.state.inShareMode && totalToExport === 0)}
                noIcon
                style={{ height: 48, marginTop: 10 }}
                onPress={() => {
                  if (!this.state.inShareMode) {
                    this.setSharing(!this.state.inShareMode);
                  } else {
                    this.onExportRoutesTapped(this.state.selectedForExport);
                  }
                  this.setDoneButtonVisible(!this.state.inShareMode);
                }}
                secondary={true}
                text={
                  this.state.creatingArchive
                    ? i18n.t('sharing.inProgress', { type: sharingType })
                    : this.state.inShareMode
                    ? getShareButtonText(sharingType, totalToExport, this.state.bundleSize)
                    : i18n.t('sharing.title', { type: sharingType })
                }
                textStyle={{ flexGrow: 0 }}
              />
            )}
          </BottomTray>
        </View>
      </View>
    );
  }
}
