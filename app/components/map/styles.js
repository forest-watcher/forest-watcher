import Theme from 'config/theme';
import {
  Platform,
  StyleSheet,
  Dimensions
} from 'react-native';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
function wp(percentage) {
  const value = (percentage * viewportWidth) / 100;
  return Math.round(value);
}
const slideHeight = viewportHeight * 0.1;
const slideWidth = wp(75);
const itemHorizontalMargin = wp(2);

export const sliderWidth = viewportWidth;
const horizontalMargin = itemHorizontalMargin * 2;
export const itemWidth = slideWidth + horizontalMargin;

const entryBorderRadius = 8;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEAE2'
  },
  map: {
    flex: 1
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    left: 0,
    right: 0,
    top: 0,
    height: 104,
    zIndex: 1,
    position: 'absolute',
    backgroundColor: 'transparent'
  },
  headerBg: {
    width: Theme.screen.width,
    height: 104,
    resizeMode: 'stretch',
    position: 'absolute',
    zIndex: 1,
    top: 0
  },
  headerTitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 21,
    fontWeight: '400',
    position: 'absolute',
    zIndex: 2,
    top: 16,
    left: 56,
    ...Platform.select({
      ios: {
        marginTop: 24
      }
    })
  },
  headerSubtitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 16,
    fontWeight: '400',
    position: 'absolute',
    zIndex: 2,
    top: 46,
    left: 56,
    ...Platform.select({
      ios: {
        marginTop: 24
      }
    })
  },
  headerBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    ...Platform.select({
      ios: {
        marginTop: 24
      }
    })
  },
  signalNotice: {
    marginTop: 40,
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  signalNoticeText: {
    fontWeight: '400',
    fontStyle: 'italic',
    fontFamily: Theme.font,
    fontSize: 17,
    color: Theme.fontColors.white,
    marginLeft: 16,
    backgroundColor: 'transparent'
  },
  geoLocationContainer: {
    width: 48,
    height: 48,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  geoLocation: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.color7,
    opacity: 0.5,
    position: 'absolute',
    zIndex: 1,
    top: 0
  },
  marker: {
    width: 18,
    height: 19,
    zIndex: 2,
    resizeMode: 'contain'
  },
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    height: 164,
    zIndex: 3,
    position: 'absolute'
  },
  footerBg: {
    width: Theme.screen.width,
    height: 104,
    resizeMode: 'stretch',
    position: 'absolute',
    bottom: 0,
    transform: [{ rotate: '180deg' }]
  },
  footerTitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 17,
    fontWeight: '500',
    position: 'absolute',
    zIndex: 2,
    bottom: 40,
    marginLeft: Theme.margin.left,
    opacity: 1,
    backgroundColor: 'transparent'
  },
  footerSubtitle: {
    bottom: 20
  },
  footerButton: {
    left: 8,
    right: 8,
    bottom: 75,
    position: 'absolute',
    zIndex: 2
  },
  slider: {
    flex: 0,
    backgroundColor: 'transparent',
    height: 134
  },
  slideInnerContainer: {
    backgroundColor: 'transparent',
    width: itemWidth,
    height: slideHeight,
    paddingHorizontal: itemHorizontalMargin,
    paddingBottom: 18
  },
  textContainer: {
    justifyContent: 'center',
    paddingTop: 20 - entryBorderRadius,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomLeftRadius: entryBorderRadius,
    borderBottomRightRadius: entryBorderRadius,
    fontSize: 17,
    color: Theme.fontColors.secondary,
    fontFamily: Theme.font,
    fontWeight: '400'
  },
  textContainerSmall: {
    paddingTop: 14 - entryBorderRadius
  },
  carousel: {
    flex: 0,
    backgroundColor: 'transparent',
    height: 134
  },
  slideStyle: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },
  coordinateDistanceText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 14,
    fontWeight: '400',
    marginLeft: 14,
    backgroundColor: 'transparent',
    lineHeight: 13
  },
  currentPosition: {
    paddingTop: 3,
    position: 'relative'
  },
  btnRemoveCurrent: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 0,
    bottom: 0
  },
  btnRemoveCurrentText: {
    fontSize: 18,
    borderTopColor: '#CCCCCC',
    padding: 0
  }
});
