import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    marginBottom: 26
  },
  item: {
    paddingRight: 10,
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
    height: 126
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginVertical: 16
  },
  title: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 16
  },
  subtitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 15,
    fontWeight: '400',
    marginLeft: 16,
    marginTop: 8
  }
});
