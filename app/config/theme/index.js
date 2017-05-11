import {
  Dimensions
} from 'react-native';

const screen = Dimensions.get('window');
const colors = {
  color1: '#97be32',
  color2: '#555555',
  color3: '#8a8a8a',
  color4: '#f2f2f2',
  color5: '#ffffff',
  color6: '#dcdcdc',
  color7: '#f15656'
};

const config = {
  screen: {
    width: screen.width,
    height: screen.height
  },
  colors: {
    color1: colors.color1,
    color2: colors.color2,
    color3: colors.color3,
    color4: colors.color4,
    color5: colors.color5,
    color6: colors.color6,
    color7: colors.color7
  },
  font: 'firasansot',
  fontColors: {
    main: colors.color1,
    secondary: colors.color2,
    light: colors.color3,
    white: colors.color5
  },
  background: {
    main: colors.color4,
    secondary: colors.color1,
    white: colors.color5,
    gray: colors.color6,
    red: colors.color7,
    modal: 'rgba(0, 0, 0, 0.4)'
  },
  borderColors: {
    main: colors.color6,
    secondary: colors.color1
  },
  margin: {
    left: 24,
    right: 16
  },
  socialNetworks: {
    facebook: '#3b5998',
    twitter: '#00aced',
    google: '#ea4335'
  },
  icon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'center'
  },
  polygon: {
    fill: 'rgba(151, 190, 49, 0.5)',
    fillSelected: 'rgba(255, 255, 255, 0.5)',
    fillInvalid: 'rgba(241, 86, 86, 0.5)',
    stroke: '#97be32',
    strokeWidth: 2,
    strokeSelected: '#FFFFFF'
  },
  navigator: {
    styles: {
      navBarBackgroundColor: '#426F9A',
      navBarTextColor: '#ffffff',
      navBarSubtitleTextColor: '#ffffff',
      navBarButtonColor: '#ffffff',
      statusBarTextColorScheme: 'light'
    }
  }
};

export default config;
