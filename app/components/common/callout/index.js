import React, { Component } from 'react';

import { Dimensions, View, Text } from 'react-native';
import styles, { arrowWidth } from './styles';
import { withSafeArea } from 'react-native-safe-area';
import Theme from 'config/theme';

import Svg, { Path } from 'react-native-svg';

const SafeAreaView = withSafeArea(View, 'margin', 'bottom');

type Props = {
  above?: boolean,
  containerWidth?: number,
  margin?: number,
  width?: number
};

const DEFAULT_MARGIN = 12;
const SCREEN_WIDTH = Dimensions.get('window').width;

const ARROW_SVG_PATH_UP = "M0 12 L0 10 C2 10 6 0 8 0 S14 10 16 10 L16 12";
const ARROW_SVG_PATH_DOWN = "M0 0 L0 2 C2 2 6 12 8 12 S14 2 16 2 L16 0"

export default class Callout extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      childLayout: null,
      layout: null
    }
  }

  onChildLayout = (event) => {
    this.setState({
      childLayout: event.nativeEvent.layout
    });
  };

  onLayout = (event) => {
    if (event.nativeEvent.layout.height !== this.state.layout?.height) {
      this.setState({
        layout: event.nativeEvent.layout
      });
    }
  }

  renderArrow(left: number) {
    return (
      <View 
        style={{
          marginLeft: left - arrowWidth,
          marginBottom: this.props.above ? 2 : -2,
          marginTop: this.props.above ? -2 : 2,
        }}
      > 
        <Svg style={{bacgkroundColor: 'red'}} height="12" width="16">
          <Path
            d={this.props.above ? ARROW_SVG_PATH_DOWN : ARROW_SVG_PATH_UP}
            fill={Theme.colors.turtleGreen}
            stroke={Theme.colors.turtleGreen}
          />
        </Svg>
      </View>
    )
  }

  render() {

    const onlyChild = React.Children.only(this.props.children);
    if (!onlyChild) {
      return this.props.children;
    }
    let LayoutChild = React.cloneElement(
      onlyChild,
      {
        onLayout: this.onChildLayout
      }
    )

    const containerWidth = this.props.containerWidth != null ? this.props.containerWidth : SCREEN_WIDTH;
    const margin = this.props.margin != null ? this.props.margin : DEFAULT_MARGIN;
    const width = this.props.width != null ? this.props.width : 196;
    // Callout should remain at left edge of screen until it's attached view's center x is more than half the width
    // of the callout across the screen, then it should move with it to keep the arrow centered until it 
    // meets the far end of the screen...
    const childLayout = this.state.childLayout || {x: 0, y: 0, width: 0, height: 0};
    const childCenterX = childLayout.x + childLayout.width/2;
    const left = Math.min(Math.max((childCenterX - width/2), margin), containerWidth - width - margin);

    const arrowLeft = Math.min(Math.max(10+arrowWidth, childCenterX - left), width - (10+arrowWidth));
    const top = this.props.above ? -(this.state.layout != null ? this.state.layout.height : 0) : this.state.childLayout.y + this.state.childLayout.height;

    return (
      <View style={{zIndex: 10000}}>
        {LayoutChild}
        {this.state.childLayout && (
          <View
            onLayout={this.onLayout}
            style={{
              opacity: this.state.layout != null ? 1 : 0,
              position: 'absolute',
              top,
              left,
              width,
              flexDirection: this.props.above ? 'column' : 'column-reverse'
            }}
          >
            <View 
              style={[
                styles.container,
                styles.shadow,
                this.props.style
              ]}
            >
              <Text>Hello Callout!</Text>
              <Text>{`x: ${this.state.childLayout.x}, y: ${this.state.childLayout.y}, width: ${this.state.childLayout.width}, height: ${this.state.childLayout.height}`}</Text>
            </View>
            {this.renderArrow(arrowLeft)}
          </View>
        )}
      </View>
    );
  }
}