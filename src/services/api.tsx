import axios from "axios";
import tokenService from "./token.service";
import TokenService from "./token.service";
import { User } from "./userProps";

const instance = axios.create({
  withCredentials: true,
  baseURL: "https://broccoliapi.azurewebsites.net",
  // baseURL: "https://localhost:55931",
  headers: {
    "Content-Type": "application/json",
  },
});
instance.interceptors.request.use(
  async (config) => {
    const token = await TokenService.getLocalAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = "Bearer " + token; // for Spring Boot back-end
      // config.headers["x-access-token"] = token; // for Node.js Express back-end
    }
    return config;
  },
  async (error) => {
    return Promise.reject(error);
  }
);
instance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;
    if (originalConfig.url !== "/accounts/authenticate" && err.response) {
      // Access Token was expired
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;
        try {
          const rs = await instance.post("/accounts/refresh-token");
          const { jwtToken } = rs.data as User;
          console.log("jwtToken " + jwtToken);
          await TokenService.updateLocalAccessToken(jwtToken);
          return instance(originalConfig);
        } catch (_error) {
          // await tokenService.removeUser();
          window.location.replace("/login");
          return Promise.reject(_error);
        }
      }
    }
    return Promise.reject(err);
  }
);
export default instance;
