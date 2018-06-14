// @flow
import type { Question, Answer } from 'types/reports.types';

import React, { Component } from 'react';
import {
  View,
  TextInput,
  Animated
} from 'react-native';
import debounce from 'lodash/debounce';

import Theme from 'config/theme';

import styles from '../styles';
import detailStyles from './styles';

type State = {
  value: string,
  inputHeight: number
};

type Props = {
  visible: boolean,
  question: Question,
  answer: Answer,
  onChange: (string) => void,
};

class InputTextDetail extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      inputHeight: new Animated.Value(0),
      value: props.answer.value
    };
  }
  height = 64;

  onChange = (value: string) => {
    this.setState({ value });
    this.debouncedChange(value);
  }

  debouncedChange = debounce((value: string) => {
    const { onChange } = this.props;
    onChange(value);
  }, 300)

  componentDidMount() {
    if (this.props.visible) {
      this.setVisibility(this.props.visible);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.visible !== nextProps.visible) {
      this.setVisibility(nextProps.visible);
    }
  }

  setVisibility(visible: boolean) {
    Animated.spring(
      this.state.inputHeight,
      { toValue: visible ? this.height : 0 }
    ).start();
  }


  render() {
    const { visible, question } = this.props;
    return (
      <View style={[detailStyles.inputContainer, visible ? '' : detailStyles.hide]}>
        <View style={[detailStyles.marker, visible ? '' : detailStyles.hide]} >
          <View style={[detailStyles.marker, detailStyles.markerInner]} />
        </View>
        <Animated.View
          style={{ height: this.state.inputHeight }}
        >
          {visible &&
            <TextInput
              autoFocus={!this.state.value}
              autoCorrect={false}
              style={[styles.inputLabel, detailStyles.inputLabel]}
              autoCapitalize="none"
              value={this.state.value}
              onChangeText={this.onChange}
              placeholder={question.label}
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

export default InputTextDetail;
