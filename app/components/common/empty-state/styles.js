import { StyleSheet } from 'react-native';
import Theme from 'config/theme';

export default StyleSheet.create({
  actionText: {
    ...Theme.text,
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  bodyText: {
    ...Theme.text,
    color: Theme.fontColors.secondary,
    fontSize: 12,
    marginBottom: 60,
    opacity: 0.6,
    textAlign: 'center'
  },
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Theme.colors.white,
    paddingHorizontal: 60,
    paddingVertical: 52
  },
  icon: {
    marginBottom: 24
  },
  titleText: {
    ...Theme.text,
    color: Theme.fontColors.secondary,
    fontSize: 24,
    opacity: 0.6,
    textAlign: 'center'
  }
});
