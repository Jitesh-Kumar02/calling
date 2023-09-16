import { generateThunkActionTypes, createTypedAsyncThunk } from "./common";
import {
  SerializedError,
  miniSerializeError,
  createSlice,
} from "@reduxjs/toolkit";
import { settlePromise } from "../util/settlePromise";
import { auth } from "../util/auth";
import { AsyncStoreSlice } from "./app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OneSignal from "react-native-onesignal";
const sliceName = "profile" as const;
import { getNavigate } from "../util/navigation";
import { receiveCallInvite } from "./voice/call/callInvite";

import Sound from "react-native-sound";
import { CallInvite } from "@twilio/voice-react-native-sdk";

const profileActionTypes = generateThunkActionTypes(`${sliceName}/getProfile`);

export type RejectValue = {
  reason: "PROFILE_ERROR";
  error: SerializedError;
};

export const getProfile = createTypedAsyncThunk<
  { phone: string; playerId: string; image: string; clientId: string },
  void,
  { rejectValue: RejectValue }
>(
  profileActionTypes.prefix,
  async (_, { getState, dispatch, rejectWithValue }) => {
    const user = getState().user;
    if (user.status !== "fulfilled") {
      return rejectWithValue({
        reason: "PROFILE_ERROR",
        error: miniSerializeError("User Not Exist"),
      });
    }
    const userId = user.userId as string;
    const profileResult = await settlePromise(auth.getProfile(userId));
    if (profileResult.status === "rejected") {
      return rejectWithValue({
        reason: "PROFILE_ERROR",
        error: miniSerializeError(profileResult.reason),
      });
    }
    const clientId = profileResult.value.clientId;
    const profileImage = profileResult.value.image;

    const phoneNumberResult = await settlePromise(
      auth.getPhone(clientId, userId)
    );
    if (phoneNumberResult.status === "rejected") {
      return rejectWithValue({
        reason: "PROFILE_ERROR",
        error: miniSerializeError(phoneNumberResult.reason),
      });
    }
    const phoneNumber = phoneNumberResult.value.blingPhoneNumber;

    let playerId = (await AsyncStorage.getItem("oneSignalId")) as
      | string
      | undefined;
    if (!playerId) {
      const deviceState = await OneSignal.getDeviceState();
      playerId = deviceState?.userId;
      const verifyDevice = await settlePromise(
        auth.verifyPlayerId(playerId, userId)
      );
      AsyncStorage.setItem("oneSignalId", playerId || "");
    }

    var whoosh: any;
    // promptForPushNotificationsWithUserResponse will show the native iOS or Android notification permission prompt.
    // We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step 8)
    OneSignal.promptForPushNotificationsWithUserResponse();

    const soundFile = require("../../assets/ringg.wav");

    // Method for handling notifications received while app in foreground
    OneSignal.setNotificationWillShowInForegroundHandler(
      async (notificationReceivedEvent) => {
        // console.log(
        //   'OneSignal: notification will show in foreground:',
        //   notificationReceivedEvent,
        // );
        let notification = notificationReceivedEvent.getNotification();
        const body = notification.body;
        const meta = notification.additionalData;
        const callType = (body.split(" ")[0] || "").toLowerCase();
        const callInvite = new CallInvite(
          {
            uuid: meta?.confId || "",
            callSid: meta?.confId || "",
            from: meta?.customerNumber || "",
            to: phoneNumber,
          },
          "pending" as any
        );

        console.log("body of the notification: ", callType, notification);
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
        if (callType === "incoming") {
          //PLAYING SOUND FROM HERE
          await dispatch(receiveCallInvite(callInvite));
          Sound.setCategory("Playback");
          whoosh = new Sound("ringg.wav", Sound.MAIN_BUNDLE, (error) => {
            if (error) {
              // console.log('failed to load the sound', error);
              return;
            }
            // loaded successfully
            console.log(
              "duration in seconds: " +
                whoosh.getDuration() +
                "number of channels: " +
                whoosh.getNumberOfChannels()
            );
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
      const body = notification.notification.body;
      const meta = notification.notification.additionalData;
      const callType = (body.split(" ")[0] || "").toLowerCase();
      const callInvite = new CallInvite(
        {
          uuid: meta?.confId || "",
          callSid: meta?.confId || "",
          from: meta?.customerNumber || "",
          to: phoneNumber,
        },
        "pending" as any
      );
      if (callType === "incoming") {
        //PLAYING SOUND FROM HERE
        dispatch(receiveCallInvite(callInvite));
        // whoosh.stop(() => {
        //   console.log("STOPPED");
        // });
      }
      return "Call";
    });
    return {
      clientId: clientId,
      phone: phoneNumber,
      image: profileImage,
      playerId: playerId,
    };
  }
);

// export const verifyDeviceActionType = generateThunkActionTypes(`${sliceName}/verifyDevice`);
// export const verifyDevice = createTypedAsyncThunk<void, void, {rejectValue: RejectValue}>(verifyDeviceActionType.prefix, async (_, {}) => {
//   const value = await AsyncStorage.getItem("oneSignalId");
//   if (value === null) {
//     // value previously stored
//     const deviceState = await OneSignal.getDeviceState();
//     const playerId: string | undefined = deviceState?.userId;
//     const
//   }

// })

interface ProfileStoreData {
  clientId: string;
  phone: string;
  image: string;
  playerId: string;
}

type ProfileInitialState = {
  action: "getProfile";
} & AsyncStoreSlice<ProfileStoreData, RejectValue>;
export const profileSlice = createSlice({
  name: sliceName,
  reducers: {},
  initialState: { status: "idle" } as ProfileInitialState,
  extraReducers: (builder) => {
    builder.addCase(getProfile.pending, (state, action) => {
      return {
        status: "pending",
        action: "getProfile",
      };
    });
    builder.addCase(getProfile.fulfilled, (state, action) => {
      return {
        status: "fulfilled",
        action: "getProfile",
        ...action.payload,
      };
    });
  },
});
