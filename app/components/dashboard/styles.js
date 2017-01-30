import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
    paddingTop: 8
  },
  item: {
    width: (Theme.screen.width / 2) - 12,
    height: 184,
    marginLeft: 8,
    marginBottom: 8,
    backgroundColor: Theme.background.white,
    borderWidth: 1,
    borderColor: Theme.colors.color6
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
  }
});
