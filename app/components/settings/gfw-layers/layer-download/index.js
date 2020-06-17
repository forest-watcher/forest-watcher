// @flow
import React, { PureComponent } from 'react';
import { Image, View, ScrollView, Text } from 'react-native';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import Row from 'components/common/row';

import type { ContextualLayer } from 'types/layers.types';
import type { LayerType } from 'types/sharing.types';

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
    layer: ContextualLayer,
    onlyNonDownloadedAreas: boolean,
    downloadLayer: boolean
  ) => Promise<void>,
  componentId: string,
  layer: ContextualLayer,
  +offlineMode: boolean,
  popToComponentId: string,
  +showNotConnectedNotification: () => void
};

type State = {
  download: boolean,
  downloading: boolean
};

class LayerDownload extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      download: this.layerIsOnlineOnly(props.layer?.url),
      downloading: false
    };
  }

  layerIsOnlineOnly = (url: string): boolean => {
    return url?.startsWith('mapbox://');
  };

  onPressAdd = async () => {
    if (this.props.offlineMode && this.state.download) {
      this.props.showNotConnectedNotification();
      return;
    }

    if (this.state.download) {
      this.setState({
        downloading: true
      });
    }

    await this.props.addLayer('contextual_layer', this.props.layer, false, this.state.download);

    if (this.state.download) {
      this.setState({
        downloading: false
      });
    }

    if (this.props.popToComponentId) {
      Navigation.popTo(this.props.popToComponentId);
    } else {
      Navigation.pop(this.props.componentId);
    }
  };

  onPressViewDescription = debounceUI(() => {
    presentInformationModal({
      title: this.props.layer.name,
      body: this.props.layer.description
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

  renderDownloadRow = () => {
    const isOnlineOnly = this.layerIsOnlineOnly(this.props.layer.url);
    const titleKey = isOnlineOnly ? 'importLayer.gfw.downloadUnavailableTitle' : 'importLayer.gfw.downloadTitle';
    const subtitleKey = isOnlineOnly
      ? 'importLayer.gfw.downloadUnavailableSubtitle'
      : 'importLayer.gfw.downloadSubtitle';

    return (
      <Row
        action={
          isOnlineOnly
            ? null
            : {
                icon: this.state.download ? checkboxOnIcon : checkboxOffIcon,
                callback: !this.state.downloading ? this.onPressDownload : null,
                position: 'top'
              }
        }
      >
        <Text style={styles.rowTitleLabel}>{i18n.t(titleKey)}</Text>
        <Text style={styles.rowSubtitleLabel}>{i18n.t(subtitleKey)}</Text>
      </Row>
    );
  };

  render() {
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
          {this.renderDownloadRow()}
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
