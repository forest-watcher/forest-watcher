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
const uploadIcon = require('assets/upload.png');


function getItems(data, image) {
  return data.map((item, index) => (
    <View
      key={index}
      style={styles.listItem}
    >
      <View style={styles.listItemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemText}>{item.position}</Text>
        <Text style={styles.itemText}>{item.date}</Text>
      </View>
      <View style={styles.listBtn}>
        <TouchableHighlight
          onPress={() => console.log('TODO')}
          underlayColor="transparent"
          activeOpacity={0.8}
        >
          <Image style={Theme.icon} source={image} />
        </TouchableHighlight>
      </View>
    </View>
  ));
}

class Reports extends Component {
  constructor() {
    super();

    this.state = {};
  }

  getCompleted() {
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{I18n.t('report.completed')}</Text>
          <Text style={[styles.listTitle, styles.listAction]}>{I18n.t('report.uploadAll').toUpperCase()}</Text>
        </View>
        {getItems(this.props.completed, uploadIcon)}
      </View>
    );
  }

  getDrafts() {
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{I18n.t('report.drafts')}</Text>
        </View>
        {getItems(this.props.completed, editIcon)}
      </View>
    );
  }

  getUploaded() {
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{I18n.t('report.uploaded')}</Text>
        </View>
        {getItems(this.props.completed, checkIcon)}
      </View>
    );
  }

  render() {
    const { completed, drafts, uploaded } = this.props;
    return (
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.container}>
          {completed && completed.length > 0 &&
            this.getCompleted()
          }
          {drafts && drafts.length > 0 &&
            this.getDrafts()
          }
          {uploaded && uploaded.length > 0 &&
            this.getUploaded()
          }
        </View>
      </ScrollView>
    );
  }
}

Reports.propTypes = {
  drafts: React.PropTypes.array,
  uploaded: React.PropTypes.array,
  completed: React.PropTypes.array
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
