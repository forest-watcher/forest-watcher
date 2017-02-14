import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableHighlight
} from 'react-native';
import I18n from 'locales';
import styles from './styles';

function onItemTap() {
  return null;
}

function AlertsList(props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {props.data.map((data, areaKey) =>
        (
          <View key={`area-${areaKey}`}>
            <View style={styles.area}>
              <Text style={styles.areaTitle}>{data.area}</Text>
              <TouchableHighlight
                onPress={() => onItemTap(alert)}
                activeOpacity={1}
                underlayColor="transparent"
              >
                <Text style={styles.areaMore}>{`${I18n.t('alertList.seeAll')} >`}</Text>
              </TouchableHighlight>
            </View>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.alerts}
              horizontal
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              alwaysBounceVertical={false}
            >
              {data.alerts.map((alert, alertKey) =>
                (
                  <TouchableHighlight
                    key={`${I18n.t('alertList.alert')}-${alertKey}`}
                    onPress={() => onItemTap(alert)}
                    activeOpacity={1}
                    underlayColor="transparent"
                  >
                    <View style={styles.alertItem}>
                      <Text style={styles.alertName}>{alert.name}</Text>
                    </View>
                  </TouchableHighlight>
                )
              )}
            </ScrollView>
          </View>
        )
      )}
    </ScrollView>
  );
}

AlertsList.propTypes = {
  data: React.PropTypes.array.isRequired
};

export default AlertsList;
