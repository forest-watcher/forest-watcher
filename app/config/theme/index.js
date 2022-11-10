import { Dimensions, Platform } from 'react-native';

const backIcon = require('assets/backButton.png');

const screen = Dimensions.get('window');
export const isSmallScreen = screen.width <= 320;

const colors = {
  turtleGreen: '#97be43',
  greyishBrown: '#555555',
  grey: '#8a8a8a',
  veryLightPink: '#f2f2f2',
  white: '#ffffff',
  black: '#000000',
  veryLightPinkTwo: '#dcdcdc',
  carnation: '#f15656',
  coral: '#f74848',
  glad: '#ff6699',
  viirs: '#ED4602',
  lightBlue: '#ACC6D5',
  blue: '#2e8dc7',
  purple: '#5e4fc3',
  cyan: '#52d0c4'
};

const fontColors = {
  main: colors.turtleGreen,
  secondary: colors.greyishBrown,
  light: colors.grey,
  white: colors.white
};

const fontName = Platform.select({
  ios: 'firasansot',
  android: 'firasansot_regular'
});

const config = {
  screen: {
    width: screen.width,
    height: screen.height
  },
  colors: {
    turtleGreen: colors.turtleGreen,
    greyishBrown: colors.greyishBrown,
    grey: colors.grey,
    veryLightPink: colors.veryLightPink,
    white: colors.white,
    black: colors.black,
    veryLightPinkTwo: colors.veryLightPinkTwo,
    carnation: colors.carnation,
    glad: colors.glad,
    viirs: colors.viirs,
    lightBlue: colors.lightBlue,
    blue: colors.blue,
    coral: colors.coral,
    report: colors.turtleGreen,
    importedReport: colors.cyan,
    viirsReported: colors.purple
  },
  font: fontName,
  fontColors: fontColors,
  background: {
    main: colors.veryLightPink,
    secondary: colors.turtleGreen,
    white: colors.white,
    gray: colors.veryLightPinkTwo,
    red: colors.carnation,
    modal: 'rgba(0, 0, 0, 0.4)'
  },
  borderColors: {
    main: colors.veryLightPinkTwo,
    secondary: colors.turtleGreen
  },
  margin: {
    left: 24,
    right: 16
  },
  socialNetworks: {
    apple: '#000000',
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
    stroke: colors.turtleGreen,
    strokeWidth: 3,
    strokeSelected: colors.white
  },
  modalContainer: {
    flexShrink: 1,
    backgroundColor: colors.veryLightPink,
    borderRadius: 7,
    marginHorizontal: 8,
    marginVertical: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: colors.greyishBrown,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: -3
    },
    shadowOpacity: 0.1
  },
  navigationAnimations: {
    fadeModal: {
      dismissModal: {
        alpha: {
          from: 1,
          to: 0,
          duration: 300
        }
      },
      showModal: {
        alpha: {
          from: 0,
          to: 1,
          duration: 300
        }
      }
    }
  },
  navigator: {
    styles: {
      layout: {
        backgroundColor: colors.veryLightPink,
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
          color: colors.greyishBrown,
          icon: backIcon,
          title: ''
        },
        buttonColor: colors.turtleGreen,
        elevation: 0,
        noBorder: true,
        subtitle: {
          color: colors.turtleGreen
        },
        scrollEdgeAppearance: {
          noBorder: true
        },
        title: {
          color: fontColors.secondary,
          fontFamily: fontName,
          fontSize: 20
        },
        largeTitle: {
          fontSize: 24,
          color: fontColors.secondary,
          fontFamily: fontName
        },
        visible: true
      }
    }
  },
  link: {
    color: colors.turtleGreen
  },
  linkSecondary: {
    color: colors.grey
  },
  sectionHeaderText: {
    marginLeft: 16,
    marginBottom: 8,
    fontSize: 17,
    color: fontColors.secondary,
    fontFamily: fontName,
    fontWeight: '400'
  },
  text: {
    fontWeight: '400',
    fontSize: 17,
    fontFamily: fontName,
    color: fontColors.secondary
  },
  tableRow: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.veryLightPinkTwo,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: isSmallScreen ? 12 : 24,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  tableRowText: {
    fontWeight: '400',
    fontSize: 17,
    fontFamily: fontName,
    color: fontColors.secondary
  }
};

export default config;
