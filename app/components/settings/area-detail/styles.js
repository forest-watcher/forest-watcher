import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    paddingTop: 10
  },
  containerContent: {
    paddingBottom: 20
  },
  content: {
    paddingTop: 0,
    paddingBottom: 30
  },
  buttonContainer: {
    padding: 10
  },
  imageContainer: {
    backgroundColor: Theme.background.modal
  },
  image: {
    width: 360,
    height: 200,
    resizeMode: 'cover'
  }
});
