import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  rowContainer: {
    marginBottom: 26
  },
  row: {
    height: Platform.OS === 'android' ? 130 : undefined // extra 2 for bottomBorder in Row component
  },
  calloutFirstRowContainer: {
    // GFW-459 & GFW-584 - prevent area tooltip bottom from being cut off on android
    marginBottom: 126,
    zIndex: 10000
  },
  calloutSecondRowContainer: {
    // GFW-459 & GFW-584 - prevent area tooltip bottom from being cut off on android
    marginTop: -100,
    marginBottom: 26
  }
});
