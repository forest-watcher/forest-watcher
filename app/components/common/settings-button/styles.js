import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    borderRadius: 20
  },
  content: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: Theme.colors.veryLightPinkTwo,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Theme.colors.white,
    flexDirection: 'row'
  },
  disabled: {
    opacity: 0.6
  },
  margins: {
    marginTop: 10,
    marginBottom: 10
  },
  text: {
    color: Theme.fontColors.secondary,
    fontWeight: '400',
    fontSize: 12,
    fontFamily: Theme.font,
    marginLeft: 4
  }
});
