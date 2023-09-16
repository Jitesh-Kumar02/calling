import { getEnvVariable } from "./env";
import Auth0, { type SaveCredentialsParams } from "react-native-auth0";
import { fetch, defaultUrl } from "./fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { json } from "../../jest.config";
import { CallInvite } from "@twilio/voice-react-native-sdk";

export type loginParam = {
  username: string;
  password: string;
};

export type loginResponse = {
  name: string;
  userId: string;
  email: string;
  worker: string;
};

export type signupParam = {
  email: string;
  password: string;
  referredBy?: string;
  fullname: string;
  phoneNumber: string;
};

export type phoneResponseType = {
  blingPhoneNumber: string;
};

export type getProfileResType = {
  phone: string;
  playerId: string;
  clientId: string;
  image: string;
};

export type CallLog = {
  operatorName: string;
  toNumber: string;
  callType: string;
  recordUrl: string;
  customerNumber: string;
  id: string;
  startTime: string;
  endTime: string;
};

export function initializeAuth() {
  const domain = getEnvVariable("DOMAIN_NAME");
  const clientId = getEnvVariable("CLIENT_ID");

  const auth0 = new Auth0({
    domain,
    clientId,
  });

  const checkLoginStatus = async (params: loginParam) => {
    const authData = _paramsToString(params);
    const payload = await fetch(`${defaultUrl}/platform/login?${authData}`, {
      method: "POST",
    });
    const { data } = await payload.json();
    console.log("this is the reponse", data);
    if (data.status !== "success") {
      throw new Error("Failed to check login");
    }
    return data as loginResponse;
    // const { accessToken } = await auth0.credentialsManager.getCredentials();
    // const { email } = await auth0.auth.userInfo({ token: accessToken });
    // return {
    //   accessToken,
    //   email,
    // };
  };

  // const signup = async (params: signupParam) => {
  //   const {} = await fetch('platform/login', params);
  // }

  const _paramsToString = (params: any) => {
    if (!params || typeof params !== "object") {
      return "";
    }
    return Object.keys(params)
      .map((param) => `${param}=${params[param]}`)
      .join("&");
  };

  const login = async (params: loginParam) => {
    const authData = _paramsToString(params);
    console.log("login params", params);
    const res = await fetch(`${defaultUrl}/platform/login?${authData}`, {
      method: "POST",
    });
    const { data } = await res.json();
    console.log("this is the reponse", data);
    if (data.status !== "success") {
      throw new Error("Failed to Login");
    }
    return data;
  };

  //data handling client
  const getProfile = async (userId: string) => {
    const res = await fetch(`${defaultUrl}/client/${userId}`);
    const { data } = await res.json();
    return {
      phone: data.client.phoneNumber,
      playerId: data.client.playerId,
      clientId: data.client.id,
      image: data.image,
    } as getProfileResType;
  };

  // data handling phone
  const getPhone = async (userId: string) => {
    const res = await fetch(`${defaultUrl}/platform/clientPhone/${userId}`);
    const data = await res.json();
    return data as phoneResponseType;
  };

  const getCallLogs = async (userId: string) => {
    try {
      const res = await fetch(
        `${defaultUrl}/platform/callRecords/?clientId=${userId}`
      );
      const data = await res.json();

      if (!data) {
        throw new Error("Request Failed");
      }

      return data as [CallLog];
    } catch (e) {
      throw new Error("Request Failed");
    }
  };

  const signup = async (params: signupParam) => {
    const { ...signupData } = params;
    Object.assign(signupData, {
      plan: "free",
      mainPlan: "free",
      ipadd: null,
    });
    const authData = _paramsToString(signupData);
    console.log("signupData", authData);
    const payload = await fetch(`${defaultUrl}/platform/signup?${authData}`, {
      method: "POST",
    });
    console.log("payload from response", payload);
    const { data } = await payload.json();
    console.log("return data from auth", data);
    return data;
  };

  const logout = async () => {
    // await auth0.webAuth.clearSession({ federated: true });
    // await auth0.credentialsManager.clearCredentials();
    // Alert("In Progress");
  };

  //Verifies oneSignal device player-id and userId with backend
  const verifyPlayerId = async (
    playerId: string | undefined,
    userId: string
  ) => {
    const urlWithParams: any = new URL(
      "https://dashback.bling-test.xyz/phone/player"
    );
    urlWithParams.searchParams.append("playerId", playerId);
    urlWithParams.searchParams.append("userId", userId);
    fetch(urlWithParams, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        console.log("Store Player id to server response: ", response.status);
        if (response.status == 200) {
          console.log("verified player id", playerId);
          if (playerId) {
            await AsyncStorage.setItem("oneSignalId", playerId);
          }
        }
      })
      .catch((err) => {
        console.log("Store player Id Error: ", err);
      });
  };
  const rejectCall = async (clientId: string, confId: string) => {
    // const urlWithParams: any = new URL(`${defaultUrl}/platform/rejectCall`);
    // urlWithParams.searchParams.append("clientId", clientId);
    // urlWithParams.searchParams.append("confId", confId);
    // urlWithParams.searchParams.append("callType", "reject_incoming_call");

    const data = await fetch(`${defaultUrl}/platform/rejectCall`, {
      method: "POST",
      body: JSON.stringify({
        clientId,
        confId,
        callType: "reject_incoming_call",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await data.json();
    return res;
  };

  return {
    checkLoginStatus,
    login,
    logout,
    signup,
    getProfile,
    getCallLogs,
    getPhone,
    verifyPlayerId,
    rejectCall,
  };
}

export const auth = initializeAuth();
