import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Alert
} from 'react-native';
import Theme from 'config/theme';
import CONSTANTS from 'config/constants';
import I18n from 'locales';

import ActionButton from 'components/common/action-button';
import Answer from 'components/common/form/answer/answer';
import styles from './styles';

const saveReportIcon = require('assets/save_for_later.png');

class Answers extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static propTypes = {
    navigator: React.PropTypes.object.isRequired,
    results: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        question: React.PropTypes.object,
        answers: React.PropTypes.array
      })
    ),
    enableDraft: React.PropTypes.bool.isRequired,
    saveReport: React.PropTypes.func.isRequired,
    form: React.PropTypes.string.isRequired,
    finish: React.PropTypes.func.isRequired
  };

  static defaultProps = {
    enableDraft: true
  };

  constructor(props) {
    super(props);
    if (this.props.enableDraft) {
      this.props.navigator.setButtons({
        rightButtons: [
          {
            icon: saveReportIcon,
            id: 'draft'
          }
        ]
      });
      this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
    }
  }

  onPressDraft = () => {
    const { form } = this.props;
    Alert.alert(
      I18n.t('report.saveLaterTitle'),
      I18n.t('report.saveLaterDescription'),
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => {
            if (this.props.saveReport) {
              this.props.saveReport(form, {
                status: CONSTANTS.status.draft
              });
            }
            this.props.navigator.popToRoot({ animate: true });
          }
        }
      ],
      { cancelable: false }
    );
  }

  onPressSave = () => {
    const { form, finish, navigator } = this.props;
    finish(form);
    navigator.popToRoot({ animate: true });
  }

  onNavigatorEvent = (event) => {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'draft') this.onPressDraft();
    }
  }

  onEdit = (result, index) => {
    const { navigator, form } = this.props;
    const isFeedback = name => (name === 'daily' || name === 'weekly');
    const screen = isFeedback(form) ? 'ForestWatcher.Feedback' : 'ForestWatcher.NewReport';
    navigator.showModal({
      screen,
      passProps: {
        form,
        title: 'Report',
        screen,
        step: index,
        texts: {
          requiredId: 'nana'
        }
      }
    });
  }

  render() {
    const { results } = this.props;
    return (
      <View style={styles.answersContainer}>
        <ScrollView>
          {
            results.map((result, i) => (
              <Answer
                id={result.question.id}
                key={result.question.id}
                answers={result.answers}
                question={result.question.label}
                onEditPress={() => this.onEdit(result, i)}
              />
            ))
          }
          <View style={styles.buttonSaveContainer}>
            <ActionButton
              onPress={this.onPressSave}
              text={I18n.t('commonText.save')}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default Answers;