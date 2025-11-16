const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const mainReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };

    case 'SET_USER': // NUOVO CASE
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload, // Salva l'oggetto utente recuperato
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
};

export default mainReducer;
