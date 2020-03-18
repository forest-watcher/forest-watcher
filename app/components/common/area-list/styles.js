import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    // GFW-459 - prevent area tooltip bottom from being cut off on android
    marginBottom: 76,
    marginTop: -50
  }
});
