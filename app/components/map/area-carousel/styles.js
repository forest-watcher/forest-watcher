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
  settingsButton: {
    bottom: 10,
    right: 10,
    position: 'absolute'
  }
});
