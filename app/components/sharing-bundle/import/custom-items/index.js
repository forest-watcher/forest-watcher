// @flow
import type { ImportBundleRequest, UnpackedSharingBundle } from 'types/sharing.types';
import React, { PureComponent } from 'react';
import { Image, Text, ScrollView, View } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

import Theme from 'config/theme';
import i18n from 'i18next';
import styles from './styles';
import Row from 'components/common/row';
import { IMPORT_ENTIRE_BUNDLE_REQUEST } from 'helpers/sharing/importBundle';
import BottomTray from 'components/common/bottom-tray';
import ActionButton from 'components/common/action-button';

const areasIcon = require('assets/areas.png');
const areasIconInactive = require('assets/areaNotActive.png');
const reportsIcon = require('assets/reports.png');
const reportsIconInactive = require('assets/reportNotActive.png');
const routesIcon = require('assets/routes.png');
const routesIconInactive = require('assets/routeNotActive.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');

type Props = {
  bundle: UnpackedSharingBundle,
  componentId: string
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
      importRequest: IMPORT_ENTIRE_BUNDLE_REQUEST
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
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.ImportBundleConfirm',
        passProps: {
          bundle: this.props.bundle,
          importRequest: this.state.importRequest,
          stepNumber: null
        }
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        {this.renderContent()}
        <BottomTray
          requiresSafeAreaView={true}
          style={styles.bottomTray}
        >
          <ActionButton noIcon onPress={this._onNextPress} secondary={false} text={i18n.t('commonText.next')} />
        </BottomTray>
      </View>
    );
  }

  renderContent = () => {
    const bundleData = this.props.bundle.data;
    const areaNames = bundleData.areas.map(item => item.name).sort((a, b) => a.localeCompare(b));
    const reportNames = bundleData.reports.map(item => item.reportName).sort((a, b) => a.localeCompare(b));
    const routeNames = bundleData.routes.map(item => item.name).sort((a, b) => a.localeCompare(b));
    return (
      <ScrollView alwaysBounceVertical={false} style={styles.contentContainer}>
        {this.renderRow(
          i18n.t('sharing.type.areas'),
          i18n.t('sharing.type.area'),
          areasIcon,
          areasIconInactive,
          this.state.importRequest.areas,
          this._toggleAreas,
          areaNames
        )}
        {this.renderRow(
          i18n.t('sharing.type.routes'),
          i18n.t('sharing.type.route'),
          routesIcon,
          routesIconInactive,
          this.state.importRequest.routes,
          this._toggleRoutes,
          routeNames
        )}
        {this.renderRow(
          i18n.t('sharing.type.reports'),
          i18n.t('sharing.type.report'),
          reportsIcon,
          reportsIconInactive,
          this.state.importRequest.reports,
          this._toggleReports,
          reportNames,
          false
        )}
      </ScrollView>
    );
  };

  renderRow = (
    titlePlural: string,
    titleSingular: string,
    icon: any,
    iconInactive: any,
    isSelected: boolean,
    callback: () => any,
    items: Array<string>,
    showItemNames: boolean = true
  ) => {
    const hasItems = items.length > 0;

    let description = `${items.length} ${items.length === 1 ? titleSingular : titlePlural}`;

    if (hasItems && showItemNames) {
      description += `: ${items.join(', ')}`;
    }

    return (
      <Row
        style={styles.rowContent}
        rowStyle={styles.row}
        iconStyle={styles.rowCheckbox}
        action={{
          position: 'top',
          icon: hasItems && isSelected ? checkboxOn : checkboxOff,
          callback: hasItems ? callback : null
        }}
      >
        <Image style={styles.rowIcon} resizeMode={'contain'} source={hasItems ? icon : iconInactive} />
        <View style={styles.rowTextWrapper}>
          <Text style={styles.rowTitle}>{titlePlural}</Text>
          <Text style={styles.rowDescription}>{description}</Text>
        </View>
      </Row>
    );
  };
}
