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
      selectedForExport: [],
      inShareMode: false
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

  /**
   * Handles the area row being selected while in export mode.
   * Will swap the state for the specified row, to show in the UI if it has been selected or not.
   */
  onAreaSelectedForExport = areaId => {
    this.setState((state) => {
      if (state.selectedForExport.includes(areaId)) {
        return {
          selectedForExport: [...state.selectedForExport].filter(id => {areaId != id})
        }
      } else {
        let selected = [...state.selectedForExport];
        selected.push(areaId);
        return {
          selectedForExport: selected
        }
      }
    }
  };

  /**
   * Handles the 'export <x> areas' button being tapped.
   *
   * @param  {Array} selectedAreas An array of area identifiers that have been selected for export.
   */
  onExportAreasTapped = debounceUI(async selectedAreas => {
    let areas = this.props.areas || [];

    // Iterate through the selected reports. If the area has been marked to export, find the full area object.
    const areasToExport = selectedAreas.map(areaId => {
      const selectedArea = areas.find(area => area.id === areaId);
      return selectedArea;
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
      inShareMode: false,
      selectedForExport: []
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
    this.setState({
      selectedForExport: selected ? this.props.areas.map(area => area.id) : []
    });
  };

  setSharing = (sharing: boolean) => {

    this.setState({
      inShareMode: sharing
    });

    if (!sharing) {
      this.setState({
        selectedForExport: []
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
    const totalToExport = this.state.selectedForExport.length;
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
                    if (this.state.inShareMode) {
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
