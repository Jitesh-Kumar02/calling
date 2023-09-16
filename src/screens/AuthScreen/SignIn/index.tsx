import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loginAndRegister } from "../../../store/loginAndRegister";
import { StackParamList } from "../../types";
import { type Dispatch, type State } from "../../../store/app";
import { Button, TextInput } from "react-native-paper";

const BlingLogo = require("../../../../assets/icons/bling_logo.png");
type userLoginProp = {
  username?: string;
  password?: string;
};

type singInProp = NativeStackScreenProps<StackParamList, "SignIn">;
const SignIn = ({ navigation }: singInProp): JSX.Element => {
  const dispatch = useDispatch<Dispatch>();
  const handleSignIn = async () => {
    const params = {
      username: username,
      password: password,
    };
    dispatch(loginAndRegister(params));
  };
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={BlingLogo} resizeMode="contain" />
      </View>
      <Text style={styles.heading}>Get Started</Text>
      {/* <Text style={styles.label}>Email:</Text> */}
      <TextInput
        mode="outlined"
        onChangeText={setUsername}
        style={styles.input}
        outlineStyle={styles.outlineInput}
        contentStyle={styles.contentStyle}
        placeholder="Enter Email"
      />
      <View></View>
      {/* <Text style={styles.label}>Password:</Text> */}
      <TextInput
        mode="outlined"
        onChangeText={setPassword}
        style={styles.input}
        outlineStyle={styles.outlineInput}
        contentStyle={styles.contentStyle}
        placeholder="Enter Password"
        secureTextEntry
        // right={<TextInput.Icon icon="eye" />}
      />
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          marginRight: 10,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            color: "purple",
          }}
          onPress={() => {}}
        >
          Forgot Password?
        </Text>
      </View>
      <Button mode="contained" onPress={handleSignIn} style={styles.submitBtn}>
        Submit
      </Button>
      <View style={styles.footerSingin}>
        <Text style={styles.label}>Don't have a account ?</Text>
        <Text
          style={{
            fontWeight: "bold",
            textDecorationLine: "underline",
            color: "blue",
          }}
          onPress={() => navigation.navigate("SignUp")}
        >
          Sign Up
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    content: "center",
    padding: 10,
  },
  contentStyle: {
    // height:44,
  },
  outlineInput: {
    borderRadius: 32,
    borderColor: "purple",
  },
  input: {
    height: 52,
    marginBottom: 20,
  },
  heading: {
    fontSize: 40,
    margin: 10,
    marginBottom: 30,
    alignSelf: "center",
    color: "purple",
    fontWeight: "bold",
  },
  footerSingin: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  label: {
    marginLeft: 10,
    marginRight: 10,
  },
  submitBtn: {
    marginBottom: 10,
    marginTop: 50,
    backgroundColor: "purple",
  },
  submitBtnLabel: {
    textAlign: "center",
  },
  logoContainer: {
    marginTop: "10%",
    alignSelf: "center",
  },
});

export default SignIn;
