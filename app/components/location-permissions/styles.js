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
    maxHeight: '90%',
    paddingTop: 24,
    paddingHorizontal: 24
  },
  headerImage: {
    resizeMode: 'contain',
    width: '100%'
  },
  headerImageContainer: {
    alignItems: 'center',
    width: '100%'
  },
  itemContainer: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 16
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
    fontSize: 16,
    lineHeight: 24
  },
  list: {
    marginTop: 16
  },
  listContent: {
    alignItems: 'stretch',
    flexGrow: 1,
    paddingTop: 8
  },
  subtitleText: {
    ...Theme.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4
  },
  titleText: {
    ...Theme.text,
    fontSize: 20,
    marginTop: 24,
    textAlign: 'center'
  }
});
