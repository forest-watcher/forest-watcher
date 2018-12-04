import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Image,
  TouchableHighlight,
  Text
} from 'react-native';
import FastImage from 'react-native-fast-image';

import styles from './styles';

const nextImage = require('assets/next.png');

function onPress(data) {
  if (data && data.functionOnPress) {
    if (data.url) {
      data.functionOnPress(data.url);
    } else {
      data.functionOnPress(data.section, data.text, data.list, data.description);
    }
  }
}

function List(props) {
  return (
    <ScrollView>
      { props.content.map((data, key) => (
        <TouchableHighlight
          key={`link-${key}`}
          onPress={() => onPress(data)}
          activeOpacity={1}
          underlayColor="transparent"
        >
          <View
            key={key}
            style={props.bigSeparation ? [styles.container, styles.containerBigSeparation] : [styles.container]}
          >
            <View style={data.text ? styles.containerImageText : styles.containerOnlyImage}>
              {data.image &&
                <FastImage
                  style={styles.imageList}
                  source={data.image}
                  resizeMode={"contain"}
                />
              }
              {data.text &&
                <Text style={styles.text}>{data.text}</Text>
              }
            </View>
            <Image
              style={styles.nextIcon}
              source={nextImage}
            />
          </View>
        </TouchableHighlight>
      ))}
    </ScrollView>
  );
}

List.propTypes = {
  content: PropTypes.array,
  bigSeparation: PropTypes.bool
};

export default List;
