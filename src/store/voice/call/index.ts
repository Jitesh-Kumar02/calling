import {
  type Call as TwilioCall,
  type CallInvite as TwilioCallInvite,
  type CustomParameters,
} from "@twilio/voice-react-native-sdk";
import { type AsyncStoreSlice } from "../../app";

export type RecipientType = "client" | "number";

export type CallInfo = {
  sid?: string;
  state?: string;
  to?: string;
  from?: string;
  isMuted?: boolean;
  isOnHold?: boolean;
};

export const getCallInfo = (call: TwilioCall): CallInfo => {
  const sid = call.getSid();
  const state = call.getState();
  const to = call.getTo();
  const from = call.getFrom();

  const isMuted = Boolean(call.isMuted());
  const isOnHold = Boolean(call.isOnHold());

  return {
    sid,
    state,
    to,
    from,
    isMuted,
    isOnHold,
  };
};

export type CallInviteInfo = {
  callSid: string;
  customParameters: CustomParameters;
  from: string;
  state: string;
  to: string;
};

export const getCallInviteInfo = (
  callInvite: TwilioCallInvite
): CallInviteInfo => {
  const callSid = callInvite.getCallSid();
  const customParameters = callInvite.getCustomParameters();
  const from = callInvite.getFrom();
  const state = callInvite.getState();
  const to = callInvite.getTo();
  console.log(
    "these are the params coming",
    callSid,
    customParameters,
    from,
    state,
    to
  );
  // const { callSid, from, to } = callInvite;
  // const customParameters = {} as CustomParameters;
  // const state = "pending";
  // console.log("traspiling call invite configs", callInvite);
  return {
    callSid,
    customParameters,
    from,
    state,
    to,
  };
};

export type BaseCall = {
  /**
   * When a call is generated by a thunk action, such as accepting a call
   * invite or making an outgoing call, we use the "requestId" that the thunk
   * generated.
   *
   * In the case of a call that we receive from the native layer that is not
   * associated with a thunk, such as accepting a call invite through the
   * notification or an existing call, we use "nanoid" to generate an ID.
   *
   * In both scenarios, "nanoid" is used - the thunk action creator uses
   * "nanoid" by default under the hood.
   */
  id: string;
} & AsyncStoreSlice<{
  action: {
    disconnect: AsyncStoreSlice;
    hold: AsyncStoreSlice;
    mute: AsyncStoreSlice;
    sendDigits: AsyncStoreSlice;
  };
  initialConnectTimestamp: number | undefined;
  info: CallInfo;
}>;

export type IncomingCall = {
  direction: "incoming";
} & BaseCall;

export type OutgoingCall = {
  direction: "outgoing";
  recipientType: RecipientType;
  to: string;
} & BaseCall;