import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  content: {
    flexDirection: 'row',
    flex: 1
  },
  item: {
    width: 128,
    height: 184,
    backgroundColor: '#FFFFFF',
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    margin: 7,
    overflow: 'hidden'
  },
  image: {
    width: 128,
    height: 128
  },
  name: {
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.main
  },
  placeholder: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  placeholderImage: {
    width: Theme.screen.width - 20,
    resizeMode: 'stretch'
  }
});
