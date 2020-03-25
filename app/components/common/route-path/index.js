// @flow

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

import type { Route } from 'types/routes.types';

import { routeSVGProperties } from 'helpers/routeSVG';

import { isSmallScreen } from 'config/theme';

import Svg, { Path, Circle } from 'react-native-svg';

const RoutePreviewSize = isSmallScreen ? 64 : 100

type Props = {
  route: Route,
};

export default class RoutePath extends PureComponent<Props> {

  render() {
  	const { route } = this.props;
    const svgProperties = routeSVGProperties(route.locations, RoutePreviewSize);

    if (!svgProperties) {
      return null;
    }

    return (
      <View style={styles.container}>
        <Svg style={{ bacgkroundColor: 'red' }} height={`${RoutePreviewSize}`} width={`${RoutePreviewSize}`} viewBox={`-16 -16 ${RoutePreviewSize + 36} ${RoutePreviewSize + 36}`}>
          <Path d={svgProperties?.path} strokeLinejoin={'round'} fill={'transparent'} stroke={Theme.colors.white} strokeWidth="7" />
          {svgProperties.firstPoint && (
            <React.Fragment>
              <Circle
                cx={svgProperties.firstPoint.x}
                cy={svgProperties.firstPoint.y}
                r="14"
                strokeWidth="4"
                stroke={'rgba(0, 0, 0, 0.06)'}
                fill={'transparent'}
              />
              <Circle
                cx={svgProperties.firstPoint.x}
                cy={svgProperties.firstPoint.y}
                r="8"
                strokeWidth="8"
                stroke={Theme.colors.white}
                fill={'rgba(220, 220, 220, 1)'}
              />
            </React.Fragment>
          )}
          {svgProperties.lastPoint && (
            <React.Fragment>
              <Circle
                cx={svgProperties.lastPoint.x}
                cy={svgProperties.lastPoint.y}
                r="14"
                strokeWidth="4"
                stroke={'rgba(0, 0, 0, 0.06)'}
                fill={'transparent'}
              />
              <Circle
                cx={svgProperties.lastPoint.x}
                cy={svgProperties.lastPoint.y}
                r="8"
                strokeWidth="8"
                stroke={Theme.colors.white}
                fill={'rgba(220, 220, 220, 1)'}
              />
            </React.Fragment>
          )}
        </Svg>
      </View>
    );
  };
}