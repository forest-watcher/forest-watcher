import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  rowContainer: {
    // GFW-459 - prevent area tooltip bottom from being cut off on android
    marginBottom: 76,
    marginTop: -50
  },
  row: {
    height: Platform.OS === "android" ? 130 : undefined // extra 2 for bottomBorder in Row component
  },
  container: {
    marginTop: 50
  }
});
