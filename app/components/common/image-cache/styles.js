import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loader: {
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loaderText: {

  },
  image: {
    resizeMode: 'contain'
  },
  spinner: {
    marginLeft: 0
  }
});
