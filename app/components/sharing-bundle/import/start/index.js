// @flow
import type { UnpackedSharingBundle } from 'types/sharing.types';

import React, { PureComponent } from 'react';
import { ActivityIndicator, Text, ScrollView, View } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

import Theme from 'config/theme';
import i18n from 'i18next';
import styles from './styles';
import Row from 'components/common/row';
import { IMPORT_ENTIRE_BUNDLE_REQUEST, unpackBundle } from 'helpers/sharing/importBundle';
import { calculateImportBundleSize } from 'helpers/sharing/calculateBundleSize';
import { formatBytes } from 'helpers/data';
import createCustomImportFlow, {
  type SharingBundleCustomImportFlowState
} from 'components/sharing-bundle/import/createCustomImportFlow';

const nextIcon = require('assets/next.png');

type Props = {
  bundlePath: string,
  componentId: string
};

type State = {
  bundle: ?UnpackedSharingBundle,
  customForm: ?SharingBundleCustomImportFlowState
};

export default class ImportSharingBundleStartScreen extends PureComponent<Props, State> {
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
          text: i18n.t('importBundle.start.title')
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);

    this.state = {
      bundle: null,
      customForm: null
    };
  }

  componentDidMount() {
    this._unpackBundle();
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === 'cancel') {
      Navigation.dismissAllModals();
    }
  }

  _unpackBundle = async () => {
    const unpackedBundle = await unpackBundle(this.props.bundlePath);

    const customImportFlow = createCustomImportFlow(unpackedBundle);

    await this.setState({
      bundle: unpackedBundle,
      customForm: customImportFlow
    });

    // If the import flow only consists of the confirm screen then just go straight there
    if (customImportFlow.numSteps === 1) {
      // Go directly to confirm screen
      this._importAllData(true);
    }
  };

  _importAllData = (setRoot = false) => {
    const component = {
      component: {
        name: 'ForestWatcher.ImportBundleConfirm',
        passProps: {
          formState: { ...this.state.customForm, numSteps: 1, currentStep: 1 },
          importRequest: IMPORT_ENTIRE_BUNDLE_REQUEST
        }
      }
    };

    if (setRoot) {
      Navigation.setStackRoot(this.props.componentId, component);
    } else {
      Navigation.push(this.props.componentId, component);
    }
  };

  _startCustomImportFlow = () => {
    if (this.state.customForm) {
      this.state.customForm.pushNextStep(this.props.componentId, IMPORT_ENTIRE_BUNDLE_REQUEST);
    }
  };

  render() {
    return <View style={styles.container}>{this.renderContent()}</View>;
  }

  renderContent = () => {
    const { bundle } = this.state;

    if (!bundle) {
      return <ActivityIndicator style={{ flex: 1 }} size={'large'} color={Theme.colors.turtleGreen} />;
    }

    const bundleName = this.props.bundlePath; // TODO: Discussing with James a useful way of naming a bundle
    const bundleSizeBytes = calculateImportBundleSize(bundle.data, IMPORT_ENTIRE_BUNDLE_REQUEST);

    return (
      <ScrollView alwaysBounceVertical={false} style={styles.contentContainer}>
        <Text style={styles.bundleName} numberOfLines={1} ellipsizeMode={'middle'}>
          {bundleName}
        </Text>
        <Row
          action={{
            icon: nextIcon,
            callback: () => this._importAllData()
          }}
          rowStyle={styles.row}
        >
          <Text style={styles.title}>{i18n.t('importBundle.start.importAll')}</Text>
          <Text style={styles.description}>{formatBytes(bundleSizeBytes)}</Text>
        </Row>
        {this.state.customForm && (
          <Row
            action={{
              icon: nextIcon,
              callback: this._startCustomImportFlow
            }}
            rowStyle={styles.row}
          >
            <Text style={styles.title}>{i18n.t('importBundle.start.customImport')}</Text>
            <Text style={styles.description}>{i18n.t('importBundle.start.customImportDescription')}</Text>
          </Row>
        )}
      </ScrollView>
    );
  };
}
