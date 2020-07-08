import 'react-native';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { combinedReducer } from 'combinedReducer';
import layerReducer, { getUserLayers, syncLayers } from 'redux-modules/layers';
import {
  calculateOverallDownloadProgressForRegion,
  deleteRegionFromProgress,
  invalidateIncompleteLayerDownloads
} from 'redux-modules/layers/downloadLayer';

describe('Redux Layers Module', () => {
  // Mock Objects:
  const mockArea = {
    name: 'nameMock',
    id: 'areaIDMock',
    application: 'applicationMock', // used to test that all fields are included in payload
    geostore: { id: 'geostoreIDMock' }
  };

  const mockRoute = {
    id: 'routeIDMock',
    areaId: 'areaIDMock',
    geostoreId: 'geostoreIDMock',
    name: 'routeNameMock'
  };

  const mockLayer = {
    url: 'urlMock',
    name: 'nameMock',
    id: 'layerIDMock'
  };

  const mockPendingCache = {
    layerIDMock: {
      areaIDMock: false,
      areaIDMock2: false,
      mockAreaID: 'areaIDMock'
    },
    mockLayerID2: {
      areaIDMock: false,
      areaIDMock2: false,
      areaIDMock3: false,
      mockAreaID: 'areaIDMock'
    }
  };

  it('Initial reducer state', () => {
    expect(layerReducer(undefined, { type: 'NONE' })).toMatchSnapshot({ syncDate: expect.any(Number) });
  });

  describe('func calculateOverallDownloadProgressForRegion', () => {
    it('returns expected state when given an empty progress state', () => {
      expect(calculateOverallDownloadProgressForRegion('area1', {}, 1)).toMatchSnapshot();
    });

    describe('when one layer is expected', () => {
      it('returns expected state when one layer is in progress', () => {
        expect(
          calculateOverallDownloadProgressForRegion(
            'area1',
            {
              layer1: {
                area1: {
                  progress: 50,
                  requested: true,
                  completed: false,
                  error: false
                }
              }
            },
            1
          )
        ).toMatchSnapshot();
      });

      it('returns expected state when one layer has errorred', () => {
        expect(
          calculateOverallDownloadProgressForRegion(
            'area1',
            {
              layer1: {
                area1: {
                  progress: 100,
                  requested: false,
                  completed: true,
                  error: true
                }
              }
            },
            1
          )
        ).toMatchSnapshot();
      });

      it('returns expected state when one layer is complete', () => {
        expect(
          calculateOverallDownloadProgressForRegion(
            'area1',
            {
              layer1: {
                area1: {
                  progress: 100,
                  requested: false,
                  completed: true,
                  error: false
                }
              }
            },
            1
          )
        ).toMatchSnapshot();
      });
    });

    describe('when two layers are expected', () => {
      it('returns expected state when one layer is in progress & one layer is in progress', () => {
        expect(
          calculateOverallDownloadProgressForRegion(
            'area1',
            {
              layer1: {
                area1: {
                  progress: 50,
                  requested: true,
                  completed: false,
                  error: false
                }
              },
              layer2: {
                area1: {
                  progress: 50,
                  requested: true,
                  completed: false,
                  error: false
                }
              }
            },
            2
          )
        ).toMatchSnapshot();
      });

      it('returns expected state when one layer is in progress & one layer has errorred', () => {
        expect(
          calculateOverallDownloadProgressForRegion(
            'area1',
            {
              layer1: {
                area1: {
                  progress: 50,
                  requested: true,
                  completed: false,
                  error: false
                }
              },
              layer2: {
                area1: {
                  progress: 100,
                  requested: false,
                  completed: true,
                  error: true
                }
              }
            },
            2
          )
        ).toMatchSnapshot();
      });

      it('returns expected state when one layer is in progress & one layer is complete', () => {
        expect(
          calculateOverallDownloadProgressForRegion(
            'area1',
            {
              layer1: {
                area1: {
                  progress: 50,
                  requested: true,
                  completed: false,
                  error: false
                }
              },
              layer2: {
                area1: {
                  progress: 100,
                  requested: false,
                  completed: true,
                  error: false
                }
              }
            },
            2
          )
        ).toMatchSnapshot();
      });

      it('returns expected state when one layer is in progress & one layer does not exist', () => {
        expect(
          calculateOverallDownloadProgressForRegion(
            'area1',
            {
              layer1: {
                area1: {
                  progress: 50,
                  requested: true,
                  completed: false,
                  error: false
                }
              }
            },
            2
          )
        ).toMatchSnapshot();
      });

      it('returns expected state when one layer is complete & one layer does not exist', () => {
        expect(
          calculateOverallDownloadProgressForRegion(
            'area1',
            {
              layer1: {
                area1: {
                  progress: 100,
                  requested: false,
                  completed: true,
                  error: false
                }
              }
            },
            2
          )
        ).toMatchSnapshot();
      });

      it('returns expected state when one layer has errorred & one layer has errorred', () => {
        expect(
          calculateOverallDownloadProgressForRegion(
            'area1',
            {
              layer1: {
                area1: {
                  progress: 100,
                  requested: false,
                  completed: true,
                  error: true
                }
              },
              layer2: {
                area1: {
                  progress: 100,
                  requested: false,
                  completed: true,
                  error: true
                }
              }
            },
            2
          )
        ).toMatchSnapshot();
      });

      it('returns expected state when one layer has errorred & one layer is complete', () => {
        expect(
          calculateOverallDownloadProgressForRegion(
            'area1',
            {
              layer1: {
                area1: {
                  progress: 100,
                  requested: false,
                  completed: true,
                  error: true
                }
              },
              layer2: {
                area1: {
                  progress: 100,
                  requested: false,
                  completed: true,
                  error: false
                }
              }
            },
            2
          )
        ).toMatchSnapshot();
      });

      it('returns expected state when one layer is complete & one layer is complete', () => {
        expect(
          calculateOverallDownloadProgressForRegion(
            'area1',
            {
              layer1: {
                area1: {
                  progress: 100,
                  requested: false,
                  completed: true,
                  error: false
                }
              },
              layer2: {
                area1: {
                  progress: 100,
                  requested: false,
                  completed: true,
                  error: false
                }
              }
            },
            2
          )
        ).toMatchSnapshot();
      });
    });
  });

  describe('func deleteRegionFromProgress', () => {
    it('returns expected state when given an empty progress state', () => {
      expect(deleteRegionFromProgress('area1', {})).toMatchSnapshot();
    });

    describe('when given a region that does not exist', () => {
      it('returns expected state when one layer exists', () => {
        expect(
          deleteRegionFromProgress('area1', {
            layer1: {
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when two layers exists', () => {
        expect(
          deleteRegionFromProgress('area1', {
            layer1: {
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            },
            layer2: {
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });
    });

    describe('when given a region that does exist', () => {
      it('returns expected state when one layer exists', () => {
        expect(
          deleteRegionFromProgress('area1', {
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when two layers exists', () => {
        expect(
          deleteRegionFromProgress('area1', {
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            },
            layer2: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when two layers exists alongside other regions', () => {
        expect(
          deleteRegionFromProgress('area1', {
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              },
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            },
            layer2: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              },
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });
    });
  });

  describe('func invalidateIncompleteLayerDownloads', () => {
    it('returns expected state when given an empty progress state', () => {
      expect(invalidateIncompleteLayerDownloads({})).toMatchSnapshot();
    });

    describe('with only one region per layer', () => {
      it('returns expected state when given one completed layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given two completed layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            },
            layer2: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one 90% completed layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 90,
                requested: false,
                completed: false,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one errorred layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: false,
                error: true
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one requested but not completed layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: true,
                completed: false,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one 90% completed layer & one completed state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            },
            layer2: {
              area1: {
                progress: 90,
                requested: false,
                completed: false,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one errorred layer & one completed state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            },
            layer2: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: true
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one requested but not completed & one completed layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            },
            layer2: {
              area1: {
                progress: 100,
                requested: true,
                completed: false,
                error: true
              }
            }
          })
        ).toMatchSnapshot();
      });
    });

    describe('with two regions per layer', () => {
      it('returns expected state when given one completed layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              },
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given two completed layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              },
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            },
            layer2: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              },
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one 90% completed layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 90,
                requested: false,
                completed: false,
                error: false
              },
              area2: {
                progress: 90,
                requested: false,
                completed: false,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one errorred layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: true
              },
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: true
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one requested but not completed layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: true,
                completed: false,
                error: false
              },
              area2: {
                progress: 100,
                requested: true,
                completed: false,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one 90% completed layer & one completed state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              },
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            },
            layer2: {
              area1: {
                progress: 90,
                requested: false,
                completed: false,
                error: false
              },
              area2: {
                progress: 90,
                requested: false,
                completed: false,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one errorred layer & one completed state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              },
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            },
            layer2: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: true
              },
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: true
              }
            }
          })
        ).toMatchSnapshot();
      });

      it('returns expected state when given one requested but not completed & one completed layer state', () => {
        expect(
          invalidateIncompleteLayerDownloads({
            layer1: {
              area1: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              },
              area2: {
                progress: 100,
                requested: false,
                completed: true,
                error: false
              }
            },
            layer2: {
              area1: {
                progress: 100,
                requested: true,
                completed: false,
                error: false
              },
              area2: {
                progress: 100,
                requested: true,
                completed: false,
                error: false
              }
            }
          })
        ).toMatchSnapshot();
      });
    });
  });

  describe('Redux Snapshot Thunk Actions', () => {
    let initialStoreState;
    let populatedStoreState;
    let configuredStore;
    let store;

    beforeAll(() => {
      // create store
      initialStoreState = combinedReducer(undefined, { type: 'NONE' });
      populatedStoreState = {
        ...initialStoreState,
        areas: {
          ...initialStoreState.areas,
          data: [mockArea]
        },
        layers: {
          ...initialStoreState.layers,
          data: [mockLayer],
          pendingCache: mockPendingCache
        },
        routes: {
          ...initialStoreState.routes,
          previousRoutes: [mockRoute]
        }
      };
      configuredStore = configureStore([thunk]);
    });

    beforeEach(() => {
      // reset store state and clears actions
      store = configuredStore(initialStoreState);
    });

    // if changing this method, change in other tests too
    function mockDispatchAction(state, action, propertyMatcher, test = true) {
      // slightly different implementation in this redux module test.
      const newStore = configuredStore(state);
      newStore.dispatch(action);
      const resolvedActions = newStore.getActions();
      let newState = state.layers;
      // should only be one but the loop is used for future changes and so all tests conform.
      resolvedActions.forEach(resolvedAction => {
        newState = layerReducer(newState, resolvedAction);
      });
      if (test) {
        expect(resolvedActions).toMatchSnapshot();
        expect(newState).toMatchSnapshot(propertyMatcher);
      }

      const returnState = {
        ...state,
        layers: {
          ...newState
        }
      };
      return returnState;
    }

    it('getUserLayers', () => {
      store.dispatch(getUserLayers());
      expect(store.getActions()).toMatchSnapshot();
    });

    it('syncLayers', () => {
      store.dispatch(syncLayers());
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore({
        ...initialStoreState,
        layers: {
          ...initialStoreState.layers,
          synced: true
        }
      });

      store.dispatch(syncLayers());
      expect(store.getActions()).toMatchSnapshot();
    });
  });
});
