import React from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableHighlight,
  Text
} from 'react-native';
import styles from './styles';

const nextImage = require('assets/next.png');

function List(props) {
  return (
    <ScrollView>
      { props.content.map((data, key) => {
        return (
          <TouchableHighlight
            key={`link-${key}`}
            onPress={() => data.functionOnPress()}
            activeOpacity={1}
            underlayColor="transparent"
          >
            <View
              key={key}
              style={props.bigSeparation ? [styles.container, styles.containerBigSeparation] : [styles.container]}
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
          </TouchableHighlight>
        );
      }
    )}
    </ScrollView>
  );
}

List.propTypes = {
  content: React.PropTypes.array,
  bigSeparation: React.PropTypes.bool
};

export default List;
