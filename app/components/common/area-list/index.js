import React from 'react';
import PropTypes from 'prop-types';
import { Image, Text, TouchableHighlight, View } from 'react-native';

import Theme from 'config/theme';

import SettingsButton from 'components/common/settings-button';
import AreaCache from 'containers/common/area-list/area-cache';
import styles from './styles';

const nextIcon = require('assets/next.png');

function AreaList(props) {
  const { areas, onAreaPress, onAreaSettingsPress, showCache, pristine } = props;
  if (!areas) return null;

  return (
    <View>
      {areas.map((area, index) => (
        <View key={`${area.id}-area-list`} style={styles.container}>
          <TouchableHighlight
            activeOpacity={0.5}
            underlayColor="transparent"
            onPress={() => onAreaPress(area.id, area.name)}
          >
            <View style={styles.item}>
              <View style={styles.imageContainer}>
                {area.image ? <Image style={styles.image} source={{ uri: area.image }} /> : null}
              </View>
              <View style={styles.contentContainer}>
                <View style={styles.nameContainer}>
                  <Text style={styles.title} numberOfLines={2}>
                    {area.name}
                  </Text>
                  <Image style={[Theme.icon, styles.disclosureIndicator]} source={nextIcon} />
                </View>
                <SettingsButton 
                  onPress={() => onAreaSettingsPress(area.id, area.name)}
                  style={styles.settingsButton}
                />
              </View>
            </View>
          </TouchableHighlight>
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
