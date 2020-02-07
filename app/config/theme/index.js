import { Dimensions, Platform } from 'react-native';

const screen = Dimensions.get('window');
export const colors = {
  turtleGreen: '#97be43',
  greyishBrown: '#555555',
  grey: '#8a8a8a',
  veryLightPink: '#f2f2f2',
  white: '#ffffff',
  veryLightPinkTwo: '#dcdcdc',
  carnation: '#f15656',
  glad: '#ff6699',
  viirs: '#ED4602',
  recent: '#e9bd15',
  lightBlue: '#ACC6D5'
};

const fontColors = {
  main: colors.turtleGreen,
  secondary: colors.greyishBrown,
  light: colors.grey,
  white: colors.white
};

const fontName = 'firasansot';

const fontColors = {
  main: colors.color1,
  secondary: colors.color2,
  light: colors.color3,
  white: colors.color5
};

const fontName = 'firasansot';

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
    veryLightPinkTwo: colors.veryLightPinkTwo,
    carnation: colors.carnation,
    glad: colors.glad,
    viirs: colors.viirs,
    recent: colors.recent,
    lightBlue: colors.lightBlue
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
    strokeWidth: 3,
    strokeSelected: '#FFFFFF'
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
          color: colors.turtleGreen
        },
        buttonColor: colors.turtleGreen,
        elevation: 0,
        noBorder: true,
        subtitle: {
          color: colors.turtleGreen
        },
        title: {
          color: fontColors.secondary,
          fontFamily: fontName,
          fontWeight: 'regular'
        },
        largeTitle: {
          fontSize: 32,
          color: fontColors.secondary,
          fontFamily: fontName,
          fontWeight: 'regular'
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
  tableRow: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.veryLightPinkTwo,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 25,
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
