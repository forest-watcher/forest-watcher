import Theme from 'config/theme';
import { StyleSheet } from 'react-native';
import { hexToRgb } from 'helpers/utils';

export default StyleSheet.create({
  container: {
    flexDirection: 'row'
  },
  alertIcon: {
    width: 24,
    height: 24,
    backgroundColor: `rgba(${hexToRgb(Theme.colors.color1)}, 0.8)`,
    marginRight: 8
  },
  alertLabel: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17
  }
});
