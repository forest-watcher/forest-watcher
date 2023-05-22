import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  containerCenter: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonPos: {
    height: 48,
    flexGrow: 0,
    marginBottom: 52,
    marginHorizontal: 8,
    marginTop: 10
  },
  buttonNextPos: {
    position: 'absolute',
    bottom: 24,
    right: 24
  },
  answersContainer: {
    backgroundColor: Theme.background.main,
    flex: 1,
    paddingTop: 8
  },
  answersText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    paddingLeft: Theme.margin.left
  },
  picturesContainer: {
    paddingTop: 16,
    paddingBottom: 16
  },
  buttonsContainer: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 16,
    paddingBottom: 32
  },
  actionBtn: {
    marginTop: 8,
    marginBottom: 8
  },
  listContainer: {
    marginTop: 24,
    marginBottom: 8
  },
  listContainerFirst: {
    marginTop: 0
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    marginLeft: Theme.margin.left,
    marginRight: 18,
    marginBottom: 8
  }
});
