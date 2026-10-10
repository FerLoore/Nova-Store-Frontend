const TOKEN_KEY = "nova_token";

export const tokenStorage = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Ignorar si localStorage está deshabilitado
    }
  },
  removeToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignorar
    }
  },
  hasToken: () => {
    try {
      return Boolean(localStorage.getItem(TOKEN_KEY));
    } catch {
      return false;
    }
  },
};
