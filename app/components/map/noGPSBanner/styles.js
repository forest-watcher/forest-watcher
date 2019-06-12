import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  noGPSBanner: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 6,
    backgroundColor: '#878787'
  },
  noGPSContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomRightRadius: 6,
    borderTopRightRadius: 6,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
    paddingVertical: 16
  },
  noGPSImage: {
    height: 25,
    width: 25
  },
  noGPSTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start'
  },
  noGPSText: {
    fontWeight: 'normal',
    fontFamily: Theme.font,
    fontSize: 18,
    color: '#373737'
  }
});
