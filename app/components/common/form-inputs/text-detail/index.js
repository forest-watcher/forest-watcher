import React, { Component } from 'react';
import {
  View,
  TextInput,
  Animated
} from 'react-native';

import Theme from 'config/theme';

import styles from '../styles';
import detailStyles from './styles';

class InputTextDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputHeight: new Animated.Value(0)
    };
    this.height = 64;
  }

  componentDidMount() {
    if (this.props.visible) {
      this.setVisibility(this.props.visible);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible) {
      this.setVisibility(nextProps.visible);
    }
  }

  setVisibility(visible) {
    Animated.spring(
      this.state.inputHeight,
      { toValue: visible ? this.height : 0 }
    ).start();
  }


  render() {
    return (
      <View style={[detailStyles.inputContainer, this.props.visible ? '' : detailStyles.hide]}>
        <View style={[detailStyles.marker, this.props.visible ? '' : detailStyles.hide]} >
          <View style={[detailStyles.marker, detailStyles.markerInner]} />
        </View>
        <Animated.View
          style={{ height: this.state.inputHeight }}
        >
          {this.props.visible &&
            <TextInput
              autoFocus={false}
              autoCorrect={false}
              style={[styles.inputLabel, detailStyles.inputLabel]}
              autoCapitalize="none"
              value={this.props.input.value}
              onChangeText={this.props.input.onChange}
              placeholder={this.props.question.defaultValue}
              underlineColorAndroid="transparent"
              selectionColor={Theme.colors.color1}
              placeholderTextColor={Theme.fontColors.light}
            />
          }
        </Animated.View>
      </View>
    );
  }
}

InputTextDetail.propTypes = {
  visible: React.PropTypes.bool.isRequired,
  question: React.PropTypes.shape({
    label: React.PropTypes.string,
    defaultValue: React.PropTypes.string
  }).isRequired,
  input: React.PropTypes.shape({
    onBlur: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onFocus: React.PropTypes.func.isRequired,
    value: React.PropTypes.any.isRequired
  }).isRequired,
  meta: React.PropTypes.shape({
    active: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string,
    invalid: React.PropTypes.bool.isRequired,
    pristine: React.PropTypes.bool.isRequired,
    visited: React.PropTypes.bool.isRequired
  }).isRequired
};

export default InputTextDetail;
