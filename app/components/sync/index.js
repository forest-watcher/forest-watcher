import React, { PureComponent } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Theme from 'config/theme';
import I18n from 'locales';
import ActionButton from 'components/common/action-button';
import styles from './styles';

class Sync extends PureComponent {
  static navigatorStyle = {
    navBarHidden: true
  };

  componentWillMount() {
    this.props.getAreas();
    this.props.getForms();
    this.props.getUser();
  }

  getTexts = () => {
    const { isConnected, reach } = this.props;
    const texts = {};
    if (isConnected) {
      texts.title = reach === 'WIFI' ? I18n.t('home.title.updating') : I18n.t('home.title.outOfDate');
      texts.subtitle = reach === 'WIFI' ? I18n.t('home.subtitle.takesTime') : I18n.t('home.subtitle.mobile');
    } else {
      texts.title = I18n.t('home.title.outOfDate');
      texts.subtitle = I18n.t('home.subtitle.noConnection');
    }
    return texts;
  }

  render() {
    const { isConnected, reach } = this.props;
    const { title, subtitle } = this.getTexts();

    return (
      <View style={[styles.mainContainer, styles.center]}>
        <View>
          <View style={styles.textContainer}>
            {isConnected && reach === 'wifi' &&
            <ActivityIndicator
              color={Theme.colors.color1}
              style={{ height: 80 }}
              size="large"
            />
            }
            <Text style={styles.title}>
              {title}
            </Text>
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          </View>
          {reach !== 'mobile' ?
            <View>
              <ActionButton
                monochrome
                noIcon
                style={styles.button}
                onPress={() => {
                }}
                text={I18n.t('home.skip').toUpperCase()}
              />
            </View>
            :
            <View>
              <ActionButton
                monochrome
                noIcon
                onPress={() => {}}
                text={I18n.t('home.skip').toUpperCase()}
              />
              <ActionButton
                main
                noIcon
                onPress={() => {
                }}
                text={I18n.t('home.update').toUpperCase()}
              />
            </View>
          }
        </View>
      </View>
    );
  }
}

Sync.propTypes = {
  isConnected: React.PropTypes.bool.isRequired,
  reach: React.PropTypes.string.isRequired,
  getUser: React.PropTypes.func.isRequired,
  getAreas: React.PropTypes.func.isRequired,
  getForms: React.PropTypes.func.isRequired
};

export default Sync;
