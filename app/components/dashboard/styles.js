import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  backgroundHack: {
    position: 'absolute',
    top: -64,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: Theme.background.main
  },
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  list: {
    flex: 1
  },
  content: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingTop: 18
  },
  item: {
    width: (Theme.screen.width / 2) - 12,
    height: 184,
    marginLeft: 8,
    marginBottom: 22,
    backgroundColor: Theme.background.white,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2
  },
  imageIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  buttonRound: {
    width: Theme.screen.width - 24,
    backgroundColor: Theme.colors.color3,
    height: 48,
    marginBottom: 8,
    borderRadius: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: 12,
    marginTop: 8
  },
  buttonTextRound: {
    color: Theme.background.white,
    marginLeft: 24
  },
  icon: {
    width: 80,
    height: 60,
    borderWidth: 0.5,
    borderColor: '#333'
  },
  title: {
    fontSize: 18,
    fontWeight: '400',
    marginTop: 15,
    marginBottom: 5,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary
  },
  iconSettings: {
    position: 'absolute',
    top: 0,
    right: 0
  }
});
