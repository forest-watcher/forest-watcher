// @flow
import type { Layer, LayersCacheStatus } from 'types/layers.types';
import type { LayerType } from 'types/sharing.types';
import type { Thunk } from 'types/store.types';

import React, { PureComponent } from 'react';
import { View, ScrollView, Text } from 'react-native';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import Row from 'components/common/row';

import i18n from 'i18next';
import styles from './styles';
import debounceUI from 'helpers/debounceUI';
import { presentInformationModal } from 'screens/common';

import { Navigation } from 'react-native-navigation';

const infoIcon = require('assets/info.png');
const checkboxOnIcon = require('assets/radio_button.png');
const checkboxOffIcon = require('assets/checkbox_off.png');

type Props = {
  addLayer: (
    contentType: LayerType,
    layer: Layer,
    onlyNonDownloadedAreas: boolean,
    downloadLayer: boolean
  ) => Thunk<Promise<void>>,
  componentId: string,
  downloadProgress: ?LayersCacheStatus,
  layer: Layer,
  +offlineMode: boolean,
  popToComponentId: string,
  +showNotConnectedNotification: () => Thunk<void>
};

type State = {
  download: boolean,
  downloading: boolean,
  downloadAttempted: boolean
};

class LayerDownload extends PureComponent<Props, State> {
  popOnDownload: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      downloadAttempted: false,
      download: true,
      downloading: false
    };
  }

  onPressAdd = async () => {
    if (this.props.offlineMode && this.state.download) {
      this.props.showNotConnectedNotification();
      return;
    }

    if (this.state.download) {
      this.setState({
        downloading: true,
        downloadAttempted: true
      });
      this.popOnDownload = true;
    }

    await this.props.addLayer('contextual_layer', this.props.layer, false, this.state.download);

    if (this.state.download) {
      this.setState({
        downloading: false
      });
    } else {
      if (this.props.popToComponentId) {
        Navigation.popTo(this.props.popToComponentId);
      } else {
        Navigation.pop(this.props.componentId);
      }
    }
  };

  componentDidUpdate(previousProps: Props) {
    if (!this.popOnDownload) {
      return;
    }

    const isDone = (status: ?LayersCacheStatus) => {
      if (!status) {
        return false;
      }

      // $FlowFixMe
      const areaStatuses: Array<LayersCacheStatus> = Object.values(status);
      return areaStatuses.filter(areaStatus => areaStatus?.completed ?? false).length === areaStatuses.length;
    };

    const previouslyDone = isDone(previousProps.downloadProgress);
    const nowDone = isDone(this.props.downloadProgress);
    // $FlowFixMe
    const didError = Object.values(this.props.downloadProgress ?? {}).some(areaStatus => areaStatus.error);

    // Set this back to false otherwise we could trigger another pop!
    if (!previouslyDone && nowDone) {
      this.popOnDownload = false;
    }

    if (!previouslyDone && nowDone && !didError) {
      if (this.props.popToComponentId) {
        Navigation.popTo(this.props.popToComponentId);
      } else {
        Navigation.pop(this.props.componentId);
      }
    }
  }

  onPressViewDescription = debounceUI(() => {
    const { layer } = this.props;
    const { name, description } = layer;

    if (!name || !description) {
      return;
    }

    presentInformationModal({
      title: name,
      body: description
    });
  });

  onPressDownload = () => {
    this.setState({
      download: true
    });
  };

  onPressOfflineOnly = () => {
    this.setState({
      download: false
    });
  };

  render() {
    // $FlowFixMe
    const downloadProgress: Array<LayersCacheStatus> = Object.values(this.props.downloadProgress ?? {});
    const didError = downloadProgress.some(areaStatus => areaStatus.error);
    const done = !downloadProgress.some(areaStatus => !areaStatus.completed);

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={[styles.listContent, this.state.downloading ? { opacity: 0.5 } : {}]}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          alwaysBounceVertical={false}
        >
          <Text style={styles.heading}>{this.props.layer.name}</Text>
          {this.props.layer.description ? (
            <Row
              action={{
                icon: infoIcon,
                callback: !this.state.downloading ? this.onPressViewDescription : null
              }}
              iconStyle={styles.rowIcon}
              style={styles.row}
              rowStyle={styles.rowContainer}
            >
              <Text style={styles.rowLabel}>{i18n.t('importLayer.gfw.description')}</Text>
            </Row>
          ) : null}
          {didError && done && this.state.downloadAttempted && (
            <Text style={styles.error}>{i18n.t('importLayer.gfw.error')}</Text>
          )}
          <Row
            action={{
              icon: this.state.download ? checkboxOnIcon : checkboxOffIcon,
              callback: !this.state.downloading ? this.onPressDownload : null,
              position: 'top'
            }}
          >
            <Text style={styles.rowTitleLabel}>{i18n.t('importLayer.gfw.downloadTitle')}</Text>
            <Text style={styles.rowSubtitleLabel}>{i18n.t('importLayer.gfw.downloadSubtitle')}</Text>
          </Row>
          <Row
            action={{
              icon: !this.state.download ? checkboxOnIcon : checkboxOffIcon,
              callback: !this.state.downloading ? this.onPressOfflineOnly : null,
              position: 'top'
            }}
          >
            <Text style={styles.rowTitleLabel}>{i18n.t('importLayer.gfw.onlineTitle')}</Text>
            <Text style={styles.rowSubtitleLabel}>{i18n.t('importLayer.gfw.onlineSubtitle')}</Text>
          </Row>
        </ScrollView>
        <BottomTray showProgressBar={this.state.downloading} requiresSafeAreaView>
          <ActionButton
            onPress={this.state.downloading ? null : this.onPressAdd}
            text={this.state.downloading ? i18n.t('importLayer.gfw.downloading') : i18n.t('importLayer.gfw.add')}
            noIcon
          />
        </BottomTray>
      </View>
    );
  }
}

export default LayerDownload;
