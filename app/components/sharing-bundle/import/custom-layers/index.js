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
import { isCustomContextualLayer, isGfwContextualLayer } from 'helpers/layerTypes';

const layersIcon = require('assets/contextualLayers.png');
const layersIconInactive = require('assets/contextualLayerNotActive.png');

type Props = {
  componentId: string,
  formState: SharingBundleCustomImportFlowState,
  importRequest: ImportBundleRequest
};

type State = {
  importRequest: ImportBundleRequest
};

export default class ImportSharingBundleCustomLayersScreen extends PureComponent<Props, State> {
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
          text: i18n.t('importBundle.customLayers.title')
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

  _modifyCustomLayerFileStrategy = (strategy: LayerFileImportStrategy) => {
    this.setState(prevState => ({
      importRequest: {
        ...prevState.importRequest,
        customContextualLayers: {
          ...prevState.importRequest.customContextualLayers,
          files: strategy
        }
      }
    }));
  };

  _modifyGfwLayerFileStrategy = (strategy: LayerFileImportStrategy) => {
    this.setState(prevState => ({
      importRequest: {
        ...prevState.importRequest,
        gfwContextualLayers: {
          ...prevState.importRequest.gfwContextualLayers,
          files: strategy
        }
      }
    }));
  };

  _toggleCustomLayers = () => {
    this.setState(prevState => ({
      importRequest: {
        ...prevState.importRequest,
        customContextualLayers: {
          ...prevState.importRequest.customContextualLayers,
          metadata: !prevState.importRequest.customContextualLayers.metadata
        }
      }
    }));
  };

  _toggleGfwLayers = () => {
    this.setState(prevState => ({
      importRequest: {
        ...prevState.importRequest,
        gfwContextualLayers: {
          ...prevState.importRequest.gfwContextualLayers,
          metadata: !prevState.importRequest.gfwContextualLayers.metadata
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
    const customLayerNames = bundleData.layers
      .filter(isCustomContextualLayer)
      .map(item => item.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    const gfwLayerNames = bundleData.layers
      .filter(isGfwContextualLayer)
      .map(item => i18n.t(item.name))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return (
      <ScrollView alwaysBounceVertical={false} style={styles.contentContainer}>
        <CustomImportItem
          titlePlural={i18n.t('sharing.type.customLayers')}
          titleSingular={i18n.t('sharing.type.customLayer')}
          icon={layersIcon}
          iconInactive={layersIconInactive}
          isSelected={this.state.importRequest.customContextualLayers.metadata}
          callback={this._toggleCustomLayers}
          items={customLayerNames}
          showItemNames={true}
        />
        <CustomLayerScopeDropdown
          bundle={bundleData}
          layerType={'customContextualLayers'}
          onValueChange={this._modifyCustomLayerFileStrategy}
          request={this.state.importRequest}
        />
        <CustomImportItem
          titlePlural={i18n.t('sharing.type.gfwLayers')}
          titleSingular={i18n.t('sharing.type.gfwLayer')}
          icon={layersIcon}
          iconInactive={layersIconInactive}
          isSelected={this.state.importRequest.gfwContextualLayers.metadata}
          callback={this._toggleGfwLayers}
          items={gfwLayerNames}
          showItemNames={true}
        />
        <CustomLayerScopeDropdown
          bundle={bundleData}
          layerType={'gfwContextualLayers'}
          onValueChange={this._modifyGfwLayerFileStrategy}
          request={this.state.importRequest}
        />
      </ScrollView>
    );
  };
}
