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
    justifyContent: 'space-between',
    position: 'relative'
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
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start'
  },
  title: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 16
  },
  downloadedIcon: {
    position: 'absolute',
    bottom: 12,
    left: 148
  }
});
