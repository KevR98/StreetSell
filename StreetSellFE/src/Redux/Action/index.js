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

export const setUser = (user) => {
  return {
    type: 'LOGIN_SUCCESS', // Usiamo lo stesso tipo del reducer per impostare isAuthenticated: true
    payload: {
      user: user,
      token: localStorage.getItem('accessToken'),
    },
  };
};
