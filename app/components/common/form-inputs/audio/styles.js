import Theme from 'config/theme';
import { StyleSheet } from 'react-native';
import commonStyles from '../styles';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  question: {
    ...commonStyles.label,
    fontSize: 16,
    marginTop: 28
  },
  recordingBox: {
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 1,
    backgroundColor: Theme.background.white,
    height: 284,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  recordingBoxTitle: {
    fontFamily: Theme.font,
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'center',
    color: Theme.fontColors.secondary
  },
  recordingBoxDescription: {
    fontFamily: Theme.font,
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    color: Theme.fontColors.secondary,
    lineHeight: 16
  },
  recordingBoxFooter: {
    backgroundColor: Theme.colors.offWhite,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 64,
    paddingVertical: 24
  },
  smallRoundButton: {
    borderWidth: 2,
    borderColor: Theme.colors.veryLightPink,
    width: 32,
    height: 32
  },
  deleteIcon: {
    width: 12,
    height: 12
  },
  approveIcon: {
    width: 24,
    height: 24
  },
  bigRoundButton: {
    marginLeft: 60,
    marginRight: 60,
    borderWidth: 2,
    borderColor: Theme.colors.turtleGreenDark,
    width: 48,
    height: 48
  },
  preview: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftBtn: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 24,
    bottom: 24,
    width: 64,
    height: 64
  },
  leftBtnIcon: {
    width: 64,
    height: 64
  },
  captureLabel: {
    alignSelf: 'center',
    fontSize: 21,
    fontWeight: '400',
    fontFamily: Theme.font,
    textAlign: 'center',
    color: Theme.fontColors.light,
    backgroundColor: 'transparent',
    marginBottom: 100
  }
});
