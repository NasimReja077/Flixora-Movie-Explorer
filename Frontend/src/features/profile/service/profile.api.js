import api from "../../Shared/services/api.js";

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile = () =>
  api.get("/users/myProfile").then((r) => r.data.data);

export const updateProfile = (data) =>
  api.put("/users/profile", data).then((r) => r.data.data);

export const updatePassword = (data) =>
  api.put("/users/password", data).then((r) => r.data.data);

export const uploadAvatar = (formData) =>
  api
    .post("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data.data);

export const getPublicProfile = (userId) =>
  api.get(`/users/profile/${userId}`).then((r) => r.data.data);
