// @flow
import React, { PureComponent } from 'react';
import { Image, View, ScrollView, Text } from 'react-native';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import Row from 'components/common/row';

import type { ContextualLayer } from 'types/layers.types';

import i18n from 'i18next';
import styles from './styles';
import debounceUI from 'helpers/debounceUI';
import { presentInformationModal } from 'screens/common';

import { Navigation } from 'react-native-navigation';

const infoIcon = require('assets/info.png');
const checkboxOnIcon = require('assets/radio_button.png');
const checkboxOffIcon = require('assets/checkbox_off.png');

type Props = {
  addLayer: (layer: ContextualLayer) => void,
  componentId: string,
  layer: ContextualLayer,
  popToComponentId: string
};

type State = {
  download: boolean
};

class LayerDownload extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      download: true
    };
  }

  onPressAdd = () => {
    this.props.addLayer(this.props.layer);
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

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          alwaysBounceVertical={false}
        >
          <Text style={styles.heading}>{this.props.layer.name}</Text>
          {this.props.layer.description ? (
            <Row
              action={{
                icon: infoIcon,
                callback: this.onPressViewDescription
              }}
              iconStyle={styles.rowIcon}
              style={styles.row}
              rowStyle={styles.rowContainer}
            >
              <Text style={styles.rowLabel}>{i18n.t('importLayer.gfw.description')}</Text>
            </Row>
          ) : null}
          <Row
            action={{
              icon: this.state.download ? checkboxOnIcon : checkboxOffIcon,
              callback: this.onPressDownload,
              position: 'top'
            }}
          >
            <Text style={styles.rowTitleLabel}>{i18n.t('importLayer.gfw.downloadTitle')}</Text>
            <Text style={styles.rowSubtitleLabel}>{i18n.t('importLayer.gfw.downloadSubtitle')}</Text>
          </Row>
          <Row
            action={{
              icon: !this.state.download ? checkboxOnIcon : checkboxOffIcon,
              callback: this.onPressOfflineOnly,
              position: 'top'
            }}
          >
            <Text style={styles.rowTitleLabel}>{i18n.t('importLayer.gfw.onlineTitle')}</Text>
            <Text style={styles.rowSubtitleLabel}>{i18n.t('importLayer.gfw.onlineSubtitle')}</Text>
          </Row>
        </ScrollView>
        <BottomTray requiresSafeAreaView>
          <ActionButton onPress={this.onPressAdd} text={i18n.t('importLayer.gfw.add')} noIcon />
        </BottomTray>
      </View>
    );
  }
}

export default LayerDownload;
