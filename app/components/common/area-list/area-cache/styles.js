import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  cacheBtnContainer: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  cacheTooltipContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  cacheTooltip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.background.main,
    paddingHorizontal: 18,
    height: 48
  },
  cacheTooltipArrow: {
    position: 'absolute',
    left: -8,
    height: 16,
    width: 16,
    backgroundColor: Theme.background.main,
    transform: [{ rotate: '45deg' }]
  },
  cacheTooltipText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontWeight: '400'
  },
  cacheBtn: {
    width: 64,
    height: 64,
    backgroundColor: Theme.background.secondary,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0
  }
});
