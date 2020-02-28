import { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-native';
import i18n from 'i18next';

class ErrorLightbox extends Component {
  static propTypes = {
    error: PropTypes.object,
    onPressOK: PropTypes.func.isRequired
  };

  componentDidMount() {
    const { error, onPressOK } = this.props;
    console.warn(error);
    Alert.alert(
      i18n.t('commonText.oops'),
      i18n.t('commonText.crashFeedback'),
      [
        {
          text: 'OK',
          onPress: onPressOK
        }
      ],
      { cancelable: false }
    );
  }

  render() {
    return null;
  }
}

export default ErrorLightbox;
