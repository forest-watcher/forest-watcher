import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  inputContainer: {
    height: 64,
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 0
    },
    backgroundColor: Theme.background.white,
    elevation: 6,
    marginBottom: 8
  },
  inputLabel: {
    flex: 1,
    color: Theme.fontColors.light,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400'
  }
});
