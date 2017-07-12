import Theme from 'config/theme';
import {
  StyleSheet,
  Dimensions
} from 'react-native';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
function wp(percentage) {
  const value = (percentage * viewportWidth) / 100;
  return Math.round(value);
}
const slideHeight = viewportHeight * 0.1;
const slideWidth = wp(85);
const itemHorizontalMargin = wp(3);

export const sliderWidth = viewportWidth;
const horizontalMargin = wp(2);
export const itemWidth = slideWidth + horizontalMargin;

const entryBorderRadius = 8;

export const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
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
    paddingHorizontal: itemHorizontalMargin
  },
  textContainer: {
    justifyContent: 'center',
    paddingTop: 20 - entryBorderRadius,
    backgroundColor: 'white',
    borderBottomLeftRadius: entryBorderRadius,
    borderBottomRightRadius: entryBorderRadius,
    fontSize: 17,
    color: Theme.fontColors.secondary,
    fontFamily: Theme.font,
    fontWeight: '400',
    marginLeft: Theme.marginLeft * 2
  },
  textContainerSmall: {
    paddingTop: 14 - entryBorderRadius
  },
  slideStyle: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },
  smallCarouselText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 16,
    fontWeight: '400',
    marginLeft: Theme.marginLeft * 2,
    backgroundColor: 'transparent'
  },
  settingsButton: {
    bottom: 10,
    right: 10,
    position: 'absolute'
  },
  footerZIndex: {
    zIndex: 4
  }
});
