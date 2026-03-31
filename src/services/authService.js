import API from "./api";

export const registerUser = async (data) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

export const verifyRegisterOtp = async (data) => {
  const res = await API.post("/auth/verify-register-otp", data);
  return res.data;
};


export const loginUser = async (data) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};

export const verifyLoginOtp = async (data) => {
  const res = await API.post("/auth/verify-login-otp", data);
  return res.data;
};

export const resendOtp = async (data) => {
  const res = await API.post("/auth/resend-otp", data);
  return res.data;
};

