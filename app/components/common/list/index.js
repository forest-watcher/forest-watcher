import React from 'react';
import {
  View,

  Image,
  Text
} from 'react-native';
import styles from './styles';

const imageExample = require('assets/appicon/app-icon@120x120.png');
const nextImage = require('assets/next@2x.png');

function List(props) {
  return (
    <View>
      {props.content.map((data, key) =>
      (
        <View key={key} style={styles.container}>
          <View style={data.text ? styles.containerImageText : styles.containerOnlyImage}>
            {data.image &&
              <Image
                source={imageExample}
                style={[data.text ? styles.imageList : styles.imageListMargin]}
              />
            }
            {data.text &&
              <Text style={styles.text}>{data.text}</Text>
            }
          </View>
          <Image
            style={styles.nextImage}
            source={nextImage}
          />
        </View>
      )
    )}
    </View>
  );
}

List.propTypes = {

};

export default List;
