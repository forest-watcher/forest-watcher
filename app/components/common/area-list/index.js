import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import VerticalSplitRow from 'components/common/vertical-split-row';
import AreaCache from 'containers/common/area-list/area-cache';
import styles from './styles';

function AreaList(props) {
  const { areas, onAreaPress, onAreaSettingsPress, showCache, pristine } = props;
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
            title={area.name}
          />
          {showCache && <AreaCache areaId={area.id} showTooltip={index === 0 && pristine} />}
        </View>
      ))}
    </View>
  );
}

AreaList.propTypes = {
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string
    })
  ),
  onAreaPress: PropTypes.func,
  onAreaSettingsPress: PropTypes.func,
  showCache: PropTypes.bool,
  pristine: PropTypes.bool
};

export default AreaList;
