import { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-native';
import I18n from 'locales';

class ErrorLightbox extends Component {

  static propTypes = {
    error: PropTypes.object,
    onPressOK: PropTypes.func.isRequired
  };

  componentDidMount() {
    const { error, onPressOK } = this.props;
    console.warn(error);
    Alert.alert(
      I18n.t('commonText.oops'),
      I18n.t('commonText.crashFeedback'),
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
