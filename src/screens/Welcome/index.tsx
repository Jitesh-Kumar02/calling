import React, { useEffect } from "react";
import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loginAndRegister } from "../../store/loginAndRegister";
import { type Dispatch, type State } from "../../store/app";
import { StackNavigationProp, StackParamList } from "../types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ArrowForward = require("../../../assets/icons/arrow-forward.png");
const BlingLogo = require("../../../assets/icons/bling_logo.png");
const HelloFigure = require("../../../assets/icons/welcome-hello.png");
const ErrorWarning = require("../../../assets/icons/error.png");

const styles = StyleSheet.create({
  container: {
    height: "100%",
    flex: 1,
    alignContent: "center",
  },
  helloFigureContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  body: {
    marginHorizontal: 40,
  },
  label: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    letterSpacing: 0,
    color: "#121C2D",
  },
  logoContainer: {
    position: "absolute",
  },
  text: {
    marginBottom: 20,
    lineHeight: 20,
  },
  loginScreenButton: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#4e3997",
    borderRadius: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    color: "#FFFFFF",
    textAlign: "center",
    weight: 600,
    size: 14,
  },
  arrowForward: {
    width: 20,
    height: 20,
    marginLeft: 4,
  },
  errorWarning: {
    height: 20,
    width: 20,
  },
  errorContainer: {
    display: "flex",
    flexDirection: "row",
    width: "90%",
  },
  errorText: {
    paddingLeft: 4,
    lineHeight: 20,
    fontSize: 14,
    color: "#D61F1F",
  },
  withBorder: {
    backgroundColor: "white",
    borderColor: "#4e3997",
    borderWidth: 1,
  },
  textColorMain: {
    color: "#4e3997",
  },
});

type welcomeScreenProp = NativeStackScreenProps<StackParamList, "Welcome">;
const Welcome = ({ navigation }: welcomeScreenProp): JSX.Element => {
  const dispatch = useDispatch<Dispatch>();
  const errorMessage = useSelector((state: State) => {
    if (state.voice.accessToken.status === "rejected") {
      switch (state.voice.accessToken.reason) {
        case "TOKEN_RESPONSE_NOT_OK":
          return state.voice.accessToken.error.message || "";
        default:
          return "";
      }
    }
  });

  const handleLogin = async () => {
    navigation.navigate("SignIn");
    // const loginAction = await dispatch(loginAndRegister());
    // if (loginAndRegister.rejected.match(loginAction)) {
    //   console.error(loginAction.payload || loginAction.error);
    // }
  };

  // useEffect(() => {
  //   const getUser = async () => {
  //     const user = await AsyncStorage.getItem("user");
  //     if (user) {
  //       console.log("User Data ------: ", JSON.parse(user));
  //       const loginAction = await dispatch(loginAndRegister(JSON.parse(user)));
  //       if (loginAndRegister.rejected.match(loginAction)) {
  //         console.error(loginAction.payload || loginAction.error);
  //       }
  //     }
  //   };
  //   getUser();
  // }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={BlingLogo} resizeMode="contain" />
      </View>
      <View style={styles.body}>
        <Text style={styles.text}>
          Welcome to the application, start with login and signup
        </Text>
        <TouchableOpacity
          style={styles.loginScreenButton}
          onPress={() => navigation.navigate("SignIn")}
          testID="login_button"
        >
          <Text style={styles.loginText}>Sign In</Text>
          <Image
            source={ArrowForward}
            resizeMode="contain"
            style={styles.arrowForward}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ ...styles.loginScreenButton, ...styles.withBorder }}
          onPress={() => navigation.navigate("SignUp")}
          testID="login_button"
        >
          <Text style={{ ...styles.loginText, ...styles.textColorMain }}>
            Sign Up
          </Text>
          <Image
            source={ArrowForward}
            resizeMode="contain"
            style={{ ...styles.arrowForward, ...styles.textColorMain }}
          />
        </TouchableOpacity>
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Image
              source={ErrorWarning}
              style={styles.errorWarning}
              resizeMode="contain"
            />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
      </View>
      <View style={styles.helloFigureContainer}>
        <Image source={HelloFigure} resizeMode="contain" />
      </View>
    </View>
  );
};

export default Welcome;
