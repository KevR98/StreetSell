export const loginSuccess = (responseData) => {
  return {
    type: 'LOGIN_SUCCESS',
    payload: {
      user: responseData.user,
      token: responseData.token,
    },
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
