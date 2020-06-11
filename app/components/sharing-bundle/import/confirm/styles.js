import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';
import commonStyles from '../styles';

export default StyleSheet.create({
  ...commonStyles,
  bundleContents: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 12,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 12
  },
  bundleName: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 16,
    fontWeight: '400',
    paddingBottom: 12,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  description: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 8,
    ...Theme.tableRowText,
    fontSize: 12
  },
  error: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.colors.coral,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    padding: 20
  },
  row: {
    paddingHorizontal: isSmallScreen ? 20 : 24,
    paddingVertical: isSmallScreen ? 20 : 40
  },
  title: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 16,
    fontWeight: '400'
  }
});
