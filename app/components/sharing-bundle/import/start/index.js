// @flow
import type { ImportBundleRequest, UnpackedSharingBundle } from 'types/sharing.types';
import React, { PureComponent } from 'react';
import { ActivityIndicator, Text, ScrollView, View } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

import Theme from 'config/theme';
import i18n from 'i18next';
import styles from './styles';
import Row from 'components/common/row';
import { unpackBundle } from 'helpers/sharing/importBundle';
import manifestBundleSize from 'helpers/sharing/manifestBundleSize';
import { formatBytes } from 'helpers/data';

const nextIcon = require('assets/next.png');

type Props = {
  bundlePath: string,
  componentId: string
};

type State = {
  bundle: ?UnpackedSharingBundle
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
      bundle: null
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
    this.setState({
      bundle: unpackedBundle
    });
  };

  _importAllData = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.ImportBundleConfirm',
        passProps: {
          bundle: this.state.bundle,
          importRequest: ({
            areas: true,
            customBasemaps: {
              metadata: true,
              files: 'all'
            },
            customContextualLayers: {
              metadata: true,
              files: 'all'
            },
            gfwContextualLayers: {
              metadata: true,
              files: 'all'
            },
            reports: true,
            routes: true
          }: ImportBundleRequest),
          stepNumber: null
        }
      }
    });
  };

  _startCustomImportFlow = () => {
    // TODO
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
    const bundleSizeBytes = manifestBundleSize(bundle.data.manifest);

    return (
      <ScrollView alwaysBounceVertical={false} style={styles.contentContainer}>
        <Text style={styles.bundleName} numberOfLines={1} ellipsizeMode={'middle'}>
          {bundleName}
        </Text>
        <Row
          action={{
            icon: nextIcon,
            callback: this._importAllData
          }}
          rowStyle={styles.row}
        >
          <Text style={styles.title}>{i18n.t('importBundle.start.importAll')}</Text>
          <Text style={styles.description}>{formatBytes(bundleSizeBytes)}</Text>
        </Row>
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
      </ScrollView>
    );
  };
}
