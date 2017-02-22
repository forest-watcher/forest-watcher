import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableHighlight
} from 'react-native';

import I18n from 'locales';
import Theme from 'config/theme';
import LeftBtn from 'components/common/header/left-btn';
import headerStyles from 'components/common/header/styles';
import styles from './styles';

const editIcon = require('assets/edit.png');
const checkIcon = require('assets/next.png');
// const uploadIcon = require('assets/upload.png');

function getItems(data, image, onPress) {
  return data.map((item, index) => (
    <View
      key={index}
      style={styles.listItem}
    >
      <View style={styles.listItemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemText}>{`${item.position[0]},${item.position[1]}`}</Text>
        <Text style={styles.itemText}>{item.date}</Text>
      </View>
      <View style={styles.listBtn}>
        {image &&
        <TouchableHighlight
          onPress={() => onPress(item.title)}
          underlayColor="transparent"
          activeOpacity={0.8}
        >
          <Image style={Theme.icon} source={image} />
        </TouchableHighlight>
        }
      </View>
    </View>
  ));
}

class Reports extends Component {

  getCompleted(completed) { // eslint-disable-line
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{I18n.t('report.completed')}</Text>
          <Text style={[styles.listTitle, styles.listAction]}>{I18n.t('report.uploadAll').toUpperCase()}</Text>
        </View>
        {getItems(completed)}
      </View>
    );
  }

  getDrafts(drafts) { // eslint-disable-line
    const onActionPress = (reportName) => {
      this.props.navigation.navigate('NewReport', { form: reportName });
    };
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{I18n.t('report.drafts')}</Text>
        </View>
        {getItems(drafts, editIcon, onActionPress)}
      </View>
    );
  }

  getUploaded(uploaded) { // eslint-disable-line
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{I18n.t('report.uploaded')}</Text>
        </View>
        {getItems(uploaded, checkIcon)}
      </View>
    );
  }

  render() {
    const { complete, draft, uploaded } = this.props.reports;
    return (
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.container}>
          {complete && complete.length > 0 &&
            this.getCompleted(complete)
          }
          {draft && draft.length > 0 &&
            this.getDrafts(draft)
          }
          {uploaded && uploaded.length > 0 &&
            this.getUploaded(uploaded)
          }
        </View>
      </ScrollView>
    );
  }
}

Reports.propTypes = {
  navigation: React.PropTypes.object.isRequired,
  reports: React.PropTypes.shape({
    draft: React.PropTypes.array,
    uploaded: React.PropTypes.array,
    complete: React.PropTypes.array
  }).isRequired
};

Reports.navigationOptions = {
  header: ({ goBack }) => ({
    left: <LeftBtn goBack={goBack} />,
    tintColor: Theme.colors.color1,
    style: headerStyles.style,
    titleStyle: headerStyles.titleStyle,
    title: I18n.t('report.plural')
  })
};


export default Reports;
