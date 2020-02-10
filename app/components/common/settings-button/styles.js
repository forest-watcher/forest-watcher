import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    borderRadius: 20
  },
  content: {
    alignItems: 'center',
    borderColor: Theme.colors.veryLightPinkTwo,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Theme.colors.white,
    flexDirection: 'row'
  },
  text: {
    color: Theme.fontColors.secondary,
    fontWeight: '400',
    fontSize: 12,
    fontFamily: Theme.font,
    marginLeft: 4
  }
});
