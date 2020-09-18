import { Platform, StyleSheet } from 'react-native';

const areaRowContainerMargin = 26;
const areaRowHeight = 130;
export const AREA_ROW_TOTAL_HEIGHT = areaRowContainerMargin + areaRowHeight;

export default StyleSheet.create({
  rowContainer: {
    marginBottom: areaRowContainerMargin
  },
  row: {
    height: Platform.OS === 'android' ? areaRowHeight : undefined // extra 2 for bottomBorder in Row component
  },
  calloutFirstRowContainer: {
    // GFW-459 & GFW-584 - prevent area tooltip bottom from being cut off on android
    marginBottom: 126,
    zIndex: 10000
  },
  calloutSecondRowContainer: {
    // GFW-459 & GFW-584 - prevent area tooltip bottom from being cut off on android
    marginTop: -100,
    marginBottom: 26
  }
});
