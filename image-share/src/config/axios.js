import axios from "axios";
import { API_URL } from "./urls";

const instance = axios.create({
  baseURL: API_URL,
  responseType: "json",
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    console.log(
      `[API Request] ${config.method.toUpperCase()} ${config.baseURL}${
        config.url
      }`,
      config.data || config.params
    );
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log(
      `[API Response] ${
        response.status
      } ${response.config.method.toUpperCase()} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `[API Error] ${
          error.response.status
        } ${error.config.method.toUpperCase()} ${error.config.url}`,
        error.response.data
      );
    } else if (error.request) {
      console.error("[API No Response]", error.request);
    } else {
      console.error("[API Setup Error]", error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
