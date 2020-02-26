import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import VerticalSplitRow from 'components/common/vertical-split-row';
import AreaCache from 'containers/common/area-list/area-cache';
import styles from './styles';

import type { Area } from 'types/areas.types';


type Props = {
  areas: Array<Area>,
  onAreaPress: (areaId: string, name: string) => void,
  onAreaSettingsPress: (areaId: string, name: string) => void,
  selectionState?: { [string]: boolean },
  sharing?: boolean,
  showCache?: boolean,
  pristine?: boolean
};

export default class AreaList extends Component<Props> {

  render() {

    const { areas, onAreaPress, onAreaSettingsPress, showCache, pristine } = this.props;
    if (!areas) {
      return null;
    }

    return (
      <View>
        {areas.map((area, index) => (
          <View key={`${area.id}-area-list`} style={styles.container}>
            <VerticalSplitRow
              onPress={() => onAreaPress(area.id, area.name)}
              onSettingsPress={() => onAreaSettingsPress(area.id, area.name)}
              imageSrc={area.image}
              selected={this.props.selectionState?.[area.id]}
              title={area.name}
            />
            {showCache && <AreaCache areaId={area.id} showTooltip={index === 0 && pristine} />}
          </View>
        ))}
      </View>
    );
  }
}
