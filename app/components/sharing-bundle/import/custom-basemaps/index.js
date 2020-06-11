// @flow
import type { ImportBundleRequest, LayerFileImportStrategy } from 'types/sharing.types';
import type { SharingBundleCustomImportFlowState } from 'components/sharing-bundle/import/createCustomImportFlow';

import React, { PureComponent } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

import i18n from 'i18next';
import styles from '../styles';
import BottomTray from 'components/common/bottom-tray';
import ActionButton from 'components/common/action-button';
import CustomImportItem from 'components/sharing-bundle/import/custom-import-item';
import CustomLayerScopeDropdown from 'components/sharing-bundle/import/custom-layer-scope-dropdown';

const basemapsIcon = require('assets/basemap.png');
const basemapsIconInactive = require('assets/basemapNotActive.png');

type Props = {
  componentId: string,
  formState: SharingBundleCustomImportFlowState,
  importRequest: ImportBundleRequest
};

type State = {
  importRequest: ImportBundleRequest
};

export default class ImportSharingBundleCustomBasemapsScreen extends PureComponent<Props, State> {
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

  _modifyCustomBasemapFileStrategy = (strategy: LayerFileImportStrategy) => {
    this.setState(prevState => ({
      importRequest: {
        ...prevState.importRequest,
        customBasemaps: {
          ...prevState.importRequest.customBasemaps,
          files: strategy
        }
      }
    }));
  };

  _toggleCustomBasemaps = () => {
    this.setState(prevState => ({
      importRequest: {
        ...prevState.importRequest,
        customBasemaps: {
          ...prevState.importRequest.customBasemaps,
          metadata: !prevState.importRequest.customBasemaps.metadata
        }
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
    const basemapNames = bundleData.basemaps.map(item => item.name).sort((a, b) => a.localeCompare(b));
    return (
      <ScrollView alwaysBounceVertical={false} style={styles.contentContainer}>
        <CustomImportItem
          titlePlural={i18n.t('sharing.type.customBasemaps')}
          titleSingular={i18n.t('sharing.type.customBasemap')}
          icon={basemapsIcon}
          iconInactive={basemapsIconInactive}
          isSelected={this.state.importRequest.customBasemaps.metadata}
          callback={this._toggleCustomBasemaps}
          items={basemapNames}
          showItemNames={true}
        />
        <CustomLayerScopeDropdown
          bundle={bundleData}
          layerType={'customBasemaps'}
          onValueChange={this._modifyCustomBasemapFileStrategy}
          request={this.state.importRequest}
        />
      </ScrollView>
    );
  };
}
