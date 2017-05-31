/* eslint no-underscore-dangle: 0 */
import { AppState, NetInfo } from 'react-native'; // eslint-disable-line import/no-unresolved

class DetectNetwork {
  constructor(callback) {
    this._reach = null;
    this._isConnected = null;
    this._isConnectionExpensive = null;
    this._callback = callback;

    this._init();
    this._addListeners();
  }
  _setReach = (reach) => {
    this._reach = reach;
  }

  _setIsConnected = (isConnected) => {
    this._isConnected = isConnected;
  }

  _setIsConnectionExpensive = async () => {
    try {
      this._isConnectionExpensive = await NetInfo.isConnectionExpensive();
    } catch (err) {
      throw new Error(err);
    }
  }

  _init = async () => {
    this._setReach(await NetInfo.fetch());
    this._setIsConnected(await NetInfo.fetch);
    this._updateState();
  }

  _addListeners() {
    NetInfo.addEventListener('change', (reach) => {
      this._setReach(reach);
      this._updateState();
    });
    NetInfo.isConnected.addEventListener('change', (isConnected) => {
      this._setIsConnected(isConnected);
      this._updateState();
    });
    AppState.addEventListener('change', this._init);
  }

  _updateState = async () => {
    await this._setIsConnectionExpensive();
    this._callback({
      online: this._isConnected,
      netInfo: {
        isConnectionExpensive: this._isConnectionExpensive,
        reach: this._reach
      }
    });
  }
}

export default callback => new DetectNetwork(callback);
