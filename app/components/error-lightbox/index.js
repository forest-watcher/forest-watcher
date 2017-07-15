import { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-native';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';

class ErrorLightbox extends Component {

  static propTypes = {
    error: PropTypes.object.isRequired,
    isFatal: PropTypes.bool.isRequired,
    closeLightbox: PropTypes.func.isRequired
  };

  componentDidMount() {
    const { error, isFatal, closeLightbox } = this.props;
    tracker.trackException(
       JSON.stringify({ type: error.name, message: error.message, stack: error.stack }), isFatal
    );
    Alert.alert(
      I18n.t('commonText.error'),
      I18n.t('commonText.unexpectedError'),
      [
        {
          text: 'Close',
          style: 'close',
          onPress: closeLightbox
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
