// @flow
import type { LayerType } from 'types/sharing.types';
import type { ViewStyle } from 'types/reactElementStyles.types';
import React, { Component } from 'react';

import {
  View,
  Text,
  TouchableHighlight,
  Image,
  ImageBackground,
  Platform,
  TouchableNativeFeedback
} from 'react-native';
import i18n from 'i18next';

import ProgressBar from 'react-native-progress/Bar';

import { GFW_CONTEXTUAL_LAYERS_METADATA } from 'config/constants';
import Theme from 'config/theme';
import styles from './styles';
import type { ContextualLayer } from 'types/layers.types';
import type { Basemap } from 'types/basemaps.types';
import queryLayerFiles from 'helpers/layer-store/queryLayerFiles';
import { manifestBundleSize } from 'helpers/sharing/calculateBundleSize';
import { formatBytes } from 'helpers/data';

const infoIcon = require('assets/info.png');
const refreshIcon = require('assets/refreshLayer.png');
const downloadIcon = require('assets/downloadGrey.png');
const downloadedIcon = require('assets/downloadedGrey.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');
const deleteIcon = require('assets/settingsDelete.png');
const renameIcon = require('assets/settingsEdit.png');

const icons = {
  basemap: {
    placeholder: require('assets/basemap_placeholder.png')
  },
  contextual_layer: {
    placeholder: require('assets/layerPlaceholder.png')
  }
};

type Props = {
  downloaded?: boolean,
  downloading?: boolean,
  inEditMode: boolean,
  layer: ContextualLayer | Basemap,
  layerType: LayerType,
  onDeletePress: () => void,
  onDownloadPress?: ?() => void,
  onPress?: ?() => void,
  onInfoPress?: () => void,
  onRenamePress?: () => void,
  selected?: ?boolean,
  style?: ?ViewStyle
};

type State = {
  sizeInBytes: ?number
};

export default class MappingFileRow extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sizeInBytes: null
    };
  }

  componentDidMount() {
    this._calculateSize();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.downloaded !== prevProps.downloaded) {
      this._calculateSize();
    }
  }

  _calculateSize = async () => {
    const { layer, layerType } = this.props;

    if (!layerType === 'basemap') {
      return;
    }

    const layerFiles = await queryLayerFiles(layerType, { whitelist: [layer.id], blacklist: [] });
    const sizeInBytes = manifestBundleSize({
      layerFiles,
      reportFiles: []
    });
    this.setState({
      sizeInBytes
    });
  };

  renderIcons = () => {
    const { inEditMode, layer, layerType, selected } = this.props;
    const isRenamable = layer.isCustom;
    const isPresentOnDisk = (this.state.sizeInBytes ?? 0) > 0 || this.props.downloaded;

    const isDeletable =
      isPresentOnDisk ||
      layer.isCustom ||
      (layerType === 'contextual_layer' && !!GFW_CONTEXTUAL_LAYERS_METADATA[layer.id]);
    const isRefreshable = this.props.downloaded && layerType === 'contextual_layer';
    const isDownloadable = layerType === 'contextual_layer' || (layerType === 'basemap' && !layer.tileUrl);

    if (inEditMode) {
      return (
        <React.Fragment>
          {isRenamable && this.renderIcon(renameIcon, this.props.onRenamePress)}
          {isDeletable && this.renderIcon(deleteIcon, this.props.onDeletePress)}
        </React.Fragment>
      );
    }
    if (selected === false) {
      return this.renderIcon(checkboxOff, this.props.onPress);
    } else if (selected === true) {
      return this.renderIcon(checkboxOn, this.props.onPress);
    }

    return (
      <React.Fragment>
        {this.props.onInfoPress && this.renderIcon(infoIcon, this.props.onInfoPress)}
        {this.renderIcon(
          this.props.downloaded ? (isRefreshable ? refreshIcon : downloadedIcon) : isDownloadable ? downloadIcon : null,
          this.props.onDownloadPress
        )}
      </React.Fragment>
    );
  };

  renderIcon = (icon: ?number, onPress: ?() => void) => {
    const Touchable = Platform.select({
      android: TouchableNativeFeedback,
      ios: TouchableHighlight
    });

    if (icon == null) {
      return null;
    }

    return (
      <Touchable
        disabled={onPress == null}
        onPress={onPress}
        background={Platform.select({
          // hide ripple as hitbox is wider than icon
          android: TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0)'),
          ios: undefined
        })}
        underlayColor={Platform.select({
          android: undefined,
          ios: 'white'
        })}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Image source={icon} />
        </View>
      </Touchable>
    );
  };

  render() {
    const { layer, layerType, downloading } = this.props;

    const titleKey = layerType === 'basemap' ? `basemaps.names.${layer.name}` : layer.name;
    const title = i18n.t(titleKey);
    const subtitle =
      this.state.sizeInBytes !== null && layerType === 'contextual_layer' ? formatBytes(this.state.sizeInBytes) : '';
    const image = layer.image ?? icons[layerType].placeholder;

    return (
      <View style={styles.item}>
        <View style={styles.imageContainer}>
          {image && <ImageBackground resizeMode={'cover'} style={styles.image} source={image} />}
        </View>
        <View style={styles.contentContainer}>
          <Text numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          {!!subtitle && (
            <View style={styles.subtitleContainer}>
              <Text style={styles.title}>{subtitle}</Text>
            </View>
          )}
        </View>
        {!downloading && <View style={styles.iconsContainer}>{this.renderIcons()}</View>}
        {downloading && (
          <View style={styles.progressBarContainer}>
            <ProgressBar
              indeterminate={true}
              width={Theme.screen.width}
              height={4}
              color={Theme.colors.turtleGreen}
              borderRadius={0}
              borderColor="transparent"
            />
          </View>
        )}
      </View>
    );
  }
}
