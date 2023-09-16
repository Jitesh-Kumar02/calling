import { type CompositeNavigationProp } from "@react-navigation/native";
import {
  type NativeStackScreenProps,
  type NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import {
  type BottomTabScreenProps,
  type BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";
import React from "react";

export type StackParamList = {
  Call: { callSid?: string };
  App: undefined;
  "Sign In": undefined;
  "Incoming Call": undefined;
  Auth: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Welcome: {};
};
export type DrawerParamList = {
  "Incoming Call": undefined;
  Call: { callSid?: string };
  App: undefined;
  "Call History": undefined;
};

export type StackScreenProps<T extends keyof StackParamList> =
  NativeStackScreenProps<StackParamList, T>;

export type TabParamList = {
  Home: undefined;
  Dialer: undefined;
  About: undefined;
};

export type TabNavScreenProps<T extends keyof TabParamList> =
  BottomTabScreenProps<TabParamList, T>;

export type StackNavigationProp<T extends keyof StackParamList> =
  CompositeNavigationProp<
    NativeStackNavigationProp<StackParamList, T>,
    BottomTabNavigationProp<TabParamList>
  >;
