// @flow
import type { ImportBundleRequest } from 'types/sharing.types';
import type { SharingBundleCustomImportFlowState } from 'components/sharing-bundle/import/createCustomImportFlow';

import React, { PureComponent } from 'react';
import { Text, ScrollView, View } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

import i18n from 'i18next';
import styles from './styles';
import Row from 'components/common/row';
import { calculateImportBundleSize } from 'helpers/sharing/calculateBundleSize';
import { formatBytes } from 'helpers/data';
import BottomTray from 'components/common/bottom-tray';
import ActionButton from 'components/common/action-button';
import CustomImportItem from 'components/sharing-bundle/import/custom-import-item';

const basemapsIcon = require('assets/basemap.png');
const basemapsIconInactive = require('assets/basemapNotActive.png');
const reportsIcon = require('assets/reports.png');
const reportsIconInactive = require('assets/reportNotActive.png');

type Props = {
  formState: SharingBundleCustomImportFlowState,
  importBundle: () => Promise<void>,
  importRequest: ImportBundleRequest
};

type State = {
  importError: ?string,
  isImporting: boolean
};

export default class ImportSharingBundleConfirmScreen extends PureComponent<Props, State> {
  static options(passProps: {}) {
    return {
      topBar: {
        rightButtons: [
          {
            id: 'cancel',
            text: i18n.t('commonText.cancel'),
            ...styles.topBarTextButton
          }
        ],
        title: {
          text: i18n.t('importBundle.confirm.title')
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);

    this.state = {
      importError:
        'Your device does not have enough space to import this bundle. Please remove items from the device or select fewer import options and try again. ',
      isImporting: false
    };
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === 'cancel') {
      Navigation.dismissAllModals();
    }
  }

  _startImport = async () => {
    this.setState({
      isImporting: true
    });
    try {
      await this.props.importBundle();
      Navigation.dismissAllModals();
    } catch (err) {
      this.setState({
        importError: err
      });
    } finally {
      this.setState({
        isImporting: false
      });
    }
  };

  render() {
    const bundleData = this.props.formState.bundle.data;
    const bundleSizeBytes = calculateImportBundleSize(bundleData, this.props.importRequest);
    const bundleSizeText = formatBytes(bundleSizeBytes);

    return (
      <View style={styles.container}>
        {this.renderContent(bundleSizeText)}
        <BottomTray showProgressBar={this.state.isImporting} requiresSafeAreaView={true} style={styles.bottomTray}>
          {this.props.formState.numSteps > 1 && (
            <Text style={styles.progressText}>
              {i18n.t('importBundle.progress', {
                current: this.props.formState.currentStep,
                total: this.props.formState.numSteps
              })}
            </Text>
          )}
          <ActionButton
            disabled={this.state.isImporting}
            noIcon
            onPress={this._startImport}
            secondary={false}
            text={`${i18n.t('importBundle.confirm.buttonTitle')} (${bundleSizeText})`}
          />
        </BottomTray>
      </View>
    );
  }

  renderContent = (bundleSize: string): any => {
    const bundleName = 'Bundle name'; // TODO: Discussing with James a useful way of naming a bundle
    return (
      <ScrollView alwaysBounceVertical={false} style={styles.contentContainer}>
        <Text style={styles.bundleName} numberOfLines={1} ellipsizeMode={'middle'}>
          {bundleName}
        </Text>
        {this.renderImportType(bundleSize)}
        {this.state.importError && <Text style={styles.error}>{this.state.importError}</Text>}
      </ScrollView>
    );
  };

  /**
   * The designs call for showing a slightly different UI for each of these cases:
   * (i) User clicked to import "All Items"
   * (ii) User defined a custom import
   * (iii) Bundle only contains reports
   * (iv) Bundle only contains basemaps
   *
   * See https://drive.google.com/drive/folders/1ajMBdA90kga-XvjBwyd3_PnxWNKiWK4d
   */
  renderImportType = (bundleSize: string) => {
    const isCustomImport = this.props.formState.numSteps > 1;

    if (isCustomImport) {
      return (
        <Row rowStyle={styles.row}>
          <Text style={styles.title}>{i18n.t('importBundle.start.customImport')}</Text>
          <Text style={styles.description}>{bundleSize}</Text>
        </Row>
      );
    }

    const bundleData = this.props.formState.bundle.data;
    const hasAreas = bundleData.areas.length > 0;
    const hasBasemaps = bundleData.basemaps.length > 0;
    const hasContextualLayers = bundleData.layers.length > 0;
    const hasReports = bundleData.reports.length > 0;
    const hasRoutes = bundleData.routes.length > 0;
    const isJustReports = hasReports && !hasAreas && !hasBasemaps && !hasContextualLayers && !hasRoutes;

    if (isJustReports) {
      const reportNames = bundleData.reports.map(item => item.reportName).sort((a, b) => a.localeCompare(b));
      return (
        <CustomImportItem
          titlePlural={i18n.t('sharing.type.reports')}
          titleSingular={i18n.t('sharing.type.report')}
          icon={reportsIcon}
          iconInactive={reportsIconInactive}
          items={reportNames}
          showItemNames={false}
          callback={null}
          isSelected={true}
        />
      );
    }

    const isJustBasemaps = hasBasemaps && !hasAreas && !hasReports && !hasContextualLayers && !hasRoutes;

    if (isJustBasemaps) {
      const basemapNames = bundleData.basemaps.map(item => item.name).sort((a, b) => a.localeCompare(b));
      return (
        <CustomImportItem
          titlePlural={i18n.t('sharing.type.customBasemaps')}
          titleSingular={i18n.t('sharing.type.customBasemap')}
          icon={basemapsIcon}
          iconInactive={basemapsIconInactive}
          items={basemapNames}
          showItemNames={true}
          callback={null}
          isSelected={true}
        />
      );
    }

    return (
      <Row rowStyle={styles.row}>
        <Text style={styles.title}>{i18n.t('importBundle.start.importAll')}</Text>
        <Text style={styles.description}>{bundleSize}</Text>
      </Row>
    );
  };
}
