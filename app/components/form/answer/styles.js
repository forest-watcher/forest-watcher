import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    width: Theme.screen.width,
    backgroundColor: Theme.background.white,
    marginBottom: 8
  },
  question: {
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 1,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right
  },
  questionText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17
  },
  answersContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    paddingTop: 16,
    paddingBottom: 16
  },
  answers: {
    flexBasis: 242
  },
  answer: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17
  }
});
