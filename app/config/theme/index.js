import { Dimensions, Platform } from 'react-native';

const screen = Dimensions.get('window');
export const colors = {
  color1: '#97be32',
  color2: '#555555',
  color3: '#8a8a8a',
  color4: '#f2f2f2',
  color5: '#ffffff',
  color6: '#dcdcdc',
  color7: '#f15656',
  colorGlad: '#ff6699',
  colorViirs: '#ED4602',
  colorRecent: '#e9bd15'
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
    color7: colors.color7,
    colorGlad: colors.colorGlad,
    colorViirs: colors.colorViirs,
    colorRecent: colors.colorRecent
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
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'contain'
  },
  largeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'contain'
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
      layout: {
        backgroundColor: colors.color4,
        orientation: 'portrait'
      },
      sideMenu: {
        right: {
          enabled: false,
          ...Platform.select({
            ios: {
              width: 300
            }
          })
        }
      },
      statusBar: {
        style: 'light'
      },
      topBar: {
        background: {
          color: 'transparent'
        },
        backButton: {
          color: colors.color1
        },
        buttonColor: colors.color1,
        elevation: 0,
        noBorder: true,
        subtitle: {
          color: colors.color1
        },
        title: {
          color: colors.color1
        },
        visible: true
      }
    }
  },
  link: {
    color: colors.color1
  },
  linkSecondary: {
    color: colors.color3
  }
};

export default config;
