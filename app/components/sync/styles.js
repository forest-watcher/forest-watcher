import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.background.main,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  animation: {
    position: 'absolute'
  },
  center: {
    justifyContent: 'center'
  },
  textContainer: {
    flex: 1,
    paddingTop: 250,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    color: Theme.colors.color1,
    fontSize: 21,
    textAlign: 'center',
    marginTop: 66
  },
  subtitle: {
    color: Theme.colors.color3,
    marginTop: 18,
    marginBottom: 25,
    maxWidth: 300,
    textAlign: 'center'
  },
  buttonGroupContainer: {
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 8,
    marginLeft: 8
  },
  button: {
    left: 8,
    right: 8,
    position: 'absolute'
  },
  groupButton: {
    flex: 1
  },
  groupButtonLeft: {
    marginRight: 4
  },
  groupButtonRight: {
    marginLeft: 4
  }
});
