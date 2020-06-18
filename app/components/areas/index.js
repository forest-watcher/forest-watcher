// @flow
import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

import type { Area } from 'types/areas.types';

import AreaList from 'components/common/area-list';
import debounceUI from 'helpers/debounceUI';

import i18n from 'i18next';
import _ from 'lodash';
import { trackScreenView } from 'helpers/analytics';
import styles from './styles';

import EmptyState from 'components/common/empty-state';
import ShareSheet from 'components/common/share';

import calculateBundleSize from 'helpers/sharing/calculateBundleSize';
import generateUniqueID from 'helpers/uniqueId';
import { getShareButtonText } from 'helpers/sharing/utils';

import Theme from 'config/theme';
import { AREA_ROW_TOTAL_HEIGHT } from 'components/common/area-list/styles';

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
  +scrollToBottom?: boolean,
  +offlineMode: boolean
|};

type State = {|
  +bundleSize: number | typeof undefined,
  +creatingArchive: boolean,
  +selectedForExport: Array<string>,
  +inShareMode: boolean
|};

class Areas extends Component<Props, State> {
  static options(passProps: {}) {
    return {
      topBar: {
        background: {
          color: Theme.colors.veryLightPink
        },
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

  fetchId: ?string;
  shareSheet: any;

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
    // Set an empty starting state for this object. If empty, we're not in export mode. If there's items in here, export mode is active.
    this.state = {
      bundleSize: undefined,
      creatingArchive: false,
      selectedForExport: [],
      inShareMode: false,
      shouldScrollToBottom: props.scrollToBottom
    };

    this.scrollView = null;
  }

  componentDidMount() {
    trackScreenView('Areas');
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
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
    const fileSize = await calculateBundleSize({
      areas: this.props.areas.filter(area => areaIds.includes(area.id))
    });
    if (this.fetchId === currentFetchId) {
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
    this.setState(
      state => {
        if (state.selectedForExport.includes(areaId)) {
          return {
            selectedForExport: [...state.selectedForExport].filter(id => areaId !== id)
          };
        } else {
          return {
            selectedForExport: [...state.selectedForExport, areaId]
          };
        }
      },
      () => {
        this.fetchExportSize(this.state.selectedForExport);
      }
    );
  };

  /**
   * Handles the 'export <x> areas' button being tapped.
   *
   * @param  {Array} selectedAreas An array of area identifiers that have been selected for export.
   */
  onExportAreasTapped = debounceUI(async selectedAreas => {
    this.setState({
      creatingArchive: true
    });
    await this.props.exportAreas(selectedAreas);
    this.setState({
      creatingArchive: false
    });
    if (this.shareSheet) {
      this.shareSheet.setSharing(false);
    }
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

  onScrollViewContentSizeChange = (areasOwnedLength, areasImportedLength) => {
    if (areasOwnedLength < 4) {
      // No need to scroll
      return;
    }
    // GFW-579: Scroll to bottom of scroll view once, after new area added.
    if (this.state.shouldScrollToBottom) {
      if (areasImportedLength === 0) {
        this.scrollView.scrollToEnd();
      } else {
        // Scroll to end of My Areas section to show newly added area
        const areasHeight = AREA_ROW_TOTAL_HEIGHT;
        this.scrollView.scrollTo({ y: areasHeight * (areasOwnedLength - 2) });
      }
      this.setState({ shouldScrollToBottom: false });
    }
  };

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
      bundleSize: undefined,
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

    const [areasImported, areasOwned] = _.partition(areas, area => area.isImported);

    const hasAreas = areas && areas.length > 0;
    const sharingType = i18n.t('sharing.type.areas');

    return (
      <View
        onStartShouldSetResponder={event => {
          // If the user taps ANYWHERE set the area download tooltip as seen
          event.persist();
          this.props.setAreaDownloadTooltipSeen(true);
          return false;
        }}
        style={styles.container}
      >
        <ShareSheet
          disabled={!this.props.areaDownloadTooltipSeen}
          isSharing={this.state.creatingArchive}
          componentId={this.props.componentId}
          onStartShouldSetResponder={event => {
            // If the user taps ANYWHERE set the area download tooltip as seen
            event.persist();
            this.props.setAreaDownloadTooltipSeen(true);
            return false;
          }}
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
          shareButtonInProgressTitle={i18n.t('sharing.inProgress', { type: sharingType })}
          shareButtonDisabledTitle={i18n.t('sharing.title', { type: sharingType })}
          shareButtonEnabledTitle={getShareButtonText(sharingType, totalToExport, this.state.bundleSize)}
        >
          {hasAreas ? (
            <ScrollView
              ref={ref => {
                this.scrollView = ref;
              }}
              onContentSizeChange={() => this.onScrollViewContentSizeChange(areasOwned.length, areasImported.length)}
              onStartShouldSetResponder={event => {
                // If the user taps ANYWHERE set the area download tooltip as seen
                event.persist();
                this.props.setAreaDownloadTooltipSeen(true);
                return false;
              }}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {this.renderAreaList(areasOwned, i18n.t('areas.myAreas'), true)}
              {this.renderAreaList(areasImported, i18n.t('areas.importedAreas'))}
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

  renderAreaList = (areas: Array<Area>, title: string, allowsDownloadTooltip: boolean = false) => {
    if (areas.length === 0) {
      return null;
    }

    return (
      <>
        <Text style={styles.label}>{title}</Text>
        <AreaList
          areas={areas}
          downloadCalloutVisible={allowsDownloadTooltip && !this.props.areaDownloadTooltipSeen}
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
      </>
    );
  };
}

export default Areas;
