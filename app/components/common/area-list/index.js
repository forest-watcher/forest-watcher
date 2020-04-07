// @flow
import type { Area } from 'types/areas.types';

import React, { Component } from 'react';
import { View } from 'react-native';

import VerticalSplitRow from 'components/common/vertical-split-row';
import AreaCache from 'containers/common/area-list/area-cache';
import styles from './styles';

import i18n from 'i18next';

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
      showCache,
      pristine
    } = this.props;
    if (!areas) {
      return null;
    }

    return (
      <View style={styles.container}>
        {areas.map((area, index) => (
          <View
            key={`${area.id}-area-list`}
            style={[styles.rowContainer, index === 0 && downloadCalloutVisible ? { zIndex: 10000 } : { zIndex: index }]}
          >
            <VerticalSplitRow
              downloadCalloutBody={i18n.t('areas.tooltip.body')}
              downloadCalloutVisible={index === 0 && downloadCalloutVisible}
              downloadCalloutTitle={i18n.t('areas.tooltip.title')}
              downloadVisible={true}
              onDownloadPress={() => onAreaDownloadPress?.(area.id, area.name)}
              onPress={downloadCalloutVisible ? null : () => onAreaPress(area.id, area.name)}
              disableSettingsButton={this.props.sharing}
              onSettingsPress={downloadCalloutVisible ? null : () => onAreaSettingsPress(area.id, area.name)}
              imageSrc={area.image}
              selected={this.props.sharing ? this.props.selectionState?.includes?.(area.id) : null}
              title={area.name}
              style={styles.row}
              largerLeftPadding
              largeImage
            />
            {showCache && <AreaCache areaId={area.id} showTooltip={index === 0 && pristine} />}
          </View>
        ))}
      </View>
    );
  }
}
