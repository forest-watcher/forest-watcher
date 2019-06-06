import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  headingText: {
    flex: 1,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '500',
    marginVertical: 10
  },
  container: {
    flex: 1,
    paddingHorizontal: 48
  },
  picker: {
    borderRadius: 8,
    backgroundColor: '#fdfdfd',
    overflow: 'hidden'
  },
  containerCenter: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonPos: {
    position: 'absolute',
    bottom: 52,
    left: 8,
    right: 8
  },
  buttonNextPos: {
    position: 'absolute',
    bottom: 52,
    right: 8
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
  actionButton: {
    marginVertical: 8,
    marginHorizontal: 32
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
