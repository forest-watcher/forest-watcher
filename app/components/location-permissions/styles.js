import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  bullet: {
    backgroundColor: Theme.colors.turtleGreen,
    borderRadius: 6,
    height: 12,
    marginRight: 12,
    marginTop: 4,
    width: 12
  },
  container: {
    alignItems: 'stretch',
    flexGrow: 1,
    justifyContent: 'center'
  },
  contentContainer: {
    ...Theme.modalContainer,
    alignItems: 'stretch',
    paddingTop: 24
  },
  headerImage: {
    resizeMode: 'contain'
  },
  headerImageContainer: {
    alignItems: 'center'
  },
  itemContainer: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 32
  },
  itemContainerLast: {
    marginBottom: 92
  },
  itemContentContainer: {
    flex: 1
  },
  itemIcon: {
    marginRight: 18
  },
  itemText: {
    ...Theme.text,
    flexShrink: 1,
    fontSize: 16
  },
  list: {
    marginVertical: 12
  },
  listContent: {
    alignItems: 'stretch',
    flexGrow: 1,
    paddingTop: 28
  },
  subtitleText: {
    ...Theme.text,
    fontSize: 16,
    textAlign: 'center'
  },
  titleText: {
    ...Theme.text,
    fontSize: 20,
    marginTop: 24,
    textAlign: 'center'
  }
});
