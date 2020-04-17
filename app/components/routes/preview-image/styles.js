import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  image: {
    flex: 1,
    overflow: 'hidden',
    width: undefined, // Required to make `require()` image scale
    height: undefined // Required to make `require()` image scale
  }
});
