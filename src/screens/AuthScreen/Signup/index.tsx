import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { StackParamList } from "../../types";
const BlingLogo = require("../../../../assets/icons/bling_logo.png");
import { useDispatch, useSelector } from "react-redux";
import { type Dispatch, type State } from "../../../store/app";
import { signupAndRegister } from "../../../store/loginAndRegister";
import { Button, TextInput } from "react-native-paper";

type userLoginProp = {
  username?: string;
  password?: string;
};

type singUpProp = NativeStackScreenProps<StackParamList, "SignUp">;
const SignUp = ({ navigation }: singUpProp): JSX.Element => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phoneNumber, setPhone] = React.useState("");
  const [fullname, setFullName] = React.useState("");
  const [referredBy, setReffered] = React.useState("");
  const dispatch = useDispatch<Dispatch>();

  const handleSignUp = async () => {
    const params = {
      email,
      password,
      phoneNumber,
      fullname,
      referredBy,
    };
    const singupAction = await dispatch(signupAndRegister(params));
    if (signupAndRegister.rejected.match(singupAction)) {
      console.error(signupAndRegister.payload || signupAndRegister.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Get Started</Text>
      {/* <Text style={styles.label}>Full Name:</Text> */}
      <TextInput
        mode="outlined"
        onChangeText={setFullName}
        style={styles.input}
        outlineStyle={styles.outlineInput}
        contentStyle={styles.contentStyle}
        placeholder="Enter Name"
      />
      {/* <Text style={styles.label}>Email:</Text> */}
      <TextInput
        mode="outlined"
        style={styles.input}
        outlineStyle={styles.outlineInput}
        contentStyle={styles.contentStyle}
        onChangeText={setEmail}
        placeholder="Enter Email"
      />
      {/* <Text style={styles.label}>Password:</Text> */}
      <TextInput
        mode="outlined"
        style={styles.input}
        outlineStyle={styles.outlineInput}
        contentStyle={styles.contentStyle}
        onChangeText={setPassword}
        placeholder="Enter Password"
        secureTextEntry
        right={<TextInput.Icon icon="eye" />}
      />
      {/* <Text style={styles.label}>Phone:</Text> */}
      <TextInput
        mode="outlined"
        style={styles.input}
        outlineStyle={styles.outlineInput}
        contentStyle={styles.contentStyle}
        onChangeText={setPhone}
        placeholder="Phone No."
      />
      {/* <Text style={styles.label}>Reffered By :</Text> */}
      <TextInput
        mode="outlined"
        style={styles.input}
        outlineStyle={styles.outlineInput}
        contentStyle={styles.contentStyle}
        onChangeText={setReffered}
        placeholder="Reffered By"
      />
      <View style={styles.footerSingin}>
        <Text style={styles.label}>Already have a account ?</Text>
        <Text
          style={{
            fontWeight: "bold",
            textDecorationLine: "underline",
            color: "blue",
          }}
          onPress={() => navigation.navigate("SignIn")}
        >
          Sign In
        </Text>
      </View>

      <Button mode="contained" onPress={handleSignUp} style={styles.submitBtn}>
        Submit
      </Button>
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
    fontWeight: "bold",
    color: "purple",
  },
  footerSingin: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 10,
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

  logoContainer: {
    marginTop: "10%",
    alignSelf: "center",
  },
});

export default SignUp;
