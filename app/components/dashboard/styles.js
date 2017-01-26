import config from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  content: {
    paddingTop: 0,
    paddingBottom: 30
  },
  item: {
    marginTop: 20,
    marginBottom: 0,
    marginLeft: 15,
    marginRight: 15,
    padding: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#333'
  },
  icon: {
    width: 80,
    height: 60,
    borderWidth: 0.5,
    borderColor: '#333'
  },
  title: {
    fontSize: 18,
    fontWeight: '300',
    marginTop: 15,
    marginBottom: 5,
    fontFamily: config.font,
    color: config.fontColors.main
  }
});
