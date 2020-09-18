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
    height: 256
  },
  center: {
    justifyContent: 'center'
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    width: 2
  },
  textContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    color: Theme.colors.turtleGreen,
    fontSize: 21,
    textAlign: 'center',
    marginTop: 66
  },
  subtitle: {
    color: Theme.colors.grey,
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
    alignSelf: 'stretch',
    marginHorizontal: 16
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
