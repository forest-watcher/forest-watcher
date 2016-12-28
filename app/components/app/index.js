import React from 'react';
import {
  View,
  NavigationExperimental
} from 'react-native';

import renderScene from 'routes';
import styles from './styles';

const {
  CardStack: NavigationCardStack
} = NavigationExperimental;


function App(props) {
  return (
    <View style={styles.mainContainer}>
      <NavigationCardStack
        direction={'horizontal'}
        navigationState={props.navigationRoute}
        onNavigate={props.onNavigate}
        renderScene={renderScene}
        style={styles.main}
      />
    </View>
  );
}

App.propTypes = {
  navigationRoute: React.PropTypes.object.isRequired,
  onNavigate: React.PropTypes.func.isRequired
};

export default App;
