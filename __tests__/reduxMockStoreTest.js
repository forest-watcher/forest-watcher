import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

global.fetch = require('jest-fetch-mock');

const mockStore = configureMockStore([thunk]);

// TEST

describe('async actions', () => {
  afterEach(() => {
    fetch.resetMocks();
  });

  it('creates FETCH_TODOS_SUCCESS when fetching todos has been done', () => {
    const initialState = { todos: ['ONE'] };
    const store = mockStore(initialState);
    const responseBody = { todos: ['TWO', 'THREE'] };

    fetch.mockResponseOnce(JSON.stringify(responseBody));

    const expectedActions = [{ type: FETCH_TODOS_REQUEST }, { type: FETCH_TODOS_SUCCESS, body: responseBody }];

    return store.dispatch(fetchTodos()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(store.getActions()).toMatchSnapshot();
    });
  });

  it('creates FETCH_TODOS_FAILURE when fetching todos is rejected', () => {
    const store = mockStore();
    const errorObject = { name: 'Mock Error', message: 'Mock error message.' };

    fetch.mockRejectOnce(errorObject);

    const expectedActions = [{ type: FETCH_TODOS_REQUEST }, { type: FETCH_TODOS_FAILURE, exception: errorObject }];

    return store.dispatch(fetchTodos()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      expect(store.getActions()).toMatchSnapshot();
    });
  });
});

// REDUX ACTIONS

const FETCH_TODOS_REQUEST = 'FETCH_TODOS_REQUEST';
const FETCH_TODOS_SUCCESS = 'FETCH_TODOS_SUCCESS';
const FETCH_TODOS_FAILURE = 'FETCH_TODOS_FAILURE';

function fetchTodosRequest() {
  return {
    type: FETCH_TODOS_REQUEST
  };
}

function fetchTodosSuccess(body) {
  return {
    type: FETCH_TODOS_SUCCESS,
    body
  };
}

function fetchTodosFailure(exception) {
  return {
    type: FETCH_TODOS_FAILURE,
    exception
  };
}

export function fetchTodos() {
  return dispatch => {
    dispatch(fetchTodosRequest());
    return fetch('http://example.com/todos')
      .then(res => res.json())
      .then(body => dispatch(fetchTodosSuccess(body)))
      .catch(exception => dispatch(fetchTodosFailure(exception)));
  };
}
