// @flow

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import Theme, { isSmallScreen } from 'config/theme';
import styles from './styles';

import type { Route } from 'types/routes.types';

import { routeSVGProperties } from 'helpers/routeSVG';

import Svg, { Path, Circle } from 'react-native-svg';

type Props = {
  route: Route,
  size: number
};

export default class RoutePath extends PureComponent<Props> {
  render() {
    const { route, size } = this.props;
    const svgProperties = routeSVGProperties(route.locations, size - 36);

    if (!svgProperties) {
      return null;
    }

    return (
      <View style={styles.container}>
        <Svg
          style={{ bacgkroundColor: 'red' }}
          height={`${size - 36}`}
          width={`${size - 36}`}
          viewBox={`-16 -16 ${size} ${size}`}
        >
          <Path
            d={svgProperties?.path}
            strokeLinejoin={'round'}
            fill={'transparent'}
            stroke={Theme.colors.white}
            strokeWidth="7"
          />
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
  }
}
