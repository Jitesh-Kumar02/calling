import { miniSerializeError, type SerializedError } from "@reduxjs/toolkit";
import { Call as TwilioCall } from "@twilio/voice-react-native-sdk";
import { voice, callMap } from "../../../util/voice";
import { settlePromise } from "../../../util/settlePromise";
import { createTypedAsyncThunk, generateThunkActionTypes } from "../../common";
import { type CallInfo, getCallInfo, type RecipientType } from "./";
import { connectEvent, setActiveCallInfo } from "./activeCall";

export type MakeOutgoingCallRejectValue =
  | {
      reason: "TOKEN_UNFULFILLED";
    }
  | {
      reason: "NATIVE_MODULE_REJECTED";
      error: SerializedError;
    }
  | {
      reason: "PROFILE_NOT_SETUP";
    };
export const makeOutgoingCallActionTypes =
  generateThunkActionTypes("call/makeOutgoing");
export const makeOutgoingCall = createTypedAsyncThunk<
  CallInfo,
  { recipientType: RecipientType; to: string },
  { rejectValue: MakeOutgoingCallRejectValue }
>(
  makeOutgoingCallActionTypes.prefix,
  async (
    { to, recipientType },
    { getState, dispatch, rejectWithValue, requestId }
  ) => {
    const token = getState().voice.accessToken;
    const userData = getState().user;
    const profile = getState().profile;
    if (token?.status !== "fulfilled") {
      return rejectWithValue({ reason: "TOKEN_UNFULFILLED" });
    }
    const conferenceId =
      (await Math.random().toString(36).slice(2)) +
      Math.random().toString(36).slice(8);
    if (profile.status !== "fulfilled") {
      return rejectWithValue({ reason: "PROFILE_NOT_SETUP" });
    }
    const phone = profile.phone;
    // console.log('OUTBOUND EXTRA HEADER', {
    //   To: `+${to}`,
    //   customer: `+${to}`,
    //   recipientType,
    //   confId: conferenceId,
    //   outbound: true,
    //   clientId: userData.userId,
    //   name: userData.name,
    //   operatorId: 602,
    // });

    // const requestBody = {
    //   To: `+${to}`,
    //   customer: `+${to}`,
    //   recipientType,
    //   confId: conferenceId,
    //   outbound: true,
    //   clientId: 602,
    //   // clientId: userData.userId,
    //   name: userData.name,
    //   // blingNumber: userData.number ? `+${userData.number}` : `+14706135214`,
    //   blingNumber: `+14706135214`,
    //   operatorId: 602,
    // };

    // console.log('requestBody', requestBody);

    try {
      const response = await fetch(
        "https://dashback.bling-test.xyz/platform/twilio/outgoing",
        // 'https://d8e2-2600-1700-5ab0-dc70-9ff-3fae-69-252.ngrok-free.app/platform/twilio/outgoing',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body: `To=+${to}&customer=+${to}&confId=${conferenceId}&outbound=true&clientId=${userData?.userId}&name=${userData?.name}&blingNumber=+${phone}&operatorId=${userData.userId}`,
        }
      );

      console.log("response_response", response);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to call /platform/twilio/outgoing", error);
      return rejectWithValue({
        reason: "API_CALL_FAILED",
        error: miniSerializeError(error),
      });
    }
    // console.log("these are the param", {
    //   To: `+${to}`,
    //   recipientType,
    //   uuId: conferenceId,
    //   outbound: true,
    //   clientId: userData.userId,
    //   name: userData.name,
    //   operatorId: userData.userId,
    //   // blingNumber: userData.number ? `+${userData.number}` : `+14706135214`,
    //   blingNumber: `+${phone}`,
    //   From: `+${phone}`,
    // });
    const outgoingCallResult = await settlePromise(
      voice.connect(token.value, {
        params: {
          To: `+${to}`,
          recipientType,
          uuId: conferenceId,
          outbound: "true",
          clientId: userData.userId,
          name: userData.name,
          operatorId: userData.userId,
          // blingNumber: userData.number ? `+${userData.number}` : `+14706135214`,
          blingNumber: `+${phone}`,
          From: `+${phone}`,
        },
      })
    );

    console.log("outgoingCallResult", outgoingCallResult);
    // console.log('outgoingCallResult.value', outgoingCallResult.value);

    if (outgoingCallResult.status === "rejected") {
      return rejectWithValue({
        reason: "NATIVE_MODULE_REJECTED",
        error: miniSerializeError(outgoingCallResult.reason),
      });
    }

    const outgoingCall = outgoingCallResult.value;

    const callInfo = getCallInfo(outgoingCall);
    callMap.set(requestId, outgoingCall);

    outgoingCall.on(TwilioCall.Event.ConnectFailure, (error) =>
      console.error("ConnectFailure:", error)
    );
    outgoingCall.on(TwilioCall.Event.Reconnecting, (error) =>
      console.error("Reconnecting:", error)
    );
    outgoingCall.on(TwilioCall.Event.Disconnected, (error) => {
      // The type of error here is "TwilioError | undefined".
      if (error) {
        console.error("Disconnected:", error);
      }
    });

    Object.values(TwilioCall.Event).forEach((callEvent) => {
      outgoingCall.on(callEvent, () => {
        dispatch(
          setActiveCallInfo({ id: requestId, info: getCallInfo(outgoingCall) })
        );
      });
    });

    outgoingCall.once(TwilioCall.Event.Connected, () => {
      dispatch(connectEvent({ id: requestId, timestamp: Date.now() }));
    });

    return callInfo;
  }
);
