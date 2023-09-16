import {
  createSlice,
  miniSerializeError,
  type SerializedError,
} from "@reduxjs/toolkit";
import { match } from "ts-pattern";
import { type AsyncStoreSlice } from "./app";
import { createTypedAsyncThunk, generateThunkActionTypes } from "./common";
import { auth, loginParam, loginResponse, CallLog } from "../util/auth";
import { settlePromise } from "../util/settlePromise";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const sliceName = "user" as const;

/**
 * Reusable type for all actions.
 */
export type RejectValue = {
  reason: "AUTH_REJECTED";
  error: SerializedError;
};

/**
 * Login action.
 */

export const loginActionTypes = generateThunkActionTypes(`${sliceName}/login`);
export const signupActionTypes = generateThunkActionTypes(
  `${sliceName}/signup`
);
export const login = createTypedAsyncThunk<
  loginResponse,
  { username: string; password: string },
  { rejectValue: RejectValue }
>(loginActionTypes.prefix, async (params, { rejectWithValue }) => {
  const loginResult = await settlePromise(auth.login(params));
  console.log("LOGIN ERROR -", loginResult);
  if (loginResult.status === "rejected") {
    return rejectWithValue({
      reason: "AUTH_REJECTED",
      error: miniSerializeError(loginResult.reason),
    });
  }
  // set token to async storage to fetch for checkLoginStatus
  await AsyncStorage.setItem(
    "user",
    JSON.stringify({ username: params.username, password: params.password })
  );
  return loginResult.value;
});

export const signup = createTypedAsyncThunk<
  loginResponse,
  {
    fullname: string;
    password: string;
    referredBy: string;
    email: string;
    phoneNumber: string;
  },
  { rejectValue: RejectValue }
>(signupActionTypes.prefix, async (params, { rejectWithValue }) => {
  const signUpResult = await settlePromise(auth.signup(params));
  console.log("SIGNUP ERROR -", signUpResult);
  if (signUpResult.status === "rejected") {
    return rejectWithValue({
      reason: "AUTH_REJECTED",
      error: miniSerializeError(signUpResult.reason),
    });
  }
  return signUpResult.value;
});

/**
 * Logout action.
 */
export const logoutActionTypes = generateThunkActionTypes(
  `${sliceName}/logout`
);
export const logout = createTypedAsyncThunk<
  void,
  void,
  { rejectValue: RejectValue }
>(logoutActionTypes.prefix, async (_, { rejectWithValue }) => {
  await AsyncStorage.removeItem("user");
  const clearSessionResult = await settlePromise(auth.logout());
  if (clearSessionResult.status === "rejected") {
    return rejectWithValue({
      reason: "AUTH_REJECTED",
      error: miniSerializeError(clearSessionResult.reason),
    });
  }
});

/**
 * User slice configuration.
 */
type UserRejectState = RejectValue | { error: SerializedError };

export interface UserStoreData {
  name?: string;
  userId?: string;
  phone?: string;
  email?: string;
  worker?: string;
}

export type UserState = {
  action: "checkLoginStatus" | "signup" | "login" | "logout" | "callLogs";
} & AsyncStoreSlice<UserStoreData, UserRejectState>;

export const userSlice = createSlice({
  name: "user",
  initialState: { status: "idle" } as UserState,
  reducers: {},
  extraReducers: (builder) => {
    /**
     * Check login action handling.
     */

    builder.addCase(signup.pending, () => {
      return { action: "signup", status: "pending" };
    });

    builder.addCase(signup.fulfilled, (state, action) => {
      return {
        action: "signup",
        status: "fulfilled",
        email: action.payload.email,
        name: action.payload.name,
        worker: action.payload.worker,
        userId: action.payload.userId,
      };
    });

    builder.addCase(signup.rejected, (_, action) => {
      const actionType = "signup" as const;

      const { requestStatus } = action.meta;

      return match(action.payload)
        .with({ reason: "AUTH_REJECTED" }, ({ reason, error }) => ({
          action: actionType,
          status: requestStatus,
          reason,
          error,
        }))
        .with(undefined, () => ({
          action: actionType,
          status: requestStatus,
          error: action.error,
        }))
        .exhaustive();
    });
    /**
     * Login action handling.
     */
    builder.addCase(login.pending, () => {
      return { action: "login", status: "pending" };
    });

    builder.addCase(login.fulfilled, (state, action) => {
      return {
        action: "login",
        status: "fulfilled",
        email: action.payload.email,
        name: action.payload.name,
        worker: action.payload.worker,
        userId: action.payload.userId,
      };
    });

    builder.addCase(login.rejected, (_, action) => {
      const actionType = "login" as const;

      const { requestStatus } = action.meta;

      return match(action.payload)
        .with({ reason: "AUTH_REJECTED" }, ({ reason, error }) => ({
          action: actionType,
          status: requestStatus,
          reason,
          error,
        }))
        .with(undefined, () => ({
          action: actionType,
          status: requestStatus,
          error: action.error,
        }))
        .exhaustive();
    });

    /**
     * Signup action handling
     */
    //builder.addCase()

    /**
     * Logout action handling.
     */
    builder.addCase(logout.pending, () => {
      return { action: "logout", status: "pending" };
    });
    builder.addCase(logout.fulfilled, () => {
      return {
        action: "logout",
        status: "idle",
        email: "",
      };
    });
    // builder.addCase(profile.fulfilled, (state, action) => {
    //   return {
    //     ...state,
    //     action: "profile",
    //     status: "fulfilled",
    //     phone: action.payload.phone,
    //   };
    // });
    builder.addCase(logout.rejected, (_, action) => {
      const actionType = "logout" as const;

      const { requestStatus } = action.meta;

      return match(action.payload)
        .with({ reason: "AUTH_REJECTED" }, ({ reason, error }) => ({
          action: actionType,
          status: requestStatus,
          reason,
          error,
        }))
        .with(undefined, () => ({
          action: actionType,
          status: requestStatus,
          error: action.error,
        }))
        .exhaustive();
    });
  },
});
