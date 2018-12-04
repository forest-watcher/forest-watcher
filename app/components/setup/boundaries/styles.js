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
  },
  header: {
    left: 0,
    right: 0,
    top: 0,
    height: 164,
    zIndex: 3,
    position: 'absolute'
  },
  headerBg: {
    width: Theme.screen.width,
    height: 132,
    resizeMode: 'stretch',
    position: 'absolute',
    top: 0
  }
});
