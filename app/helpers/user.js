import CONSTANTS from 'config/constants';
import {
  AsyncStorage
} from 'react-native';

export async function setToken(token) {
  try {
    await AsyncStorage.setItem(CONSTANTS.storage.user.token, token);
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

export async function getToken() {
  try {
    const token = await AsyncStorage.getItem(CONSTANTS.storage.user.token);
    return token !== null ? token : false;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

export async function getSetupStatus() {
  try {
    const setup = await AsyncStorage.getItem(CONSTANTS.storage.app.setup);
    return setup !== null;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

export async function setSetupStatus(status) {
  try {
    await AsyncStorage.setItem(CONSTANTS.storage.app.setup, status.toString());
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}
