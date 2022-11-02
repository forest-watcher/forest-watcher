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
    marginBottom: 1,
    paddingVertical: 18
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
    color: Theme.fontColors.secondary,
    marginLeft: Theme.margin.left,
    marginRight: 16,
    lineHeight: 24
  },

  imageList: {
    width: 48,
    height: 48,
    marginHorizontal: 30
  },

  nextIcon: {
    marginRight: 24,
    ...Theme.icon
  }
});
