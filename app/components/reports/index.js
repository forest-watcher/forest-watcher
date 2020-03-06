// @flow

import React, { PureComponent } from 'react';
import { NativeModules, Platform, View, Text, ScrollView } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import Row from 'components/common/row';
import moment from 'moment';
import i18n from 'i18next';
import debounceUI from 'helpers/debounceUI';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';
import { Navigation } from 'react-native-navigation';
import exportReports from 'helpers/exportReports';
import { readableNameForReportName } from 'helpers/reports';

import ShareSheet from 'components/common/share';
import type { Template } from 'types/reports.types';

const editIcon = require('assets/edit.png');
const nextIcon = require('assets/next.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');

type ReportItem = {
  title: string,
  date: string
};

type Props = {
  componentId: string,
  reports: {
    draft: Array<ReportItem>,
    uploaded: Array<ReportItem>,
    complete: Array<ReportItem>
  },
  templates: {
    [string]: Template
  },
  appLanguage: string,
  getLastStep: string => number,
  showExportReportsSuccessfulNotification: () => void
};

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
      inShareMode: false,
      selectedForExport: []
    };
  }

  componentDidMount() {
    tracker.trackScreenView('My Reports');
  }

  /**
   * Handles the report row being selected while in export mode.
   * Will swap the state for the specified row, to show in the UI if it has been selected or not.
   */
  onReportSelectedForExport = title => {
    this.setState(state => {
      if (state.selectedForExport.includes(title)) {
        return {
          selectedForExport: [...state.selectedForExport].filter(id => title != id)
        };
      } else {
        const selected = [...state.selectedForExport];
        selected.push(title);
        return {
          selectedForExport: selected
        };
      }
    });
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
   * @param  {Array} selectedReports A list of report titles dictating whether they've been selected for export.
   * @param  {Array} userReports      The user's reports.
   */
  onExportReportsTapped = debounceUI(async (selectedReports, userReports) => {
    // Merge the completed and uploaded reports that are available together, so we can find any selected reports to export them.
    const completeReports = userReports.complete || [];
    const mergedReports = completeReports.concat(userReports.uploaded);

    const reportsToExport = selectedReports.map(key => {
      return mergedReports.find(report => report.title === key);
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
    this.shareSheet?.setSharing?.(false);
    this.setState({
      selectedForExport: [],
      inShareMode: false
    });

    if (Platform.OS === 'android') {
      NativeModules.Intents.launchDownloadsDirectory();
    }
  });

  setAllSelected = (selected: boolean) => {
    // Merge together the completed and uploaded reports.
    const completedReports = this.props.reports.complete || [];
    const mergedReports = completedReports.concat(this.props.reports.uploaded);
    this.setState({
      selectedForExport: selected ? mergedReports.map(report => report.title) : []
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
      let position = 'top';

      const dateParsed = moment(item.date).format('YYYY-MM-DD - HH:mm:ss');
      const timeSinceParsed = moment(item.date).fromNow();
      const title = readableNameForReportName(item.reportName);
      const action = {
        icon,
        callback: () => {
          onPress(item.title);
        },
        position
      };
      return (
        <Row key={index + item.title} action={action} >
          <View style={styles.listItem}>
            <Text style={styles.itemTitle}>{title}</Text>
            {item.area?.name && <Text style={styles.itemText}>{item.area.name}</Text>}
            {item.position && <Text style={styles.itemText}>{positionParsed}</Text>}
            <Text style={styles.itemText}>{dateParsed}</Text>
            <Text style={styles.itemText}>{timeSinceParsed}</Text>
          </View>
        </Row>
      );
    });
  }

  renderSection(title: string, ...options: [Array<ReportItem>, any, (string) => void]) {
    return (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>{title}</Text>
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
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
    const totalToExport = this.state.selectedForExport.length;

    const { complete, uploaded } = this.props.reports;
    const totalReports = complete.length + uploaded.length;

    return (
      /* View necessary to fix the swipe back on wix navigation */
      <View style={styles.container}>
        <ShareSheet
          componentId={this.props.componentId}
          enabled={totalToExport > 0}
          onShare={() => {
            this.onExportReportsTapped(this.state.selectedForExport, this.props.reports);
          }}
          onSharingToggled={this.setSharing}
          onToggleAllSelected={this.setAllSelected}
          ref={ref => {
            this.shareSheet = ref;
          }}
          selected={totalToExport}
          selectAllCountText={
            totalReports > 1
              ? i18n.t('report.export.manyReports', { count: totalReports })
              : i18n.t('report.export.oneReport', { count: 1 })
          }
          shareButtonDisabledTitle={i18n.t('report.share')}
          shareButtonEnabledTitle={
            totalToExport > 0
              ? totalToExport == 1
                ? i18n.t('report.export.oneReportAction', { count: 1 })
                : i18n.t('report.export.manyReportsAction', { count: totalToExport })
              : i18n.t('report.export.noneSelected')
          }
          total={totalReports}
        >
          {this.renderReportsScrollView(this.props.reports, this.state.inShareMode)}
        </ShareSheet>
      </View>
    );
  }
}

export default Reports;
