import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    minHeight: 64,
    maxHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 2
  },

  containerBigSeparation: {
    marginBottom: 8
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

  text: {
    flex: 1,
    fontSize: 16,
    color: Theme.color2,
    marginLeft: Theme.margin.left
  },

  imageList: {
    width: 120,
    height: 120
  },

  nextIcon: {
    width: 8,
    height: 16,
    marginRight: 24
  }
});
