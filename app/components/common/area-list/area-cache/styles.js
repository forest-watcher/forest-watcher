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
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1,
    backgroundColor: 'transparent'
  },
  cacheTooltip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.background.main,
    paddingHorizontal: 18,
    height: 48,
    marginLeft: 6
  },
  cacheTooltipArrow: {
    position: 'absolute',
    left: -5,
    height: 10,
    width: 10,
    backgroundColor: Theme.background.main,
    transform: [{ rotate: '45deg' }],
    marginLeft: 6
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
