export const loginSuccess = (payload) => {
  return {
    type: 'LOGIN_SUCCESS',
    payload: payload,
  };
};

export const logout = () => {
  return {
    type: 'LOGOUT',
  };
};

export const loginFailure = (payload) => {
  return {
    type: 'LOGIN_FAILURE',
    payload: payload,
  };
};
