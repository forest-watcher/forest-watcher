import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import I18n from 'locales';
import LeftBtn from 'components/common/header/left-btn';
import Theme from 'config/theme';
import headerStyles from 'components/common/header/styles';
import List from 'components/common/list';
import styles from './styles';

class Partners extends Component {

  constructor() {
    super();

    this.state = {
      currentPosition: null
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Partners');
  }

  handleLink(link) {
    console.log(link)
  }

  render() {
    const partners = [
      {
        text: 'World Resources Institute',
        image: 'assets/wri_logo.png',
        url: 'http://www.wri.org/',
        functionOnPress: this.handleLink
      },
      {
        text: 'The Jane Goodall Institute',
        image: 'assets/jgi_logo.png',
        url: 'http://www.janegoodall.org/',
        functionOnPress: this.handleLink
      },
      {
        text: 'Global Forest Watch',
        image: 'assets/gfw_logo.png',
        url: 'http://www.globalforestwatch.org/',
        functionOnPress: this.handleLink
      },
      {
        text: 'Vizzuality',
        image: 'assets/vizzuality_logo.png',
        url: 'http://www.vizzuality.com/',
        functionOnPress: this.handleLink
      }
    ];
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.partner}>
          <Text style={styles.partnerTitle}>{I18n.t('partners.description')}</Text>
          <Text style={styles.partnerTitle}>{I18n.t('partners.listOfPartners')}</Text>
        </View>
        <List content={partners} bigSeparation={false}>{}</List>
      </ScrollView>
    );
  }
}

Partners.propTypes = {
  partners: React.PropTypes.array,
};

Partners.navigationOptions = {
  header: ({ goBack }) => ({
    left: <LeftBtn goBack={goBack} />,
    tintColor: Theme.colors.color1,
    style: headerStyles.style,
    titleStyle: headerStyles.titleStyle,
    title: I18n.t('partners.title')
  })
};

export default Partners;
