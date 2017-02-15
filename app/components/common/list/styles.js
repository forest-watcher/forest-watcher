import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    height: 112,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4
  },
  containerImageText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  containerOnlyImage: {
    flex: 1
  },
  containerImage: {
    flex: 1
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#555555',
    marginLeft: 16
  },
  imageList: {
    width: 112,
    height: 112
  },
  nextImage: {
    marginRight: 24
  }
});
