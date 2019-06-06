// @flow

import React, { PureComponent } from 'react';
import { Text, ScrollView, Picker } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import ActionButton from 'components/common/action-button';
import InputText from 'components/common/text-input';

type Props = {
  componentId: string,
  updateActiveRoute: () => void,
  finishAndSaveRoute: () => void
};

class SaveRoute extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: 'Save Route'
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.state = {
      routeSaveName: '',
      difficulty: 'easy'
    };
  }

  changeRouteSaveName = newRouteSaveName => {
    this.setState({ routeSaveName: newRouteSaveName });
  };

  changeRouteDifficulty = newDifficulty => {
    this.setState({ difficulty: newDifficulty });
  };

  saveRoute = () => {
    this.props.updateActiveRoute({ name: this.state.routeSaveName, difficulty: this.state.difficulty });
    this.props.finishAndSaveRoute();
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Map'
      }
    });
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.headingText}>{'Route Name'.toUpperCase()}</Text>
        <InputText
          value={this.state.routeSaveName}
          placeholder={'Route Name'}
          onChangeText={this.changeRouteSaveName}
        />
        <Text style={styles.headingText}>{'Difficulty'.toUpperCase()}</Text>
        <Picker
          selectedValue={this.state.difficulty}
          onValueChange={this.changeRouteDifficulty}
          style={styles.picker}
          itemStyle={{ height: 72 }} // Only for iOS
          mode="dropdown" // Only for Android
        >
          <Picker.Item label={'easy'} value={'easy'} style={styles.pickerItem} />
          <Picker.Item label={'medium'} value={'medium'} style={styles.pickerItem} />
          <Picker.Item label={'hard'} value={'hard'} style={styles.pickerItem} />
        </Picker>
        <ActionButton
          style={styles.actionButton}
          onPress={this.saveRoute}
          text={'Save Route'.toUpperCase()}
          short
          noIcon
        />
      </ScrollView>
    );
  }
}
/*
label: PropTypes.string.isRequired,
  selectedValue: PropTypes.any.isRequired,
  onValueChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired
 */
export default SaveRoute;
