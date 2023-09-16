import { createSlice, type SerializedError } from "@reduxjs/toolkit";
import { match } from "ts-pattern";
import { getAccessToken } from "./voice/accessToken";
import { register } from "./voice/registration";
import { type AsyncStoreSlice } from "./app";
import { createTypedAsyncThunk, generateThunkActionTypes } from "./common";
import { login, logout, signup, profile } from "./user";

const sliceName = "authAndRegister" as const;

export type SignUpRegisterRejectValue =
  | {
      reason: "SIGNUP_REJECTED";
    }
  | {
      reason: "GET_ACCESS_TOKEN_REJECTED";
    }
  | {
      reason: "REGISTER_REJECTED";
    };

export type LoginAndRegisterRejectValue =
  | {
      reason: "LOGIN_REJECTED";
    }
  | {
      reason: "GET_ACCESS_TOKEN_REJECTED";
    }
  | {
      reason: "REGISTER_REJECTED";
    };

const loginAndRegisterActionTypes = generateThunkActionTypes(
  `${sliceName}/loginAndRegister`
);

export const loginAndRegister = createTypedAsyncThunk<
  void,
  { username: string; password: string },
  {
    rejectValue: LoginAndRegisterRejectValue;
  }
>(
  loginAndRegisterActionTypes.prefix,
  async (params, { dispatch, rejectWithValue }) => {
    console.log("login and dispatch");
    const loginActionResult = await dispatch(login(params));
    if (login.rejected.match(loginActionResult)) {
      return rejectWithValue({ reason: "LOGIN_REJECTED" });
    }

    const getAccessTokenResult = await dispatch(getAccessToken());
    if (getAccessToken.rejected.match(getAccessTokenResult)) {
      await dispatch(logout());
      return rejectWithValue({
        reason: "GET_ACCESS_TOKEN_REJECTED",
      });
    }
    console.log("Get Access Token---: ", getAccessTokenResult);

    // const registerActionResult = await dispatch(register());
    // if (register.rejected.match(registerActionResult)) {
    //   return rejectWithValue({ reason: "REGISTER_REJECTED" });
    // }
    //console.log("register account result ---: ", getAccessTokenResult);
  }
);

const signupAndRegisterActionTypes = generateThunkActionTypes(
  `${sliceName}/signupAndRegister`
);

export const signupAndRegister = createTypedAsyncThunk<
  void,
  {
    fullname: string;
    password: string;
    email: string;
    referredBy: string;
    phoneNumber: string;
  },
  {
    rejectValue: SignUpRegisterRejectValue;
  }
>(
  signupAndRegisterActionTypes.prefix,
  async (params, { dispatch, rejectWithValue }) => {
    const signupActionResult = await dispatch(signup(params));
    if (signup.rejected.match(signupActionResult)) {
      return rejectWithValue({ reason: "SIGNUP_REJECTED" });
    }

    const getAccessTokenResult = await dispatch(getAccessToken());
    if (getAccessToken.rejected.match(getAccessTokenResult)) {
      await dispatch(logout());
      return rejectWithValue({
        reason: "GET_ACCESS_TOKEN_REJECTED",
      });
    }

    const registerActionResult = await dispatch(register());
    if (register.rejected.match(registerActionResult)) {
      return rejectWithValue({ reason: "REGISTER_REJECTED" });
    }
  }
);

type LoginAndRegisterSlice = {
  action: "loginAndRegister" | "signupAndRegister";
} & AsyncStoreSlice<
  {},
  | LoginAndRegisterRejectValue
  | { error: SerializedError; reason: "UNEXPECTED_ERROR" }
>;

export const loginAndRegisterSlice = createSlice({
  name: sliceName,
  initialState: { status: "idle" } as LoginAndRegisterSlice,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(loginAndRegister.pending, () => ({
      status: "pending",
      action: "loginAndRegister",
    }));

    builder.addCase(loginAndRegister.fulfilled, () => ({
      action: "loginAndRegister",
      status: "fulfilled",
    }));

    builder.addCase(loginAndRegister.rejected, (_, action) => {
      const { requestStatus } = action.meta;
      const actionType = "loginAndRegister" as const;

      return match(action.payload)
        .with(
          { reason: "LOGIN_REJECTED", action: actionType },
          { reason: "GET_ACCESS_TOKEN_REJECTED", action: actionType },
          { reason: "REGISTER_REJECTED", action: actionType },
          ({ reason }) => ({
            status: requestStatus,
            reason,
            action: actionType,
          })
        )
        .with(undefined, () => ({
          status: requestStatus,
          error: action.error,
          reason: "UNEXPECTED_ERROR" as const,
          action: actionType,
        }))
        .exhaustive();
    });
  },
});
