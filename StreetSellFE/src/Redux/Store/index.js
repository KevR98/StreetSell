import { configureStore } from '@reduxjs/toolkit';
import mainReducer from '../Reducers/authReducer';

const store = configureStore({
  reducer: {
    auth: mainReducer,
  },
});

export default store;
