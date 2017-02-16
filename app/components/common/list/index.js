import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Text
} from 'react-native';
import styles from './styles';

const imageExample = require('assets/appicon/app-icon@120x120.png');
const nextImage = require('assets/next@2x.png');

function List(props) {
  return (
    <ScrollView>
      {props.content.map((data, key) =>
      (
        <View
          key={key}
          style={data.bigSeparation ? [styles.container, styles.containerBigSeparation] : [styles.container]}
          onPress={data.functionOnPress}
        >
          <View style={data.text ? styles.containerImageText : styles.containerOnlyImage}>
            {data.image &&
              <Image
                source={imageExample}
                style={styles.imageList}
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
      )
    )}
    </ScrollView>
  );
}

List.propTypes = {
  content: React.PropTypes.array
};

export default List;
