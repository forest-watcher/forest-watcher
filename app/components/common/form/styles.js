import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    position: 'relative'
  },
  containerCenter: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonPos: {
    position: 'absolute',
    bottom: 52,
    left: 8,
    right: 8
  },
  buttonNextPos: {
    position: 'absolute',
    bottom: 52,
    right: 8
  },
  answersContainer: {
    backgroundColor: Theme.background.main,
    flex: 1,
    paddingTop: 32
  },
  answersText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17
  },
  picturesContainer: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right
  },
  buttonSaveContainer: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 32,
    paddingBottom: 32
  }
});
