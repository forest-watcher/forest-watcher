// @flow
import type { Question, Answer } from 'types/reports.types';

import React, { Component } from 'react';
import {
  View,
  TextInput,
  Animated
} from 'react-native';

import Theme from 'config/theme';

import styles from '../styles';
import detailStyles from './styles';

type State = {
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
      inputHeight: new Animated.Value(0)
    };
  }
  height = 64;

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
    const { visible, answer, onChange, question } = this.props;
    return (
      <View style={[detailStyles.inputContainer, this.props.visible ? '' : detailStyles.hide]}>
        <View style={[detailStyles.marker, this.props.visible ? '' : detailStyles.hide]} >
          <View style={[detailStyles.marker, detailStyles.markerInner]} />
        </View>
        <Animated.View
          style={{ height: this.state.inputHeight }}
        >
          {visible &&
            <TextInput
              autoFocus={!answer.value}
              autoCorrect={false}
              style={[styles.inputLabel, detailStyles.inputLabel]}
              autoCapitalize="none"
              value={answer.value}
              onChangeText={onChange}
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
