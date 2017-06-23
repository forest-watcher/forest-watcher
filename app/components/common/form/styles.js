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
    paddingTop: 32
  },
  buttonSaveContainer: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 32,
    paddingBottom: 32
  }
});
