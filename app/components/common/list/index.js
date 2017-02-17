import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Text
} from 'react-native';
import styles from './styles';

const nextImage = require('assets/next.png');

function List(props) {
  return (
    <ScrollView>
      {props.content.map((data, key) =>
      (
        <View
          key={key}
          style={props.bigSeparation ? [styles.container, styles.containerBigSeparation] : [styles.container]}
          onPress={data.functionOnPress}
        >
          <View style={data.text ? styles.containerImageText : styles.containerOnlyImage}>
            {data.image &&
              <Image
                style={styles.imageList}
                source={data.image}
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
  content: React.PropTypes.array,
  bigSeparation: React.PropTypes.bool
};

export default List;
