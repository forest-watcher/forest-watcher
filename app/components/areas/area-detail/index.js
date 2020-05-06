// @flow
import type { Area } from 'types/areas.types';
import type { Route } from 'types/routes.types';
import type { Dispatch, GetState } from 'types/store.types';

import React, { Component } from 'react';
import { Alert, View, Image, ScrollView, Text, TextInput, TouchableHighlight } from 'react-native';
import debounceUI from 'helpers/debounceUI';
import tracker from 'helpers/googleAnalytics';

import i18n from 'i18next';
import moment from 'moment';
import Theme, { isSmallScreen } from 'config/theme';
import ActionButton from 'components/common/action-button';
import styles from './styles';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import { withSafeArea } from 'react-native-safe-area';

import VerticalSplitRow from 'components/common/vertical-split-row';
import RoutePath from 'components/common/route-path';

import { formatDistance, getDistanceOfPolyline } from 'helpers/map';

const RoutePreviewSize = isSmallScreen ? 86 : 122;

const routeMapBackground = require('assets/routeMapBackground.png');
const SafeAreaView = withSafeArea(View, 'margin', 'vertical');
const editIcon = require('assets/edit.png');
const deleteIcon = require('assets/delete_white.png');

type State = {
  name: string,
  editingName: boolean
};

type Props = {
  updateArea: Area => void,
  deleteArea: string => void,
  isConnected: boolean,
  componentId: string,
  area: Area,
  disableDelete: boolean,
  routes: Array<Route>,
  initialiseAreaLayerSettings: (string, string) => void,
  setSelectedAreaId: (areaId: string) => void
};

class AreaDetail extends Component<Props, State> {
  static options(passProps: {}) {
    return {
      topBar: {
        rightButtons: [
          {
            id: 'deleteArea',
            icon: deleteIcon,
            color: Theme.colors.turtleGreen
          }
        ]
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.state = {
      name: props.area.name,
      editingName: false
    };
  }

  componentDidMount() {
    tracker.trackScreenView('AreaDetail');
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === 'deleteArea') {
      this.handleDeleteArea();
    }
  }

  onEditPress = () => {
    this.setState({ editingName: true });
  };

  onNameChange = (name: string) => {
    this.setState({ name });
  };

  // $FlowFixMe
  onNameSubmit = debounceUI((ev: SyntheticInputEvent<*>) => {
    // $FlowFixMe
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
  });

  onRoutePress = debounceUI((route: Route) => {
    this.props.setSelectedAreaId(route.areaId);
    this.props.initialiseAreaLayerSettings(route.id, route.areaId);
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Map',
        options: {
          topBar: {
            title: {
              text: route.name
            }
          }
        },
        passProps: {
          previousRoute: route
        }
      }
    });
  });

  onRouteSettingsPress = debounceUI((route: Route) => {
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.RouteDetail',
              passProps: {
                routeId: route.id,
                routeName: route.name
              }
            }
          }
        ]
      }
    });
  });

  replaceRouteTitle = (title: string) => {
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        title: {
          text: title
        }
      }
    });
  };

  handleDeleteArea = debounceUI(() => {
    if (this.props.routes.length > 0) {
      Alert.alert(
        i18n.t('areaDetail.confirmDeleteWithRoutesTitle'),
        i18n.t('areaDetail.confirmDeleteWithRoutesMessage'),
        [
          {
            text: i18n.t('commonText.confirm'),
            onPress: () => {
              this.confirmDeleteArea();
            }
          },
          {
            text: i18n.t('commonText.cancel'),
            style: 'cancel'
          }
        ]
      );
    } else {
      this.confirmDeleteArea();
    }
  });

  confirmDeleteArea = debounceUI(() => {
    if (this.props.isConnected) {
      this.props.deleteArea(this.props.area.id);
      Navigation.pop(this.props.componentId);
    } else {
      Alert.alert(
        i18n.t('commonText.connectionRequiredTitle'),
        i18n.t('commonText.connectionRequired'),
        [{ text: 'OK' }],
        {
          cancelable: false
        }
      );
    }
  });

  render() {
    const { area, disableDelete, routes } = this.props;

    if (!area) {
      return null;
    }
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps={'always'}
        >
          <View>
            <Text style={styles.title}>{i18n.t('commonText.name')}</Text>
            {!this.state.editingName ? (
              <View style={styles.section}>
                <Text style={styles.name}>{this.state.name}</Text>
                <TouchableHighlight activeOpacity={0.5} underlayColor="transparent" onPress={this.onEditPress}>
                  <Image style={Theme.icon} source={editIcon} />
                </TouchableHighlight>
              </View>
            ) : (
              <View style={styles.section}>
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
                  selectionColor={Theme.colors.turtleGreen}
                  placeholderTextColor={Theme.fontColors.light}
                />
              </View>
            )}
          </View>
          <View style={styles.row}>
            <Text style={styles.title}>{i18n.t('commonText.boundaries')}</Text>
            <View style={styles.imageContainer}>
              <Image style={styles.image} source={{ uri: area.image }} />
            </View>
          </View>
          {routes.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.title}>{i18n.t('settings.yourRoutes')}</Text>
              {routes.map(route => {
                const routeDistance = getDistanceOfPolyline(route.locations);
                const dateText = moment(route.endDate).format('ll');
                const distanceText = formatDistance(routeDistance, 1, false);
                const subtitle = dateText + ', ' + distanceText;
                // const action = {
                //   icon,
                //   callback: () => {
                //     onPress(item.title);
                //   },
                //   position
                // };

                return (
                  <VerticalSplitRow
                    backgroundImageResizeMode={'repeat'}
                    key={route.id}
                    onSettingsPress={this.onRouteSettingsPress.bind(this, route)}
                    onPress={this.onRoutePress.bind(this, route)}
                    title={route.name}
                    renderImageChildren={() => {
                      return <RoutePath route={route} size={RoutePreviewSize} />;
                    }}
                    imageSrc={routeMapBackground}
                    subtitle={subtitle}
                    largerLeftPadding
                    largeImage
                  />
                );
              })}
            </View>
          )}
          {!disableDelete && (
            <View style={styles.buttonContainer}>
              <ActionButton onPress={this.handleDeleteArea} delete text={i18n.t('areaDetail.delete')} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default AreaDetail;
