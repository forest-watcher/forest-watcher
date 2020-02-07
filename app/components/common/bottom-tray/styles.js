import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.white,
    borderTopColor: Theme.colors.veryLightPinkTwo,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Theme.colors.greyishBrown,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      height: -3,
      width: 0
    }
  }
});
