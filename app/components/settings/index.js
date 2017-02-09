import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  ActivityIndicator
} from 'react-native';

import Theme from 'config/theme';
import I18n from 'locales';
import styles from './styles';

function renderLoading() {
  return (
    <View style={[styles.container, styles.center]}>
      <ActivityIndicator
        color={Theme.colors.color1}
        style={{ height: 80 }}
        size={'large'}
      />
    </View>
  );
}

class Settings extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    if (!this.props.areas) {
      this.props.getAreas();
    }
  }

  render() {
    const { areas } = this.props;

    if (areas && areas.length) {
      return (
        <View style={styles.container}>
          <Text style={styles.label}>
            {I18n.t('settings.user.label')}
          </Text>

          <View style={styles.user}>
            <View style={styles.info}>
              <Text style={styles.name}>
                {this.props.user.fullName}
              </Text>
              <Text style={styles.email}>
                {this.props.user.email}
              </Text>
            </View>
            <TouchableHighlight
              activeOpacity={0.5}
              underlayColor="transparent"
            >
              <Text style={styles.logout}>LOG OUT</Text>
            </TouchableHighlight>
          </View>

          <View style={styles.areas}>
            {areas.map((item, key) => {
              const area = item.attributes;
              area.id = item.id;

              return (
                <TouchableHighlight
                  style={styles.item}
                  key={key}
                  activeOpacity={0.5}
                  underlayColor="transparent"
                >
                  <Text>{area.name}</Text>
                </TouchableHighlight>
              );
            }
          )}
          </View>

        </View>
      );
    }
    return renderLoading();
  }
}

Settings.propTypes = {
  user: React.PropTypes.any,
  areas: React.PropTypes.any,
  getAreas: React.PropTypes.func.isRequired
};

export default Settings;
