import axios from "axios";
import TokenService from "./token.service";
import { User } from "./userProps";
import { AddOfflineRequest } from "./Utility";
import { Network } from "@capacitor/network";
import { Storage } from "@capacitor/storage";

const instance = axios.create({
  // timeout: 15000,
  timeoutErrorMessage: "Za długi czas oczekiwania",
  withCredentials: true,
  baseURL: "https://broccoliapi.ebert.link",
  // baseURL: "https://localhost:55931",
  headers: {
    "Content-Type": "application/json",
  },
});
instance.interceptors.request.use(
  async (config) => {
    const networkStatus = await Network.getStatus();
    if (
      !networkStatus.connected &&
      config.url &&
      config.method != "GET" &&
      config.method != "get" &&
      config.method
    ) {
      await AddOfflineRequest(config.url, config.method, config.data);
    }

    const token = await TokenService.getLocalAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = "Bearer " + token; // for Spring Boot back-end
    }
    return config;
  },
  async (error) => {
    console.log("request");
    console.log(error);
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
          if(!document.location.pathname.toLowerCase().startsWith("/login"))
          {
            window.location.replace("/login");
          }

          const { value } = await Storage.get({ key: "OfflineRequests" });
          await Storage.clear();
          if (value) {
            await Storage.set({
              key: "OfflineRequests",
              value: value,
            });
          }

          return Promise.reject(_error);
        }
      }
    }
    return Promise.reject(err);
  }
);
export default instance;
