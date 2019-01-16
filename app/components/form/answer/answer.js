// @flow
import React from 'react';
import { Text, View, TouchableHighlight, Image } from 'react-native';
import Theme from 'config/theme';
import styles from './styles';

const editIcon = require('assets/edit.png');

type Props = {
  questionId: string,
  question: string,
  answers: Array<any>,
  onEditPress?: () => void,
  readOnly: boolean
};

const Answer = (props: Props) => (
  <View style={styles.container}>
    <View style={styles.question}>
      <Text style={styles.questionText}>{props.question}</Text>
    </View>
    <View style={styles.answersContainer}>
      <View style={styles.answers}>
        {props.answers &&
          props.answers.map((answer, i) => (
            <Text style={styles.answer} key={`${props.questionId}${i}`}>
              {answer}
            </Text>
          ))}
      </View>
      {!props.readOnly && (
        <TouchableHighlight activeOpacity={0.5} underlayColor="transparent" onPress={props.onEditPress}>
          <Image style={Theme.icon} source={editIcon} />
        </TouchableHighlight>
      )}
    </View>
  </View>
);

export default Answer;
