import React from 'react';
import {
  View,
  Button
} from 'react-native';
import I18n from 'locales';
import styles from './styles';

function Dashboard(props) {
  return (
    <View style={styles.container}>
      <Button
        onPress={() => props.onNavigate({
          type: 'push',
          key: 'map',
          section: 'map'
        })}
        title={I18n.t('dashboard.map')}
        accessibilityLabel={I18n.t('dashboard.mapAccesibility')}
      />
    </View>
  );
}

Dashboard.propTypes = {
  onNavigate: React.PropTypes.func.isRequired
};

export default Dashboard;
