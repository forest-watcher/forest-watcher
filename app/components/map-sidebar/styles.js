import Theme from 'config/theme';
import { StyleSheet } from 'react-native';
import { hexToRgb } from 'helpers/utils';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    marginTop: 16,
    marginBottom: 0
  },
  heading: {
    fontSize: 21,
    color: Theme.fontColors.main,
    fontFamily: Theme.font
  },
  body: {
    marginTop: 40
  },
  legendContainer: {
    marginBottom: 32
  },
  contextualLayersTitle: {
    fontSize: 16,
    color: Theme.fontColors.light,
    fontFamily: Theme.font,
    marginLeft: Theme.margin.left,
    marginBottom: 8
  },
  alertContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertLegend: {
    width: 24,
    height: 24,
    backgroundColor: `rgba(${hexToRgb(Theme.colors.color1)}, 0.8)`,
    marginRight: 16
  },
  alertLegendRecent: {
    backgroundColor: `rgba(${hexToRgb(Theme.colors.colorRecent)}, 0.8)`
  },
  sidebarLabel: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17
  }
});
