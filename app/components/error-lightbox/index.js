import { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-native';
import I18n from 'locales';

class ErrorLightbox extends Component {

  static propTypes = {
    error: PropTypes.object.isRequired,
    closeLightbox: PropTypes.func.isRequired
  };

  componentDidMount() {
    const { error, closeLightbox } = this.props;
    console.warn(error);
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
