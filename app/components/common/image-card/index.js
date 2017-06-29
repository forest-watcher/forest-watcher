import React from 'react';
import {
  View,
  TouchableHighlight,
  Image
} from 'react-native';
import Theme from 'config/theme';
import ImageCache from 'components/common/image-cache';
import styles from './styles';

const ImageCard = ({ id, uri, actions, width, height }) => (
  <View style={styles.container}>
    <ImageCache
      resizeMode="contain"
      style={{ height, width }}
      localSource
      source={{ uri }}
    />
    <View style={styles.actions}>
      {
        actions.map((action, i) => (
          <TouchableHighlight
            key={i}
            activeOpacity={0.5}
            underlayColor="transparent"
            onPress={() => action.callback(id)}
          >
            <Image style={Theme.icon} source={action.icon} />
          </TouchableHighlight>
        ))
      }
    </View>
  </View>
);

ImageCard.propTypes = {
  id: React.PropTypes.string,
  uri: React.PropTypes.string,
  actions: React.PropTypes.array,
  width: React.PropTypes.number,
  height: React.PropTypes.number
};

export default ImageCard;
