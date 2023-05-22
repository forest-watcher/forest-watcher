import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  containerContent: {
    paddingBottom: 20,
    flex: 1
  },
  label: {
    color: Theme.fontColors.secondary,
    fontFamily: Theme.font,
    fontSize: 21,
    fontWeight: '400',
    marginTop: 18,
    marginRight: 72,
    marginBottom: 18,
    marginLeft: Theme.margin.left
  },
  inputContainer: {
    height: 64,
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 1,
    backgroundColor: Theme.background.white,
    marginTop: 8
  },
  checkboxInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    color: Theme.fontColors.light,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400'
  },
  inputLabel: {
    flex: 1,
    color: Theme.fontColors.light,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400'
  }
});
