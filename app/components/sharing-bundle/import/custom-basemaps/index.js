// @flow
import type { ImportBundleRequest, LayerFileImportStrategy, UnpackedSharingBundle } from 'types/sharing.types';
import React, { PureComponent } from 'react';
import { ScrollView, View } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

import Theme from 'config/theme';
import i18n from 'i18next';
import styles from './styles';
import BottomTray from 'components/common/bottom-tray';
import ActionButton from 'components/common/action-button';
import CustomImportItem from 'components/sharing-bundle/import/custom-import-item';
import CustomLayerScopeDropdown from 'components/sharing-bundle/import/custom-layer-scope-dropdown';

const basemapsIcon = require('assets/basemap.png');
const basemapsIconInactive = require('assets/basemapNotActive.png');

type Props = {
  bundle: UnpackedSharingBundle,
  componentId: string,
  initialImportRequest: ImportBundleRequest
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
            color: Theme.colors.turtleGreen,
            fontFamily: Theme.font
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
      importRequest: props.initialImportRequest
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
          style={{ flexDirection: 'row', alignSelf: 'stretch', alignItems: 'stretch' }}
        >
          <ActionButton noIcon onPress={this._onNextPress} secondary={false} text={i18n.t('commonText.next')} />
        </BottomTray>
      </View>
    );
  }

  renderContent = () => {
    const bundleData = this.props.bundle.data;
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
          bundle={this.props.bundle.data}
          layerType={'customBasemaps'}
          onValueChange={this._modifyCustomBasemapFileStrategy}
          request={this.state.importRequest}
          selectedValue={this.state.importRequest.customBasemaps.files}
        />
      </ScrollView>
    );
  };
}
