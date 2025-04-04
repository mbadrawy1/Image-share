// filepath: d:\my_recipes-main\ImageShare\image-share\src\config\urls.js
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log("API URL being used:", apiUrl);
export const API_URL = apiUrl;
// Use a direct reference to static folder for images
export const IMAGE_BASE_URL = `${API_URL}/uploads`;

export const REGISTER_URL = "account/register";
export const LOGIN_URL = "account/login";
export const PROFILE_URL = "account/profile";
export const PROFILE_UPDATE_URL = "account/profile/update";
export const UPLOAD_USER_PHOTO = "account/profile/upload-photo";
export const GET_ALL_POSTS = "posts";
export const GET_MY_POSTS = "my-posts";
export const CREATE_POST = "posts/create";
export const DELETE_POST = "my-posts/delete";
