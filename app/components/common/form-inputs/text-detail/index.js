import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
  visible: PropTypes.bool.isRequired,
  question: PropTypes.shape({
    label: PropTypes.string,
    defaultValue: PropTypes.string
  }).isRequired,
  input: PropTypes.shape({
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired
  }).isRequired
};

export default InputTextDetail;
