import { StyleSheet } from 'react-native';
import Theme from '../../../config/theme';

export default StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f6f6f6',
    zIndex: 10
  },
  navRowContainer: {
    height: 57,
    backgroundColor: '#d8d8d8'
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  navRowText: {
    color: '#000000',
    fontFamily: Theme.font,
    fontWeight: '500',
    fontSize: 15
  },
  bodyContainer: {
    paddingVertical: 16
  },
  closeIconContainer: {
    marginRight: 16,
    width: 24,
    height: 24
  },
  closeIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain'
  },
  actionButton: {
    marginVertical: 8,
    marginHorizontal: 32
  }
});
