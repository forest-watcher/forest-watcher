import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.background.main
  },
  indexBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dot: {
    backgroundColor: Theme.background.white,
    width: 10,
    height: 10,
    borderRadius: 4,
    marginLeft: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: Theme.borderColors.main
  },
  dotActive: {
    backgroundColor: Theme.background.secondary,
    borderColor: Theme.background.secondary
  }
});
