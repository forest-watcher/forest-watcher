import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    marginBottom: 16
  },
  item: {
    paddingRight: 10,
    height: 128,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    backgroundColor: Theme.background.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  imageContainer: {
    width: 128,
    height: 126,
    backgroundColor: Theme.background.modal
  },
  image: {
    width: 128,
    height: 126,
    resizeMode: 'cover'
  },
  title: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 16
  },
  rowTitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontStyle: 'italic'
  }
});
