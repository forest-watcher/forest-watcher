import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  inputContainer: {
    flex: 1,
    height: 64,
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    backgroundColor: Theme.background.white,
    marginTop: 8
  },
  input: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
