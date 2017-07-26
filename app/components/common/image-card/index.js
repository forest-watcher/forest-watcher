import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  TouchableHighlight,
  Image
} from 'react-native';
import Theme from 'config/theme';
import styles from './styles';

const ImageCard = ({ id, name, uri, actions, width, height }) => {
  const computedHeight = height - 48; // FIXME: 48 is the height of the actions bar
  return (
    <View style={styles.container}>
      <Image
        resizeMode="cover"
        style={{ height: computedHeight, width }}
        source={{ uri }}
      />
      {actions &&
        <View style={styles.actions}>
          {
            actions.map((action, i) => (
              <TouchableHighlight
                key={i}
                activeOpacity={0.5}
                underlayColor="transparent"
                onPress={() => action.callback(id, name)}
              >
                <Image style={Theme.icon} source={action.icon} />
              </TouchableHighlight>
            ))
          }
        </View>
      }
    </View>
  );
};

ImageCard.propTypes = {
  id: PropTypes.string.isRequired,
  uri: PropTypes.string.isRequired,
  actions: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  name: PropTypes.string.isRequired
};

export default ImageCard;
