import { configureStore, type Middleware } from "@reduxjs/toolkit";
import { voiceReducer } from "./voice";
import { userSlice } from "./user";
import { loginAndRegisterSlice } from "./loginAndRegister";
import { callLogSlice } from "./callLogs";
import { profileSlice } from "./profile";
export const logActionType: Middleware = () => (next) => (action) => {
  console.log(
    action.type.match(/\/rejected$/g)
      ? `${action.type} ${JSON.stringify(
          action.error || action.payload,
          null,
          2
        )}`
      : action.type
  );

  return next(action);
};

export const createStore = (...middlewares: Middleware[]) =>
  configureStore({
    reducer: {
      [userSlice.name]: userSlice.reducer,
      [loginAndRegisterSlice.name]: loginAndRegisterSlice.reducer,
      voice: voiceReducer,
      [callLogSlice.name]: callLogSlice.reducer,
      [profileSlice.name]: profileSlice.reducer,
    },
    middleware(getDefaultMiddleware) {
      return getDefaultMiddleware().concat(...middlewares);
    },
  });

export const defaultStore = createStore(logActionType);

export type Store = ReturnType<typeof createStore>;

export type State = ReturnType<Store["getState"]>;

export type Dispatch = Store["dispatch"];

export type AsyncStoreSlice<R = {}, S = {}, T = {}, U = {}> =
  | ({ status: "fulfilled" } & R)
  | ({ status: "rejected" } & S)
  | ({ status: "pending" } & T)
  | ({ status: "idle" } & U);
