// @flow

import React, { Component, type Node } from 'react';

import { Animated, Dimensions, View, Text } from 'react-native';
import styles, { arrowWidth } from './styles';
import Theme from 'config/theme';

import Svg, { Path } from 'react-native-svg';

type Props = {
  above?: ?boolean,
  offset?: ?number,
  body: ?string,
  children: Array<Node> | Node,
  containerWidth?: ?number,
  margin?: ?number,
  title: ?string,
  visible: ?boolean,
  width?: ?number
};

type Layout = {
  height: number,
  width: number,
  x: number,
  y: number
};

type State = {
  childLayout: ?Layout,
  layout: ?Layout,
  opacity: Animated.Value
};

const DEFAULT_MARGIN = 12;
const DEFAULT_WIDTH = 196;
const SCREEN_WIDTH = Dimensions.get('window').width;

const ARROW_SVG_PATH_UP = 'M0 12 L0 10 C2 10 6 0 8 0 S14 10 16 10 L16 12';
const ARROW_SVG_PATH_DOWN = 'M0 0 L0 2 C2 2 6 12 8 12 S14 2 16 2 L16 0';

export default class Callout extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      childLayout: null,
      layout: null,
      opacity: new Animated.Value(props.visible ? 1 : 0)
    };
  }

  onChildLayout = (event: { nativeEvent: { layout: Layout } }) => {
    this.setState({
      childLayout: event.nativeEvent.layout
    });
  };

  onLayout = (event: { nativeEvent: { layout: Layout } }) => {
    if (event.nativeEvent.layout.height !== this.state.layout?.height) {
      this.setState({
        layout: event.nativeEvent.layout
      });
    }
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    const isVisible = this.props.visible;
    const shouldBeVisible = nextProps.visible;

    if (isVisible && !shouldBeVisible) {
      Animated.timing(this.state.opacity, {
        toValue: 0,
        delay: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }

    if (!isVisible && shouldBeVisible) {
      Animated.timing(this.state.opacity, {
        toValue: 1,
        delay: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }

    return true;
  }

  renderArrow(left: number) {
    return (
      <View
        style={{
          marginLeft: left - arrowWidth,
          marginBottom: this.props.above ? 2 : -2,
          marginTop: this.props.above ? -2 : 2
        }}
      >
        <Svg height="12" width="16">
          <Path
            d={this.props.above ? ARROW_SVG_PATH_DOWN : ARROW_SVG_PATH_UP}
            fill={Theme.colors.turtleGreen}
            stroke={Theme.colors.turtleGreen}
          />
        </Svg>
      </View>
    );
  }

  render() {
    const onlyChild = React.Children.only(this.props.children);
    if (!onlyChild) {
      return this.props.children;
    }
    const LayoutChild = React.cloneElement(onlyChild, {
      onLayout: this.onChildLayout
    });

    const offset = this.props.offset != null ? this.props.offset : 0;
    const containerWidth = this.props.containerWidth != null ? this.props.containerWidth : SCREEN_WIDTH;
    const margin = this.props.margin != null ? this.props.margin : DEFAULT_MARGIN;
    const width = this.props.width != null ? this.props.width : DEFAULT_WIDTH;
    // Callout should remain at left edge of screen until it's attached view's center x is more than half the width
    // of the callout across the screen, then it should move with it to keep the arrow centered until it
    // meets the far end of the screen...
    const childLayout = this.state.childLayout || { x: 0, y: 0, width: 0, height: 0 };
    const childCenterX = childLayout.x + childLayout.width / 2;
    const left = Math.min(Math.max(childCenterX - width / 2, margin), containerWidth - width - margin);

    const arrowLeft = Math.min(Math.max(10 + arrowWidth, childCenterX - left), width - (10 + arrowWidth));
    const top = this.props.above
      ? -((this.state.layout != null ? this.state.layout.height : 0) + offset)
      : childLayout.y + childLayout.height + offset;

    return (
      <React.Fragment>
        {LayoutChild}
        {this.state.childLayout && (
          <Animated.View
            onLayout={this.onLayout}
            style={{
              opacity: this.state.layout != null ? this.state.opacity : 0,
              position: 'absolute',
              top,
              left,
              width,
              flexDirection: this.props.above ? 'column' : 'column-reverse',
              zIndex: 10000
            }}
          >
            <View style={[styles.container, styles.shadow]}>
              <Text style={styles.titleText}>{this.props.title}</Text>
              <Text style={styles.bodyText}>{this.props.body}</Text>
            </View>
            {this.renderArrow(arrowLeft)}
          </Animated.View>
        )}
      </React.Fragment>
    );
  }
}
