import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import Config from 'react-native-config';
import checkConnectivity from 'helpers/networking';
import { DetectNetworkPing } from 'offline/detectNetwork';

global.fetch = require('jest-fetch-mock');

const mockStore = configureMockStore([thunk]);

const STATUS_CHANGED = 'STATUS_CHANGED';

describe('detect network actions', () => {
  afterEach(() => {
    fetch.resetMocks();
  });

  it('connectivity request when rejected returns false', () => {
    fetch.mockRejectOnce({ ok: false });

    checkConnectivity(Config.API_URL).then(response => {
      expect(response).toEqual(false);
    });
  });

  it('connectivity request when connected returns true', () => {
    fetch.mockResponseOnce(JSON.stringify({ ok: true }));

    checkConnectivity(Config.API_URL).then(response => {
      expect(response).toEqual(true);
    });
  });

  it('pingToDetectNetwork when first url is alive when online sends online action', async () => {
    const store = mockStore();

    fetch.mockResponseOnce(JSON.stringify({ ok: true }));

    const networkDetector = new DetectNetworkPing();

    await networkDetector.pingToDetectNetwork(store.dispatch, 0)({ type: STATUS_CHANGED, online: true });

    const expectedActions = [{ type: STATUS_CHANGED, online: true }];

    expect(store.getActions()).toEqual(expectedActions);
    expect(store.getActions()).toMatchSnapshot();
  });

  it('pingToDetectNetwork when first url is alive when offline sends offline action', async () => {
    const store = mockStore();

    fetch.mockResponseOnce(JSON.stringify({ ok: true }));

    const networkDetector = new DetectNetworkPing();

    await networkDetector.pingToDetectNetwork(store.dispatch, 0)({ type: STATUS_CHANGED, online: false });

    const expectedActions = [{ type: STATUS_CHANGED, online: false }];

    expect(store.getActions()).toEqual(expectedActions);
    expect(store.getActions()).toMatchSnapshot();
  });

  it('pingToDetectNetwork when first url is dead and second is online sends offline and online actions', async () => {
    const store = mockStore();

    fetch.mockResponses([JSON.stringify({ ok: false }), JSON.stringify({ ok: true })]);

    const networkDetector = new DetectNetworkPing();

    await networkDetector.pingToDetectNetwork(store.dispatch, 0)({ type: STATUS_CHANGED, online: true });

    const expectedActions = [{ type: STATUS_CHANGED, online: true }];

    expect(store.getActions()).toEqual(expectedActions);
    expect(store.getActions()).toMatchSnapshot();
  });

  it('pingToDetectNetwork when all urls are dead sends offline action', async () => {
    const store = mockStore();

    fetch.mockReject(JSON.stringify({ ok: false }));

    const networkDetector = new DetectNetworkPing();

    await networkDetector.pingToDetectNetwork(store.dispatch, 0)({ type: STATUS_CHANGED, online: true });

    const expectedActions = [{ type: STATUS_CHANGED, online: false }];

    expect(store.getActions()).toEqual(expectedActions);
    expect(store.getActions()).toMatchSnapshot();
  });
});
