import { createStore, combineReducers } from 'redux';

// i18n reducer
const i18nReducer = (state = { language: 'en' }, action) => {
  switch (action.type) {
    case 'CHANGE_LANGUAGE':
      return {
        ...state,
        language: action.payload
      };
    default:
      return state;
  }
};

// 合并 reducers
const rootReducer = combineReducers({});

const store = createStore(rootReducer);

export default store;