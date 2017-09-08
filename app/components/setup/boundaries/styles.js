import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  content: {
    marginTop: 26,
    marginLeft: Theme.margin.left
  },
  iconDraw: {
    width: 98,
    height: 80,
    marginTop: 26,
    marginBottom: 19
  },
  buttonPos: {
    position: 'absolute',
    bottom: 50,
    left: 8,
    right: 8
  }
});
