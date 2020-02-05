// @flow

import React, { PureComponent } from 'react';
import { NativeModules, Platform, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';

import Row from 'components/common/row';
import moment from 'moment';
import i18n from 'locales';
import debounceUI from 'helpers/debounceUI';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';
import { colors } from 'config/theme';
import { Navigation } from 'react-native-navigation';
import { withSafeArea } from 'react-native-safe-area';
import exportReports from 'helpers/exportReports';

const SafeAreaView = withSafeArea(View, 'padding', 'bottom');

const editIcon = require('assets/edit.png');
const nextIcon = require('assets/next.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');

type ReportItem = {
  title: string,
  date: string
};

type Props = {
  reports: {
    draft: Array<ReportItem>,
    uploaded: Array<ReportItem>,
    complete: Array<ReportItem>
  },
  getLastStep: string => number,
  showExportReportsSuccessfulNotification: () => void
};

const KEY_EXPORT_START = 'key_export_start';
const KEY_EXPORT_CANCEL = 'key_export_cancel';

const BUTTON_EXPORT_START = [
  {
    id: KEY_EXPORT_START,
    text: i18n.t('report.export.navBarButtonText')
  }
];

const BUTTON_EXPORT_CANCEL = [
  {
    id: KEY_EXPORT_CANCEL,
    text: i18n.t('commonText.cancel')
  }
];

const BUTTON_EXPORT_EMPTY = [];

class Reports extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('dashboard.reports')
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
  }

  componentDidMount() {
    tracker.trackScreenView('My Reports');

    Navigation.events().bindComponent(this);

    // If we've got reports that can be exported, show the export button.
    const exportButton =
      this.props.reports.complete?.length > 0 || this.props.reports.uploaded?.length > 0
        ? BUTTON_EXPORT_START
        : BUTTON_EXPORT_EMPTY;
    this.setExportButtonTo(exportButton);
  }

  componentDidUpdate(prevProps) {
    if (Object.keys(this.state.selectedForExport).length > 0) {
      // Do not change the button state, if we're in export mode!
      return;
    }

    const { draft, complete, uploaded } = this.props.reports;

    const hasExportableReports = complete.length + uploaded.length > 0;
    const hadExportableReports = prevProps.reports.complete.length + prevProps.reports.uploaded.length > 0;

    if (hasExportableReports === hadExportableReports) {
      // Do not change the button state, as there's been no change that needs an update.
      return;
    }

    this.setExportButtonTo(complete.length + uploaded.length > 0 ? BUTTON_EXPORT_START : BUTTON_EXPORT_EMPTY);
  }

  /**
   * setExportButtonTo - Changes the 'export' nav bar button to the provided state.
   *
   * @param  {object} buttonState The new button object that should be shown in the nav bar.
   */
  setExportButtonTo(buttonState) {
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: buttonState
      }
    });
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === KEY_EXPORT_START) {
      this.setExportButtonTo(BUTTON_EXPORT_CANCEL);

      // Merge together the completed and uploaded reports.
      const completedReports = this.props.reports.complete || [];
      const mergedReports = completedReports.concat(this.props.reports.uploaded);

      // Create an object that'll contain the 'selected' state for each report.
      let exportData = {};
      mergedReports.forEach(report => {
        exportData[report.title] = false;
      });

      this.setState({
        selectedForExport: exportData
      });
    } else if (buttonId === KEY_EXPORT_CANCEL) {
      // Reset the export button, and clear out the 'selectedForExport' state.
      this.setExportButtonTo(BUTTON_EXPORT_START);

      this.setState({
        selectedForExport: {}
      });
    }
  }

  /**
   * Handles the report row being selected while in export mode.
   * Will swap the state for the specified row, to show in the UI if it has been selected or not.
   */
  onReportSelectedForExport = title => {
    this.setState(state => ({
      selectedForExport: {
        ...state.selectedForExport,
        [title]: !state.selectedForExport[title]
      }
    }));
  };

  /**
   * Handles an uploaded report row being selected.
   */
  onClickNext = debounceUI((reportName: string) =>
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.Answers',
              passProps: {
                reportName,
                readOnly: true
              }
            }
          }
        ]
      }
    })
  );

  /**
   * Handles a completed report row being selected.
   */
  onClickUpload = debounceUI((reportName: string) =>
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.Answers',
              passProps: {
                reportName,
                readOnly: true,
                showUploadButton: true
              }
            }
          }
        ]
      }
    })
  );

  onClickDraft = debounceUI(reportName => {
    const lastStep = this.props.getLastStep(reportName);
    if (lastStep !== null) {
      const title = i18n.t('report.title');
      Navigation.showModal({
        stack: {
          children: [
            {
              component: {
                name: 'ForestWatcher.NewReport',
                passProps: {
                  screen: 'ForestWatcher.NewReport',
                  title,
                  reportName,
                  step: lastStep
                },
                options: {
                  topBar: {
                    title: {
                      text: title
                    }
                  }
                }
              }
            }
          ]
        }
      });
    } else {
      Navigation.showModal({
        stack: {
          children: [
            {
              component: {
                name: 'ForestWatcher.Answers',
                passProps: {
                  reportName
                }
              }
            }
          ]
        }
      });
    }
  });

  /**
   * Handles the 'export <x> reports' button being tapped.
   *
   * @param  {Object} selectedReports A mapping of report titles to a boolean dictating whether they've been selected for export.
   * @param  {Array} userReports      The user's reports.
   */
  onExportReportsTapped = debounceUI(async (selectedReports, userReports) => {
    // Merge the completed and uploaded reports that are available together, so we can find any selected reports to export them.
    const completeReports = userReports.complete || [];
    const mergedReports = completeReports.concat(userReports.uploaded);

    let reportsToExport = [];

    // Iterate through the selected reports. If the report has been marked to export, find the full report object.
    Object.keys(selectedReports).forEach(key => {
      const reportIsSelected = selectedReports[key];
      if (!reportIsSelected) {
        return;
      }

      const selectedReport = mergedReports.find(report => report.title === key);

      reportsToExport.push(selectedReport);
    });

    await exportReports(
      reportsToExport,
      this.props.templates,
      this.props.appLanguage,
      Platform.select({
        android: RNFetchBlob.fs.dirs.DownloadDir,
        ios: RNFetchBlob.fs.dirs.DocumentDir
      })
    );

    // TODO: Handle errors returned from export function.

    // Show 'export successful' notification, and reset export state to reset UI.
    this.props.showExportReportsSuccessfulNotification();
    this.setExportButtonTo(BUTTON_EXPORT_START);
    this.setState({
      selectedForExport: {}
    });

    if (Platform.OS === 'android') {
      NativeModules.Intents.launchDownloadsDirectory();
    }
  });

  /**
   * getItems - Returns an array of rows, based on the report data provided.
   *
   * @param  {Array} data <ReportItem>  An array of reports.
   * @param  {any} image                The action image.
   * @param  {void} onPress             The action callback.
   * @return {Array}                    An array of report rows.
   */
  getItems(data: Array<ReportItem>, image: any, onPress: string => void) {
    return data.map((item, index) => {
      let positionParsed = '';
      if (item.position) {
        const latLng = item.position.split(',');
        if (latLng && latLng.length > 1) {
          positionParsed = `${parseFloat(latLng[0]).toFixed(4)}, ${parseFloat(latLng[1]).toFixed(4)}`;
        }
      }

      let icon = image;

      // Here, if we're currently in export mode, override the icon to show either the checkbox on or off image.
      if (this.state.selectedForExport?.[item.title] === true) {
        icon = checkboxOn;
      } else if (this.state.selectedForExport?.[item.title] === false) {
        icon = checkboxOff;
      }

      const dateParsed = moment(item.date).fromNow();
      const action = {
        icon: icon,
        callback: () => {
          onPress(item.title);
        }
      };
      return (
        <Row key={index + item.title} rowStyle={{ height: 120 }} action={action}>
          <View style={styles.listItem}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemText}>{positionParsed}</Text>
            <Text style={styles.itemText}>{dateParsed}</Text>
          </View>
        </Row>
      );
    });
  }

  renderSection(title: string, ...options: [Array<ReportItem>, any, (string) => void]) {
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{title}</Text>
        </View>
        {this.getItems(...options)}
      </View>
    );
  }

  getCompleted(completed, icon, callback) {
    return this.renderSection(i18n.t('report.completed'), completed, icon, callback);
  }

  getUploaded(uploaded, icon, callback) {
    return this.renderSection(i18n.t('report.uploaded'), uploaded, icon, callback);
  }

  getDrafts(drafts, icon, callback) {
    return this.renderSection(i18n.t('report.drafts'), drafts, icon, callback);
  }

  /**
   * renderReportsScrollView - Renders a list of reports.
   *
   * @param  {array} reports      An array of reports.
   * @param  {bool} inExportMode  Whether the user is in export mode or not. If in export mode, a different callback will be used.
   * @return {ScrollView}         A ScrollView element with all content rendered to it.
   */
  renderReportsScrollView(reports, inExportMode) {
    const { complete, draft, uploaded } = reports;
    const hasReports = !!complete.length || !!draft.length || !!uploaded.length;

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        {hasReports ? (
          <View style={styles.container}>
            {draft && draft.length > 0 && !inExportMode && this.getDrafts(draft, editIcon, this.onClickDraft)}
            {complete &&
              complete.length > 0 &&
              this.getCompleted(complete, nextIcon, inExportMode ? this.onReportSelectedForExport : this.onClickUpload)}
            {uploaded &&
              uploaded.length > 0 &&
              this.getUploaded(uploaded, nextIcon, inExportMode ? this.onReportSelectedForExport : this.onClickNext)}
          </View>
        ) : (
          <View style={styles.containerEmpty}>
            <Text style={styles.emptyTitle}>{i18n.t('report.empty')}</Text>
          </View>
        )}
      </ScrollView>
    );
  }

  render() {
    // Determine if we're in export mode, and how many reports have been selected to export.
    const inExportMode = Object.keys(this.state.selectedForExport).length > 0;
    const totalToExport = Object.values(this.state.selectedForExport).filter(row => row === true).length;

    return (
      /* View necessary to fix the swipe back on wix navigation */
      <View style={styles.container}>
        {this.renderReportsScrollView(this.props.reports, inExportMode)}
        {inExportMode && (
          <SafeAreaView
            style={[
              styles.exportButtonContainer,
              {
                borderTopColor: totalToExport > 0 ? colors.color1 : colors.color3
              }
            ]}
          >
            <TouchableOpacity
              style={styles.exportButton}
              disabled={totalToExport === 0}
              onPress={() => {
                this.onExportReportsTapped(this.state.selectedForExport, this.props.reports);
              }}
            >
              <Text style={styles.exportTitle}>
                {totalToExport > 0
                  ? totalToExport == 1
                    ? i18n.t('report.export.oneReport', { count: 1 })
                    : i18n.t('report.export.manyReports', { count: totalToExport })
                  : i18n.t('report.export.noneSelected')}
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        )}
      </View>
    );
  }
}

export default Reports;
