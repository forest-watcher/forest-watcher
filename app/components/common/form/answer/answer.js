import React from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  TouchableHighlight,
  Image
} from 'react-native';
import Theme from 'config/theme';
import styles from './styles';

const editIcon = require('assets/edit.png');

const Answer = (props) => (
  <View style={styles.container}>
    <View style={styles.question}>
      <Text style={styles.questionText}>{props.question}</Text>
    </View>
    <View style={styles.answersContainer}>
      <View style={styles.answers}>
        {props.answers.map((answer, i) => (<Text style={styles.answer} key={`${props.questionId}${i}`}>{answer}</Text>))}
      </View>
      {!props.readOnly &&
        <TouchableHighlight
          activeOpacity={0.5}
          underlayColor="transparent"
          onPress={props.onEditPress}
        >
          <Image style={Theme.icon} source={editIcon} />
        </TouchableHighlight>
      }
    </View>
  </View>
);

Answer.propTypes = {
  questionId: PropTypes.string,
  question: PropTypes.string.isRequired,
  answers: PropTypes.arrayOf(PropTypes.string).isRequired,
  onEditPress: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
};

export default Answer;
