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
  inputContainer: {
    flex: 1
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
    color: Theme.fontColors.light,
    fontFamily: Theme.font,
    fontSize: 17
  },
  section: {
    marginTop: 16
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
