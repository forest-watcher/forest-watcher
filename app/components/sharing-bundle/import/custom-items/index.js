// @flow
import type { ImportBundleRequest } from 'types/sharing.types';
import type { SharingBundleCustomImportFlowState } from 'components/sharing-bundle/import/createCustomImportFlow';

import React, { PureComponent } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

import i18n from 'i18next';
import styles from '../styles';
import BottomTray from 'components/common/bottom-tray';
import ActionButton from 'components/common/action-button';
import CustomImportItem from 'components/sharing-bundle/import/custom-import-item';

const areasIcon = require('assets/areas.png');
const areasIconInactive = require('assets/areaNotActive.png');
const reportsIcon = require('assets/reports.png');
const reportsIconInactive = require('assets/reportNotActive.png');
const routesIcon = require('assets/routes.png');
const routesIconInactive = require('assets/routeNotActive.png');

type Props = {
  componentId: string,
  formState: SharingBundleCustomImportFlowState,
  importRequest: ImportBundleRequest
};

type State = {
  importRequest: ImportBundleRequest
};

export default class ImportSharingBundleCustomItemsScreen extends PureComponent<Props, State> {
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
          text: i18n.t('importBundle.customItems.title')
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);

    this.state = {
      importRequest: props.importRequest
    };
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === 'cancel') {
      Navigation.dismissAllModals();
    }
  }

  _toggleAreas = () => {
    this.setState(prevState => ({
      importRequest: {
        ...prevState.importRequest,
        areas: !prevState.importRequest.areas
      }
    }));
  };

  _toggleReports = () => {
    this.setState(prevState => ({
      importRequest: {
        ...prevState.importRequest,
        reports: !prevState.importRequest.reports
      }
    }));
  };

  _toggleRoutes = () => {
    this.setState(prevState => ({
      importRequest: {
        ...prevState.importRequest,
        routes: !prevState.importRequest.routes
      }
    }));
  };

  _onNextPress = () => {
    this.props.formState.pushNextStep(this.props.componentId, this.state.importRequest);
  };

  render() {
    return (
      <View style={styles.container}>
        {this.renderContent()}
        <BottomTray requiresSafeAreaView={true} style={styles.bottomTray}>
          <Text style={styles.progressText}>
            {i18n.t('importBundle.progress', {
              current: this.props.formState.currentStep,
              total: this.props.formState.numSteps
            })}
          </Text>
          <ActionButton noIcon onPress={this._onNextPress} secondary={false} text={i18n.t('commonText.next')} />
        </BottomTray>
      </View>
    );
  }

  renderContent = () => {
    const bundleData = this.props.formState.bundle.data;
    const areaNames = bundleData.areas.map(item => item.name).sort((a, b) => a.localeCompare(b));
    const reportNames = bundleData.reports.map(item => item.reportName).sort((a, b) => a.localeCompare(b));
    const routeNames = bundleData.routes.map(item => item.name).sort((a, b) => a.localeCompare(b));
    return (
      <ScrollView alwaysBounceVertical={false} style={styles.contentContainer}>
        <CustomImportItem
          titlePlural={i18n.t('sharing.type.areas')}
          titleSingular={i18n.t('sharing.type.area')}
          icon={areasIcon}
          iconInactive={areasIconInactive}
          isSelected={this.state.importRequest.areas}
          callback={this._toggleAreas}
          items={areaNames}
          showItemNames={true}
        />
        <CustomImportItem
          titlePlural={i18n.t('sharing.type.routes')}
          titleSingular={i18n.t('sharing.type.route')}
          icon={routesIcon}
          iconInactive={routesIconInactive}
          isSelected={this.state.importRequest.routes}
          callback={this._toggleRoutes}
          items={routeNames}
          showItemNames={true}
        />
        <CustomImportItem
          titlePlural={i18n.t('sharing.type.reports')}
          titleSingular={i18n.t('sharing.type.report')}
          icon={reportsIcon}
          iconInactive={reportsIconInactive}
          isSelected={this.state.importRequest.reports}
          callback={this._toggleReports}
          items={reportNames}
          showItemNames={false}
        />
      </ScrollView>
    );
  };
}
