import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  ScrollView
} from 'react-native';
import Theme from 'config/theme';
import I18n from 'locales';

import ActionButton from 'components/common/action-button';
import Answer from 'components/common/form/answer/answer';
import ImageCarousel from 'components/common/image-carousel';
import withDraft from './withDraft';
import styles from './styles';

const deleteIcon = require('assets/delete_red.png');

class Answers extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        question: PropTypes.object,
        answers: PropTypes.array
      })
    ),
    form: PropTypes.string.isRequired,
    finish: PropTypes.func,
    readOnly: PropTypes.bool,
    removeAnswer: PropTypes.func.isRequired,
    removeAllAnswers: PropTypes.func.isRequired
  };

  onPressSave = () => {
    const { form, finish, navigator } = this.props;
    finish(form);
    navigator.popToRoot({ animate: true });
  }

  onEdit = (index) => {
    const { navigator, form } = this.props;
    const screen = 'ForestWatcher.NewReport';
    const disableDraft = false;
    navigator.showModal({
      screen,
      backButtonHidden: true,
      passProps: {
        form,
        title: 'Report',
        screen,
        step: index,
        disableDraft,
        editMode: true
      }
    });
  }

  /* eslint-disable no-unused-vars */
  onDeleteImage = (id, name, images) => {
    const { form, removeAnswer, removeAllAnswers } = this.props;
    // TODO: when multiple pictures is implemented this will suffice to remove the selected image
    // TODO: to implement multiple images, the input value needs to be an array of image uri.
    // const index = images.findIndex(image => image.id === id);
    // removeAnswer(form, name, index);
    removeAllAnswers(form, name);
    const image = images.find(i => i.id === id);
    if (image.required) this.onEdit(image.questionNumber);
  }
  /* eslint-enable no-unused-vars */

  render() {
    const { results, readOnly } = this.props;
    const regularAnswers = results.filter(({ question }) => question.type !== 'blob');
    const images = results.filter(({ question }) => question.type === 'blob')
      .map(image => ({
        id: image.question.Id,
        uri: image.answers[0],
        name: image.question.name,
        questionNumber: image.question.questionNumber,
        required: image.question.required
      }));
    const imageActions = !readOnly ? [{
      callback: (id, name) => this.onDeleteImage(id, name, images),
      icon: deleteIcon
    }] : null;
    return (
      <View style={styles.answersContainer}>
        <ScrollView>
          {
            regularAnswers.map((result) => (
              <Answer
                id={result.question.Id}
                key={result.question.Id}
                answers={result.answers}
                question={result.question.label}
                onEditPress={() => this.onEdit(result.question.questionNumber)}
                readOnly={readOnly}
              />
            ))
          }
          {images.length > 0 &&
            <View style={styles.picturesContainer}>
              <Text style={styles.answersText}>{I18n.t('report.pictures')}</Text>
              <ImageCarousel
                images={images}
                actions={imageActions}
                add={this.onEdit}
                readOnly={readOnly}
              />
            </View>
          }
          {!readOnly &&
          <View style={styles.buttonSaveContainer}>
            <ActionButton
              onPress={this.onPressSave}
              text={I18n.t('commonText.save')}
            />
          </View>
          }
        </ScrollView>
      </View>
    );
  }
}

export default withDraft(Answers);
