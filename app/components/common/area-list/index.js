// @flow
import type { Area } from 'types/areas.types';

import React, { Component } from 'react';
import { View } from 'react-native';

import VerticalSplitRow from 'components/common/vertical-split-row';
import AreaCache from 'containers/common/area-list/area-cache';
import styles from './styles';

type Props = {
  areas: Array<Area>,
  downloadCalloutVisible?: ?boolean,
  onAreaDownloadPress?: (areaId: string, name: string) => void,
  onAreaPress: (areaId: string, name: string) => void,
  onAreaSettingsPress: (areaId: string, name: string) => void,
  selectionState?: Array<string>,
  sharing?: boolean,
  showCache?: boolean,
  pristine?: boolean
};

export default class AreaList extends Component<Props> {
  render() {
    const {
      areas,
      downloadCalloutVisible,
      onAreaDownloadPress,
      onAreaPress,
      onAreaSettingsPress,
      showCache
    } = this.props;
    if (!areas) {
      return null;
    }
    const getRowContainerStyle = index =>
      index === 0 && downloadCalloutVisible
        ? styles.calloutFirstRowContainer
        : index === 1 && downloadCalloutVisible
        ? styles.calloutSecondRowContainer
        : styles.rowContainer;

    return (
      <View>
        {areas.map((area, index) => (
          <View key={`${area.id}-area-list`} style={getRowContainerStyle(index)}>
            <VerticalSplitRow
              downloadVisible={false}
              onDownloadPress={() => onAreaDownloadPress?.(area.id, area.name)}
              onPress={downloadCalloutVisible ? null : () => onAreaPress(area.id, area.name)}
              disableSettingsButton={this.props.sharing || (index === 0 && downloadCalloutVisible)}
              onSettingsPress={() => onAreaSettingsPress(area.id, area.name)}
              imageSrc={area.image}
              selected={this.props.sharing ? this.props.selectionState?.includes?.(area.id) : null}
              title={area.name}
              style={styles.row}
              largerLeftPadding
              largeImage
            />
            {showCache && (
              <AreaCache
                areaId={area.id}
                disabled={this.props.sharing}
                showTooltip={index === 0 && downloadCalloutVisible}
              />
            )}
          </View>
        ))}
      </View>
    );
  }
}
