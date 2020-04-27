// @flow
import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Navigation } from 'react-native-navigation';

import type { Area } from 'types/areas.types';

import AreaList from 'containers/common/area-list';
import debounceUI from 'helpers/debounceUI';

import i18n from 'i18next';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

import EmptyState from 'components/common/empty-state';
import ShareSheet from 'components/common/share';

import exportLayerManifest from 'helpers/sharing/exportLayerManifest';
import manifestBundleSize from 'helpers/sharing/manifestBundleSize';
import generateUniqueID from 'helpers/uniqueId';
import { formatBytes } from 'helpers/data';

const plusIcon = require('assets/add.png');
const emptyIcon = require('assets/areasEmpty.png');

type Props = {|
  +areaDownloadTooltipSeen: boolean,
  +areas: Array<Area>,
  +initialiseAreaLayerSettings: (string, string) => void,
  +componentId: string,
  +exportAreas: (ids: Array<string>) => Promise<void>,
  +setAreaDownloadTooltipSeen: (seen: boolean) => void,
  +setSelectedAreaId: (id: string) => void,
  +showNotConnectedNotification: () => void,
  +offlineMode: boolean
|};

type State = {|
  +selectedForExport: Array<string>,
  +inShareMode: boolean
|};

class Areas extends Component<Props, State> {
  static options(passProps: {}) {
    return {
      topBar: {
        title: {
          text: i18n.t('areas.title')
        },
        rightButtons: [
          {
            id: 'addArea',
            icon: plusIcon
          }
        ]
      }
    };
  }

  shareSheet: any;

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
    // Set an empty starting state for this object. If empty, we're not in export mode. If there's items in here, export mode is active.
    this.state = {
      selectedForExport: [],
      inShareMode: false
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Areas');
  }

  navigationButtonPressed({ buttonId }: any) {
    if (buttonId === 'addArea') {
      this.onPressAddArea();
    }
  }

  onFrequentlyAskedQuestionsPress = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.FaqCategories'
      }
    });
  };

  fetchExportSize = async (areaIds: Array<string>) => {
    const currentFetchId = generateUniqueID();
    this.fetchId = currentFetchId;
    this.setState({
      bundleSize: undefined
    });
    const manifest = await exportLayerManifest(
      {
        areaIds,
        basemapIds: [],
        layerIds: [],
        reportIds: [],
        routeIds: []
      },
      this.props.areas.filter(area => {
        return areaIds.includes(area.id);
      }),
      []
    );
    const fileSize = manifestBundleSize(manifest);
    if (this.fetchId == currentFetchId) {
      this.setState({
        bundleSize: fileSize
      });
    }
  };

  /**
   * Handles the area row being selected while in export mode.
   * Will swap the state for the specified row, to show in the UI if it has been selected or not.
   */
  onAreaSelectedForExport = (areaId: string) => {
    this.setState(state => {
      if (state.selectedForExport.includes(areaId)) {
        const selectedForExport = [...state.selectedForExport].filter(id => areaId != id);
        this.fetchExportSize(selectedForExport);
        return {
          selectedForExport
        };
      } else {
        const selectedForExport = [...state.selectedForExport];
        selectedForExport.push(areaId);
        this.fetchExportSize(selectedForExport);
        return {
          selectedForExport: selectedForExport
        };
      }
    });
  };

  /**
   * Handles the 'export <x> areas' button being tapped.
   *
   * @param  {Array} selectedAreas An array of area identifiers that have been selected for export.
   */
  onExportAreasTapped = debounceUI(selectedAreas => {
    // TODO: Loading screen while the async function below executed
    this.props.exportAreas(selectedAreas);
    this.shareSheet?.setSharing?.(false);
    this.setSharing(false);
  });

  onAreaSettingsPress = debounceUI((areaId: string, name: string) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.AreaDetail',
        passProps: {
          id: areaId
        },
        options: {
          topBar: {
            title: {
              text: name
            }
          }
        }
      }
    });
  });

  onAreaPress = debounceUI((areaId: string, name: string) => {
    if (areaId) {
      this.props.setSelectedAreaId(areaId);
      this.props.initialiseAreaLayerSettings(areaId, areaId);
      Navigation.push(this.props.componentId, {
        component: {
          name: 'ForestWatcher.Map'
        }
      });
    }
  });

  onPressAddArea = debounceUI(() => {
    if (!this.props.areaDownloadTooltipSeen) {
      this.props.setAreaDownloadTooltipSeen(true);
      return;
    }

    const { offlineMode } = this.props;

    if (offlineMode) {
      this.props.showNotConnectedNotification();
      return;
    }

    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.SetupCountry'
      }
    });
  });

  setAllSelected = (selected: boolean) => {
    const selectedForExport = selected ? this.props.areas.map(area => area.id) : [];
    this.fetchExportSize(selectedForExport);
    this.setState({
      selectedForExport
    });
  };

  setSharing = (sharing: boolean) => {
    // If the user taps ANYWHERE set the area download tooltip as seen
    this.props.setAreaDownloadTooltipSeen(true);

    this.setState({
      inShareMode: sharing
    });

    if (!sharing) {
      this.setState({
        selectedForExport: []
      });
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          rightButtons: [
            {
              id: 'addArea',
              icon: plusIcon
            }
          ]
        }
      });
    }
  };

  render() {
    const { areas } = this.props;
    // Determine if we're in export mode, and how many areas have been selected to export.
    const totalToExport = this.state.selectedForExport.length;
    const totalAreas = areas.length;

    const hasAreas = areas && areas.length > 0;

    return (
      <View
        onStartShouldSetResponder={event => {
          // If the user taps ANYWHERE set the area download tooltip as seen
          event.persist();
          this.props.setAreaDownloadTooltipSeen(true);
        }}
        style={styles.container}
      >
        <ShareSheet
          disabled={!this.props.areaDownloadTooltipSeen}
          componentId={this.props.componentId}
          onStartShouldSetResponder={event => {
            // If the user taps ANYWHERE set the area download tooltip as seen
            event.persist();
            this.props.setAreaDownloadTooltipSeen(true);
          }}
          shareButtonDisabledTitle={i18n.t('areas.share')}
          enabled={totalToExport > 0}
          onShare={() => {
            this.onExportAreasTapped(this.state.selectedForExport);
          }}
          onSharingToggled={this.setSharing}
          onToggleAllSelected={this.setAllSelected}
          ref={ref => {
            this.shareSheet = ref;
          }}
          selected={totalToExport}
          selectAllCountText={
            totalAreas > 1
              ? i18n.t('areas.export.manyAreas', { count: totalAreas })
              : i18n.t('areas.export.oneArea', { count: 1 })
          }
          shareButtonEnabledTitle={
            totalToExport > 0
              ? i18n.t('areas.export.areaSizeAction', {
                  bundleSize:
                    this.state.bundleSize !== undefined
                      ? formatBytes(this.state.bundleSize)
                      : i18n.t('commonText.calculating')
                })
              : i18n.t('areas.export.noneSelected')
          }
        >
          {hasAreas ? (
            <ScrollView
              onStartShouldSetResponder={event => {
                // If the user taps ANYWHERE set the area download tooltip as seen
                event.persist();
                this.props.setAreaDownloadTooltipSeen(true);
              }}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {areas && areas.length ? (
                <View>
                  <Text style={styles.label}>{i18n.t('areas.myAreas')}</Text>
                  <AreaList
                    downloadCalloutVisible={!this.props.areaDownloadTooltipSeen}
                    onAreaDownloadPress={(areaId, name) => {
                      this.props.setAreaDownloadTooltipSeen(true);
                    }}
                    onAreaPress={(areaId, name) => {
                      if (this.state.inShareMode) {
                        this.onAreaSelectedForExport(areaId);
                      } else {
                        this.onAreaPress(areaId, name);
                      }
                    }}
                    onAreaSettingsPress={(areaId, name) => {
                      this.onAreaSettingsPress(areaId, name);
                    }}
                    selectionState={this.state.selectedForExport}
                    sharing={this.state.inShareMode}
                    showCache={true}
                  />
                </View>
              ) : null}
            </ScrollView>
          ) : (
            <View style={styles.containerEmpty}>
              <EmptyState
                actionTitle={i18n.t('areas.empty.action')}
                body={i18n.t('areas.empty.body')}
                icon={emptyIcon}
                onActionPress={this.onFrequentlyAskedQuestionsPress}
                title={i18n.t('areas.empty.title')}
              />
            </View>
          )}
        </ShareSheet>
      </View>
    );
  }
}

export default Areas;
