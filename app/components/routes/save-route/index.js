// @flow

import React, { PureComponent } from 'react';
import { Text, ScrollView, Picker } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import ActionButton from 'components/common/action-button';
import InputText from 'components/common/text-input';
import { deleteAllLocations, getValidLocations, stopTrackingLocation } from 'helpers/location';
import i18n from 'locales';

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

  onSaveRoutePressed = () => {
    stopTrackingLocation();
    // todo: show loading screen
    getValidLocations((locations, error) => {
      if (error) {
        // todo: handle error
        return;
      }

      if (locations) {
        this.saveRoute(locations);
      }
    });
  };

  saveRoute = locations => {
    const date = Date.now();
    this.props.updateActiveRoute({
      id: date,
      name: this.state.routeSaveName,
      endDate: date,
      difficulty: this.state.difficulty,
      locations
    });
    this.props.finishAndSaveRoute();
    deleteAllLocations();
    Navigation.pop(this.props.componentId);
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
        <Text style={styles.headingText}>{i18n.t('routes.difficulty').toUpperCase()}</Text>
        <Picker
          selectedValue={this.state.difficulty}
          onValueChange={this.changeRouteDifficulty}
          style={styles.picker}
          itemStyle={{ height: 72 }} // Only for iOS
          mode="dropdown" // Only for Android
        >
          <Picker.Item label={i18n.t('routes.difficultyLevels.easy')} value={'easy'} style={styles.pickerItem} />
          <Picker.Item label={i18n.t('routes.difficultyLevels.medium')} value={'medium'} style={styles.pickerItem} />
          <Picker.Item label={i18n.t('routes.difficultyLevels.hard')} value={'hard'} style={styles.pickerItem} />
        </Picker>
        <ActionButton
          style={styles.actionButton}
          onPress={this.state.routeSaveName.length > 0 ? this.onSaveRoutePressed : null}
          text={'Save Route'.toUpperCase()}
          disabled={this.state.routeSaveName.length === 0}
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
