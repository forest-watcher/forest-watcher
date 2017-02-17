import React, { Component } from 'react';
import List from 'components/common/list';
import {
  View,
  Text,
  TouchableHighlight,
  ScrollView,
  Image
} from 'react-native';

import Theme from 'config/theme';
import I18n from 'locales';
import styles from './styles';

const nextIcon = require('assets/next.png');
const plusIcon = require('assets/plus.png');

const aboutSections = [
  {
    text: I18n.t('settings.aboutPartners'),
    image: null,
    functionOnPress: null
  },
  {
    text: I18n.t('settings.aboutTerms'),
    image: null,
    functionOnPress: null
  }
];

class Settings extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    // cache disabled for now
    // if (!this.props.areas || !this.props.areas.length > 0) {
    this.props.getAreas();
    // }
  }

  render() {
    const { areas, areasImages } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text style={styles.label}>
            {I18n.t('settings.loggedIn')}
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
              <Text style={styles.logout}>{I18n.t('settings.logOut')}</Text>
            </TouchableHighlight>
          </View>

          {areas && areas.length
            ? <View style={styles.areas}>
              <Text style={styles.label}>
                {I18n.t('settings.yourAreas')}
              </Text>

              {areas.map((item, key) => {
                const area = item.attributes;
                area.id = item.id;
                const image = areasImages[area.id];

                return (

                  <TouchableHighlight
                    key={key}
                    activeOpacity={0.5}
                    underlayColor="transparent"
                  >
                    <View style={styles.item}>
                      <View style={styles.imageContainer}>
                        {image
                          ? <Image style={styles.image} source={{ uri: image }} />
                          : null
                        }
                      </View>
                      <Text style={styles.title} numberOfLines={2}>
                        {area.name}
                      </Text>
                      <TouchableHighlight
                        activeOpacity={0.5}
                        underlayColor="transparent"
                      >
                        <Image style={Theme.icon} source={nextIcon} />
                      </TouchableHighlight>
                    </View>
                  </TouchableHighlight>
                );
              })
              }
            </View>
          : null
          }
          <TouchableHighlight
            activeOpacity={0.5}
            underlayColor="transparent"
            onPress={() => this.props.navigate('Setup')}
          >
            <View style={styles.addButton}>
              <Image style={Theme.icon} source={plusIcon} />
              <Text style={styles.addButtonText}>
                {I18n.t('settings.addArea').toUpperCase()}
              </Text>
            </View>
          </TouchableHighlight>

          <View style={styles.aboutSection}>
            <Text style={styles.label}>
              {I18n.t('settings.aboutApp')}
            </Text>

            <List content={aboutSections} bigSeparation={false}>{}</List>

            <Text style={[styles.label, styles.footerText]}>
              {I18n.t('settings.appName')}
            </Text>

          </View>
        </ScrollView>
      </View>
    );
  }
}

Settings.propTypes = {
  user: React.PropTypes.any,
  areas: React.PropTypes.any,
  areasImages: React.PropTypes.any,
  navigate: React.PropTypes.func.isRequired,
  getAreas: React.PropTypes.func.isRequired
};

export default Settings;
