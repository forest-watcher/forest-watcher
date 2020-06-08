// @flow
import type { ImportBundleRequest, UnpackedSharingBundle } from 'types/sharing.types';
import React, { PureComponent } from 'react';
import { Text, ScrollView, View } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

import Theme from 'config/theme';
import i18n from 'i18next';
import styles from './styles';
import Row from 'components/common/row';
import manifestBundleSize from 'helpers/sharing/manifestBundleSize';
import { formatBytes } from 'helpers/data';
import BottomTray from 'components/common/bottom-tray';
import ActionButton from 'components/common/action-button';

type Props = {
  bundle: UnpackedSharingBundle,
  importBundle: () => Promise<void>,
  importRequest: ImportBundleRequest,
  stepNumber: ?number
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
    const bundleSizeBytes = manifestBundleSize(this.props.bundle.data.manifest);
    const bundleSizeText = formatBytes(bundleSizeBytes);
    return (
      <View style={styles.container}>
        {this.renderContent(bundleSizeText)}
        <BottomTray
          showProgressBar={this.state.isImporting}
          requiresSafeAreaView={true}
          style={{ flexDirection: 'row', alignSelf: 'stretch', alignItems: 'stretch' }}
        >
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
        <Row rowStyle={styles.row}>
          <Text style={styles.title}>{i18n.t('importBundle.start.importAll')}</Text>
          <Text style={styles.description}>{bundleSize}</Text>
        </Row>
        {this.state.importError && <Text style={styles.error}>{this.state.importError}</Text>}
      </ScrollView>
    );
  };
}
