import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  containerContent: {
    paddingTop: 10
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: Theme.fontColors.secondary,
    paddingTop: 14,
    marginLeft: -4
  },
  buttonContainer: {
    padding: 10
  },
  imageContainer: {
    backgroundColor: Theme.background.modal,
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: 360,
    height: 200,
    resizeMode: 'cover'
  },
  title: {
    marginLeft: Theme.margin.left,
    marginRight: Theme.margin.right,
    marginBottom: 6,
    color: Theme.fontColors.light,
    fontFamily: Theme.font,
    fontSize: 17
  },
  row: {
    marginTop: 16
  },
  section: {
    flex: 1,
    height: 64,
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    backgroundColor: Theme.colors.color5,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: {
    width: 200,
    height: 22,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400'
  }
});
