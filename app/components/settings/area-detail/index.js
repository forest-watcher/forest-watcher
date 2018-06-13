// @flow
import type { Area } from 'types/areas.types';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  View,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableHighlight
} from 'react-native';
import tracker from 'helpers/googleAnalytics';
import FastImage from 'react-native-fast-image';

import i18n from 'locales';
import Theme from 'config/theme';
import ActionButton from 'components/common/action-button';
import AlertSystem from 'containers/settings/area-detail/alert-system';
import styles from './styles';

const editIcon = require('assets/edit.png');
const deleteIcon = require('assets/delete_white.png');

type State = {
  name: string,
  editingName: boolean
}

type Props = {
  updateArea: (Area) => void,
  deleteArea: (string) => void,
  isConnected: boolean,
  navigator: Object,
  area: Area,
  disableDelete: boolean
};

class AreaDetail extends Component<Props, State> {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static navigatorButtons = {
    rightButtons: [
      {
        icon: deleteIcon,
        id: 'deleteArea'
      }
    ]
  };

  static defaultProps = {
    disableDelete: false
  };

  static propTypes = {
    updateArea: PropTypes.func,
    deleteArea: PropTypes.func,
    isConnected: PropTypes.bool.isRequired,
    navigator: PropTypes.object,
    area: PropTypes.object,
    disableDelete: PropTypes.bool.isRequired
  };

  constructor(props: Props) {
    super();
    this.state = {
      name: props.area.name,
      editingName: false
    };
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  componentDidMount() {
    tracker.trackScreenView('AreaDetail');
  }

  onEditPress = () => {
    this.setState({ editingName: true });
  }

  onNameChange = (name: string) => {
    this.setState({ name });
  }

  onNameSubmit = (ev: SyntheticInputEvent<*>) => {
    const newName = ev.nativeEvent.text;
    const { name } = this.props.area;
    if (newName && newName !== name) {
      this.setState({
        name: newName,
        editingName: false
      });

      const updatedArea = { ...this.props.area, name: newName };
      this.props.updateArea(updatedArea);
      this.replaceRouteTitle(updatedArea.name);
    }
  }

  onNavigatorEvent = (event: { type: string, id: string }) => {
    if (event.type === 'NavBarButtonPress' && event.id === 'deleteArea') {
      this.handleDeleteArea();
    }
  }

  replaceRouteTitle = (title: string) => {
    this.props.navigator.setTitle({ title });
  }

  handleDeleteArea = () => {
    if (this.props.isConnected) {
      this.props.deleteArea(this.props.area.id);
      this.props.navigator.pop({
        animated: true
      });
    } else {
      Alert.alert(
        i18n.t('commonText.connectionRequiredTitle'),
        i18n.t('commonText.connectionRequired'),
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }
  }

  render() {
    const { area, disableDelete } = this.props;

    if (!area) return null;
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps={'always'}
      >
        <View>
          <Text style={styles.title}>{i18n.t('commonText.name')}</Text>
          {!this.state.editingName ?
            <View style={styles.section}>
              <Text style={styles.name}>
                {this.state.name}
              </Text>
              <TouchableHighlight
                activeOpacity={0.5}
                underlayColor="transparent"
                onPress={this.onEditPress}
              >
                <Image style={Theme.icon} source={editIcon} />
              </TouchableHighlight>
            </View>
            : <View style={styles.section}>
              <TextInput
                autoFocus
                autoCorrect={false}
                multiline={false}
                style={styles.input}
                autoCapitalize="none"
                value={this.state.name !== null ? this.state.name : this.props.area.name}
                onChangeText={this.onNameChange}
                onSubmitEditing={this.onNameSubmit}
                onBlur={this.onNameSubmit}
                underlineColorAndroid="transparent"
                selectionColor={Theme.colors.color1}
                placeholderTextColor={Theme.fontColors.light}
              />
            </View>
          }
        </View>
        <View style={styles.row}>
          <Text style={styles.title}>{i18n.t('commonText.boundaries')}</Text>
          <View style={styles.imageContainer}>
            <FastImage style={styles.image} source={{ uri: area.image }} />
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.title}>{i18n.t('alerts.alertSystems')}</Text>
          <AlertSystem areaId={area.id} />
        </View>
        {!disableDelete &&
          <View style={styles.buttonContainer}>
            <ActionButton onPress={this.handleDeleteArea} delete text={i18n.t('areaDetail.delete')} />
          </View>
        }
      </ScrollView>
    );
  }
}

export default AreaDetail;
