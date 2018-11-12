import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
// import fetchMock from 'fetch-mock';

const mockStore = configureMockStore([thunk]);

// TEST

describe('async actions', () => {
  afterEach(() => {
    // fetchMock.restore();
  });

  it('creates FETCH_TODOS_SUCCESS when fetching todos has been done', () => {
    // fetchMock.getOnce('/todos', {
    //   body: { todos: ['do something'] },
    //   headers: { 'content-type': 'application/json' }
    // });

    const expectedActions = [
      { type: FETCH_TODOS_REQUEST },
      { type: FETCH_TODOS_SUCCESS, body: { todos: ['do something'] } }
    ];
    const store = mockStore({ todos: [] });

    return store.dispatch(fetchTodos()).then(() => {
      // return of async actions
      expect(store.getActions()).toEqual(expectedActions);
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
