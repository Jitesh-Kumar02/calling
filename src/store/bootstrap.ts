import { miniSerializeError, type SerializedError } from "@reduxjs/toolkit";
import {
  Voice,
  Call as TwilioCall,
  CallInvite as TwilioCallInvite,
} from "@twilio/voice-react-native-sdk";
import { createTypedAsyncThunk, generateThunkActionTypes } from "./common";
import { handleCall } from "./voice/call/activeCall";
import { receiveCallInvite, removeCallInvite } from "./voice/call/callInvite";
import { getNavigate } from "../util/navigation";
import { settlePromise } from "../util/settlePromise";
import { voice } from "../util/voice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginAndRegister } from "./loginAndRegister";
import OneSignal from "react-native-onesignal";
import Sound from "react-native-sound";
/**
 * Bootstrap user action. Gets the login-state of the user, and if logged in
 * get an access token and register the user for incoming calls.
 */
export type BootstrapUserRejectValue =
  | {
      reason: "CHECK_LOGIN_STATUS_REJECTED";
    }
  | {
      reason: "GET_ACCESS_TOKEN_REJECTED";
    }
  | {
      reason: "REGISTER_REJECTED";
    };
export type BootstrapUserFulfillValue = "NOT_LOGGED_IN" | "LOGGED_IN";
export const bootstrapUserActionTypes =
  generateThunkActionTypes("bootstrap/user");
export const bootstrapUser = createTypedAsyncThunk<
  BootstrapUserFulfillValue,
  void,
  { rejectValue: BootstrapUserRejectValue }
>(bootstrapUserActionTypes.prefix, async (_, { dispatch, rejectWithValue }) => {
  const storedParam = await AsyncStorage.getItem("user");

  if (!storedParam) {
    return rejectWithValue({ reason: "CHECK_LOGIN_STATUS_REJECTED" });
  }
  const param = JSON.parse(storedParam || "") as {
    username: string;
    password: string;
  };
  const checkLoginStatusResult = await dispatch(loginAndRegister(param));

  if (loginAndRegister.rejected.match(checkLoginStatusResult)) {
    return rejectWithValue({ reason: "CHECK_LOGIN_STATUS_REJECTED" });
  }

  // const getAccessTokenResult = await dispatch(getAccessToken());
  // if (getAccessToken.rejected.match(getAccessTokenResult)) {
  //   return rejectWithValue({ reason: "GET_ACCESS_TOKEN_REJECTED" });
  // }

  // const registerResult = await dispatch(register());
  // if (register.rejected.match(registerResult)) {
  //   return rejectWithValue({ reason: "REGISTER_REJECTED" });
  // }

  return "LOGGED_IN";
});

/**
 * Bootstrap call invites. Retreives all existing call invites.
 */
export type BootstrapCallInvitesRejectValue = {
  reason: "NATIVE_MODULE_REJECTED";
  error: SerializedError;
};
export const bootstrapCallInvitesActionTypes = generateThunkActionTypes(
  "bootstrap/callInvites"
);
export const bootstrapCallInvites = createTypedAsyncThunk<
  void,
  void,
  { rejectValue: BootstrapCallInvitesRejectValue }
>(
  bootstrapCallInvitesActionTypes.prefix,
  async (_, { dispatch, getState, rejectWithValue }) => {
    /**
     * Handle an incoming, pending, call invite.
     */
    const handlePendingCallInvite = async (callInvite: TwilioCallInvite) => {
      console.log("handle pending call");
      await dispatch(receiveCallInvite(callInvite));
    };
    voice.on(Voice.Event.CallInvite, handlePendingCallInvite);

    /**
     * Handle the settling of a pending call invite.
     */
    const handleSettledCallInvite = (callInvite: TwilioCallInvite) => {
      const callSid = callInvite.getCallSid();

      const callInviteEntities = getState().voice.call.callInvite.entities;
      const callInviteEntity = Object.values(callInviteEntities).find(
        (entity) => {
          if (typeof entity === "undefined") {
            return false;
          }
          return entity.info.callSid === callSid;
        }
      );
      if (typeof callInviteEntity === "undefined") {
        return;
      }

      dispatch(removeCallInvite(callInviteEntity.id));
    };

    voice.on(
      Voice.Event.CallInviteAccepted,
      (callInvite: TwilioCallInvite, call: TwilioCall) => {
        // dispatch the new call
        dispatch(handleCall({ call }));
        handleSettledCallInvite(callInvite);

        const navigate = getNavigate();
        if (!navigate) {
          return;
        }
        const callSid = callInvite.getCallSid();
        navigate("Call", { callSid });
      }
    );

    voice.on(Voice.Event.CallInviteRejected, (callInvite: TwilioCallInvite) => {
      handleSettledCallInvite(callInvite);
    });

    voice.on(
      Voice.Event.CancelledCallInvite,
      (callInvite: TwilioCallInvite) => {
        handleSettledCallInvite(callInvite);
      }
    );

    /**
     * Handle existing pending call invites.
     */
    const callInvitesResult = await settlePromise(voice.getCallInvites());
    if (callInvitesResult.status === "rejected") {
      return rejectWithValue({
        reason: "NATIVE_MODULE_REJECTED",
        error: miniSerializeError(callInvitesResult.reason),
      });
    }

    const callInvites = callInvitesResult.value;
    for (const callInvite of callInvites.values()) {
      handlePendingCallInvite(callInvite);
    }
  }
);

/**
 * Bootstrap calls. Retrieves all existing calls.
 *
 * TODO(mhuynh):
 * Re-evaluate the "active calls" map that we use on the native layer. There
 * really only should be one active call, the Android/iOS SDKs do not support
 * multiple active calls.
 */
export type BootstrapCallsRejectValue = {
  reason: "NATIVE_MODULE_REJECTED";
  error: SerializedError;
};
export const bootstrapCallsActionTypes =
  generateThunkActionTypes("bootstrap/call");
export const bootstrapCalls = createTypedAsyncThunk<
  void,
  void,
  { rejectValue: BootstrapCallsRejectValue }
>(
  bootstrapCallsActionTypes.prefix,
  async (_, { dispatch, rejectWithValue }) => {
    const callsResult = await settlePromise(voice.getCalls());
    if (callsResult.status === "rejected") {
      return rejectWithValue({
        reason: "NATIVE_MODULE_REJECTED",
        error: miniSerializeError(callsResult.reason),
      });
    }
    console.log("handling calls", callsResult);
    const calls = callsResult.value;
    for (const call of calls.values()) {
      await dispatch(handleCall({ call }));
    }
  }
);

/**
 * Bootstrap proper screen. Navigate to the proper screen depending on
 * application state.
 *
 * For example, navigate to the call invite screen when there are call invites.
 */
export const bootstrapNavigationActionTypes = generateThunkActionTypes(
  "bootstrap/navigation"
);
export const bootstrapNavigation = createTypedAsyncThunk(
  bootstrapNavigationActionTypes.prefix,
  (_, { getState }) => {
    const state = getState();

    const navigate = getNavigate();
    if (typeof navigate === "undefined") {
      return;
    }

    if (state.voice.call.activeCall.ids.length) {
      navigate("Call", {});
      return "Call";
    }
  }
);

export const bootstarapOneSignalType = generateThunkActionTypes(
  "bootstrap/oneSignal"
);
export const bootstrapOneSignal = createTypedAsyncThunk(
  bootstarapOneSignalType.prefix,
  async (_, { getState, dispatch }) => {
    const user = getState().user;
    const profile = getState().profile;
    // if (user.status !== "fulfilled" || profile.status !== "fulfilled") {
    //   console.log("not fullfilled profile and user in notification");
    //   throw new Error("error");
    // }
    OneSignal.setAppId("861eca4f-c15f-429a-ae70-63a9b18e161f");

    OneSignal.setLogLevel(6, 0);

    var whoosh: any;
    // promptForPushNotificationsWithUserResponse will show the native iOS or Android notification permission prompt.
    // We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step 8)
    OneSignal.promptForPushNotificationsWithUserResponse();

    //const soundFile = require("../../assets/ringg.wav");

    // Method for handling notifications received while app in foreground
    OneSignal.setNotificationWillShowInForegroundHandler(
      async (notificationReceivedEvent) => {
        // console.log(
        //   'OneSignal: notification will show in foreground:',
        //   notificationReceivedEvent,
        // );
        let notification = notificationReceivedEvent.getNotification();
        const data = notification.body;
        // await dispatch(receiveCallInvite({
        //   callSid: ,
        //   from,
        //   to,
        //   state
        // }));
        console.log("body of the notification: ", data, notification);
        // voice.connect(token.value, {
        //   params: {
        //     To: `+${to}`,
        //     recipientType,
        //     uuId: conferenceId,
        //     outbound: "true",
        //     clientId: userData.userId,
        //     name: userData.name,
        //     operatorId: userData.userId,
        //     // blingNumber: userData.number ? `+${userData.number}` : `+14706135214`,
        //     blingNumber: `+${phone}`,
        //     From: `+${phone}`,
        //   },
        // });
        if (data === "incoming_call") {
          //PLAYING SOUND FROM HERE
          Sound.setCategory("Playback");
          whoosh = new Sound("ringg.wav", Sound.MAIN_BUNDLE, (error) => {
            if (error) {
              // console.log('failed to load the sound', error);
              return;
            }
            // loaded successfully
            // console.log(
            //   "duration in seconds: " +
            //     whoosh.getDuration() +
            //     "number of channels: " +
            //     whoosh.getNumberOfChannels()
            // );
            // Play the sound with an onEnd callback
            whoosh.play(() => {
              // if (success) {
              //   console.log('successfully finished playing');
              // } else {
              //   console.log('playback failed due to audio decoding errors');
              // }
            });
          });
          //PLAYING SOUND TILL HERE
        }

        // console.log('notification: ', notification);
        notificationReceivedEvent.complete(notification);
      }
    );

    OneSignal.setNotificationOpenedHandler((notification) => {
      const data = notification.notification.body;
      console.log("OneSignal: notification opened:", notification);
      if (data === "incoming_call") {
        whoosh.stop(() => {
          // console.log("STOPPED");
        });
      }

      const navigate = getNavigate();
      if (typeof navigate === "undefined") {
        return;
      }
      navigate("Incoming Call");
      return "Call";
    });

    //verify the device with user Id,
  }
);
