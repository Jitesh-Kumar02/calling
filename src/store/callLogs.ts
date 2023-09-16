import {
  createSlice,
  miniSerializeError,
  type SerializedError,
} from "@reduxjs/toolkit";
import { match } from "ts-pattern";
import { getAccessToken } from "./voice/accessToken";
import { register } from "./voice/registration";
import { type AsyncStoreSlice } from "./app";
import { createTypedAsyncThunk, generateThunkActionTypes } from "./common";
import { login, logout, signup, profile } from "./user";
import { CallLog, auth } from "../util/auth";
import { settlePromise } from "../util/settlePromise";
import { State } from "react-native-gesture-handler";

const sliceName = "callLogs" as const;

export type CallLogsRejected = {
  reason: "LOGS_REJECTED";
  error: SerializedError;
};

const userCallLogType = generateThunkActionTypes(`${sliceName}/getLogs`);

export const getLogs = createTypedAsyncThunk<
  [CallLog],
  void,
  { rejectValue: CallLogsRejected }
>(userCallLogType.prefix, async (_, { getState, rejectWithValue }) => {
  const userData = getState().user;
  if (userData.status !== "fulfilled" && userData.userId) {
    rejectWithValue({
      reason: "LOGS_REJECTED",
      error: miniSerializeError("Login Error"),
    });
  }
  const userId = userData.userId;

  const callLogResult = await settlePromise(auth.getCallLogs(userId));

  if (callLogResult.status !== "fulfilled") {
    rejectWithValue({
      reason: "LOGS_REJECTED",
      error: miniSerializeError("Log Fetch Error"),
    });
  }
  return callLogResult.value;
});

interface CallLogStoreType {
  callLogs?: Array<CallLog> | [];
}

type CallLogSlice = {
  action: "getLogs";
} & AsyncStoreSlice<
  CallLogStoreType,
  CallLogsRejected | { error: SerializedError; reason: "UNEXPECTED_ERROR" }
>;

export const callLogSlice = createSlice({
  name: sliceName,
  initialState: { status: "idle" } as CallLogSlice,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getLogs.pending, (state) => {
      return {
        ...state,
        status: "pending",
        action: "getLogs",
      };
    });
    builder.addCase(getLogs.fulfilled, (state, action) => {
      return {
        status: "fulfilled",
        action: "getLogs",
        callLogs: action.payload,
      };
    });
    builder.addCase(getLogs.rejected, (state, action) => {
      const requestStatus = action.meta;
      const actionType = action.type;
      return match(action.payload)
        .with(
          { reason: "LOGS_REJECTED", action: actionType },
          ({ reason }) => ({
            action: actionType,
            status: requestStatus,
            reason,
            error: action.error,
          })
        )
        .with(undefined, () => ({
          action: actionType,
          status: requestStatus,
          error: action.error,
        }))
        .exhaustive();
    });
  },
});
