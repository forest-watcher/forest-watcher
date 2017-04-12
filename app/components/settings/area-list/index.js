import React, { Component } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import Theme from 'config/theme';
import styles from './styles';

const nextIcon = require('assets/next.png');

class AreaList extends Component {
  linkToArea(areaId) {
    this.props.navigate('AreaDetail', { id: areaId });
  }

  render() {
    const { areas, areasImages } = this.props;
    const areasCollection = areas.map((item, key) => {
      const area = item.attributes;
      area.id = item.id;
      const image = areasImages[area.id];

      return (
        <TouchableHighlight
          key={key}
          activeOpacity={0.5}
          underlayColor="transparent"
          onPress={() => this.linkToArea(area.id)}
        >
          <View style={styles.item}>
            <View style={styles.imageContainer}>
              {image
                ? <Image style={styles.image} source={{ uri: image }} />
                : null
              }
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {area.name}
            </Text>
            <TouchableHighlight
              activeOpacity={0.5}
              underlayColor="transparent"
              onPress={(areaId) => this.linkToArea(area.id, areaId)}
            >
              <Image style={Theme.icon} source={nextIcon} />
            </TouchableHighlight>
          </View>
        </TouchableHighlight>
      )
      })
    return ( 
      <View>
        { this.props.syncing ? 
          <ActivityIndicator
            color={Theme.colors.color1}
            style={{ height: 80 }}
            size={'large'}
          /> : areasCollection
        }
      </View>
    );
  }
}

AreaList.propTypes = {
  syncing: React.PropTypes.bool,
  areas: React.PropTypes.array,
  areasImages: React.PropTypes.object,
  navigate: React.PropTypes.func.isRequired
};

export default AreaList;