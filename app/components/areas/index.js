// @flow
import React, { Component } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';

import type { Area } from 'types/areas.types';

import ActionButton from 'components/common/action-button';
import AreaList from 'containers/common/area-list';
import BottomTray from 'components/common/bottom-tray';
import debounceUI from 'helpers/debounceUI';

import { launchAppRoot } from 'main';
import i18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

import ShareSheet from 'components/common/share';

const plusIcon = require('assets/add.png');

type Props = {
  areas: Array<Area>,
  componentId: string,
  setSelectedAreaId: () => void,
  showNotConnectedNotification: () => void,
  offlineMode: boolean
};

class Areas extends Component<Props> {
  static options(passProps) {
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

  constructor(props) {
    super(props);
    this.navigationEventListener = Navigation.events().bindComponent(this);
    // Set an empty starting state for this object. If empty, we're not in export mode. If there's items in here, export mode is active.
    this.state = {
      selectedForExport: {}
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Areas');
  }

  componentWillUnmount() {
    // Not mandatory
    if (this.navigationEventListener) {
      this.navigationEventListener.remove();
    }
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'addArea') {
      this.onPressAddArea();
    }
  }

  onClickShare() {
    const areas = this.props.areas || [];

    // Create an object that'll contain the 'selected' state for each area.
    let exportData = {};
    areas.forEach(area => {
      exportData[area.id] = false;
    });

    this.setState({
      selectedForExport: exportData
    });
  }

  /**
   * Handles the area row being selected while in export mode.
   * Will swap the state for the specified row, to show in the UI if it has been selected or not.
   */
  onAreaSelectedForExport = areaId => {
    this.setState(state => ({
      selectedForExport: {
        ...state.selectedForExport,
        [areaId]: !state.selectedForExport[areaId]
      }
    }));
  };

  /**
   * Handles the 'export <x> areas' button being tapped.
   *
   * @param  {Object} selectedAreas A mapping of area identifiers to a boolean dictating whether they've been selected for export.
   */
  onExportAreasTapped = debounceUI(async selectedAreas => {
    let areas = this.props.areas || [];
    let areasToExport = [];

    // Iterate through the selected reports. If the area has been marked to export, find the full area object.
    Object.keys(selectedAreas).forEach(key => {
      const areaIsSelected = selectedAreas[key];
      if (!areaIsSelected) {
        return;
      }

      const selectedArea = areas.find(area => area.id === key);
      areasToExport.push(selectedArea);
    });

    console.log('Export areas', areasToExport);

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
      selectedForExport: {}
    });
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: [{
          id: 'addArea',
          icon: plusIcon
        }]
      }
    });

    // if (Platform.OS === 'android') {
    //   NativeModules.Intents.launchDownloadsDirectory();
    // }
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
      Navigation.push(this.props.componentId, {
        component: {
          name: 'ForestWatcher.Map'
        }
      });
    }
  });

  onPressAddArea = debounceUI(() => {
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
    const areas = this.props.areas || [];

    // Create an object that'll contain the 'selected' state for each area.
    let exportData = {};
    areas.forEach(area => {
      exportData[area.id] = selected;
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
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          rightButtons: [{
            id: 'addArea',
            icon: plusIcon
          }]
        }
      });
    }
  };

  render() {
    const { areas } = this.props;
    // Determine if we're in export mode, and how many areas have been selected to export.
    const inExportMode = Object.keys(this.state.selectedForExport).length > 0;
    const totalToExport = Object.values(this.state.selectedForExport).filter(row => row === true).length;
    const totalAreas = areas.length;

    return (
      <View style={styles.container}>
        <ShareSheet
          componentId={this.props.componentId}
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
              ? totalToExport == 1
                ? i18n.t('areas.export.oneAreaAction', { count: 1 })
                : i18n.t('areas.export.manyAreasAction', { count: totalToExport })
              : i18n.t('areas.export.noneSelected')
          }
          total={totalAreas}
        >
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {areas && areas.length ? (
              <View style={styles.areas}>
                <Text style={styles.label}>{i18n.t('areas.myAreas')}</Text>
                <AreaList
                  onAreaPress={(areaId, name) => {
                    if (inExportMode) {
                      this.onAreaSelectedForExport(areaId);
                    } else {
                      this.onAreaPress(areaId, name);
                    }
                  }}
                  onAreaSettingsPress={(areaId, name) => this.onAreaSettingsPress(areaId, name)}
                  selectionState={this.state.selectedForExport}
                />
              </View>
            ) : null}
          </ScrollView>
        </ShareSheet>
      </View>
    );
  }
}

export default Areas;
