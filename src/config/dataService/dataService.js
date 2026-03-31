import axios from 'axios';
import { getItem } from '../../utility/localStorageControl';
import Cookies from "js-cookie";

const API_ENDPOINT = `${process.env.REACT_APP_API_ENDPOINT}/api/v1`;

// const getAuthToken = () => {
//   const role = getItem("auth_role");

//   if (role === "admin") {
//     return getItem("admin_token");
//   }

//   if (role === "organizer") {
//     return getItem("organizer_token");
//   }

//   return null;
// };

const getAuthToken = () => {
  let token = null;

  if (Cookies.get("admin_token")) {
    token = Cookies.get("admin_token");
  } else if (Cookies.get("organizer_token")) {
    token = Cookies.get("organizer_token");
  } else if (Cookies.get("customer_token")) {
    token = Cookies.get("customer_token");
  }

  return token;
};

const getRoleFromCookies = () => {
  if (Cookies.get("admin_token")) return "admin";
  if (Cookies.get("organizer_token")) return "organizer";
  if (Cookies.get("customer_token")) return "customer";
  return null;
};

const authHeader = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
});

const client = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  },
});

class DataService {
  static get(path = '') {
    return client({
      method: 'GET',
      url: path,
      headers: { ...authHeader() },
    });
  }

  static post(path = '', data = {}, optionalHeader = {}) {
    return client({
      method: 'POST',
      url: path,
      data,
      headers: { ...authHeader(), ...optionalHeader },
    });
  }

  static patch(path = '', data = {}) {
    return client({
      method: 'PATCH',
      url: path,
      data: JSON.stringify(data),
      headers: { ...authHeader() },
    });
  }

  static put(path = '', data = {}) {
    return client({
      method: 'PUT',
      url: path,
      data: JSON.stringify(data),
      headers: { ...authHeader() },
    });
  }
}

/**
 * axios interceptors runs before and after a request, letting the developer modify req,req more
 * For more details on axios interceptor see https://github.com/axios/axios#interceptors
 */
client.interceptors.request.use((config) => {
  // do something before executing the request
  // For example tag along the bearer access token to request header or set a cookie
  const requestConfig = config;
  const { headers } = config;
  requestConfig.headers = { ...headers, Authorization: `Bearer ${getAuthToken()}` };

  return requestConfig;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    /**
     * Do something in case the response returns an error code [3**, 4**, 5**] etc
     * For example, on token expiration retrieve a new access token, retry a failed request etc
     */
    const { response } = error;
    const originalRequest = error.config;
    if (response) {
      if (response.status === 500) {
        // do something here
      } else {
        return originalRequest;
      }
    }
    return Promise.reject(error);
  },
);
export { DataService };