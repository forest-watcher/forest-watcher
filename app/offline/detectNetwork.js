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
    this._setIsConnected(reach.toUpperCase());
  }

  _setIsConnected = (reach) => {
    this._isConnected = (reach !== 'NONE' && reach !== 'UNKNOWN');
  }

  _setIsConnectionExpensive = async () => {
    try {
      this._isConnectionExpensive = await NetInfo.isConnectionExpensive();
    } catch (err) {
      // err means that isConnectionExpensive is not supported
      this._isConnectionExpensive = null;
    }
  }

  _init = async () => {
    this._setReach(await NetInfo.fetch());
    this._updateState();
  }

  _addListeners() {
    NetInfo.addEventListener('change', (reach) => {
      this._setReach(reach);
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
