import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  contentContainer: {
    backgroundColor: Theme.background.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    ...Theme.text,
    marginLeft: 24,
    width: '50%',
    lineHeight: 24
  },
  loadingBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: Theme.colors.turtleGreenLight
  },
  loadingBar: {
    height: '100%',
    backgroundColor: Theme.colors.turtleGreen
  }
});
