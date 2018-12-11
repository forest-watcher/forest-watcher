import Theme from 'config/theme';
import { StyleSheet } from 'react-native';
import { hexToRgb } from 'helpers/utils';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: 300,
    backgroundColor: Theme.background.main,
    flexDirection: 'column',
    borderLeftColor: Theme.borderColors.main,
    borderLeftWidth: 2
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
