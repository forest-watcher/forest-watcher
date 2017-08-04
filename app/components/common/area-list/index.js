import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import Theme from 'config/theme';
import isEqual from 'lodash/isEqual';

import AreaCache from 'containers/dashboard/area-cache';
import styles from './styles';

const Timer = require('react-native-timer');

const nextIcon = require('assets/next.png');
const downloadedIcon = require('assets/downloaded.png');

class AreaList extends PureComponent {

  static propTypes = {
    areas: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        image: PropTypes.string,
        cacheComplete: PropTypes.bool
      })
    ),
    onAreaPress: PropTypes.func,
    showCache: PropTypes.bool
  };

  static defaultProps = {
    showCache: false
  };

  state = {
    areasToCache: this.props.areas.map(area => area.cacheComplete)
  };

  componentWillReceiveProps(nextProps) {
    const areasToCache = nextProps.areas.map(area => area.cacheComplete);
    if (!isEqual(areasToCache, this.state.areasToCache)) {
      this.updateAreasToCache(areasToCache);
    }
  }

  componentWillUnmount() {
    Timer.clearTimeout(this, 'updateAreasToCache');
  }

  updateAreasToCache(areasToCache) {
    Timer.setTimeout(this, 'updateAreasToCache', () => this.setState({ areasToCache }), 350);
  }

  render() {
    const { areas, onAreaPress, showCache } = this.props;
    const { areasToCache } = this.state;
    if (!areas) return null;

    return (
      <View>
        {areas.map((area, index) => (
          <View key={`${area.id}-area-list`} style={styles.container}>
            <TouchableHighlight
              activeOpacity={0.5}
              underlayColor="transparent"
              onPress={() => onAreaPress(area.id, area.name, index)}
            >
              <View style={styles.item}>
                <View style={styles.imageContainer}>
                  {area.image
                    ? <Image style={styles.image} source={{ uri: area.image }} />
                    : null
                  }
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.title} numberOfLines={2}> {area.name} </Text>
                  {showCache && area.cacheComplete &&
                    <Image style={[Theme.icon, styles.downloadedIcon]} source={downloadedIcon} />
                  }
                </View>
                <TouchableHighlight
                  activeOpacity={0.5}
                  underlayColor="transparent"
                  onPress={() => onAreaPress(area.id, area.name)}
                >
                  <Image style={Theme.icon} source={nextIcon} />
                </TouchableHighlight>
              </View>
            </TouchableHighlight>
            {showCache && !areasToCache[index] &&
              <AreaCache areaId={area.id} />
            }
          </View>
        ))}
      </View>
    );
  }
}

export default AreaList;
