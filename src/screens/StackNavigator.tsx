import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Image, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import ActiveCall from "./ActiveCall";
import TabNavigator from "./TabNavigator";
import { type StackParamList, type DrawerParamList } from "./types";
import { type State } from "../store/app";
import CallInvite from "./CallInvite";
import Busy from "../components/Busy";
import Welcome from "./Welcome";
import SignIn from "./AuthScreen/SignIn";
import SignUp from "./AuthScreen/Signup";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import DrawerContent from "./DrawerContent";
import { useNavigation } from "@react-navigation/native";
import CallHistoryScreen from "./CallHistory";

const Stack = createNativeStackNavigator<StackParamList>();

const Drawer = createDrawerNavigator<DrawerParamList>();

const StackNavigator = () => {
  const user = useSelector((state: State) => state.user);
  const loginAndRegister = useSelector((state: State) => state.authAndRegister);
  if (user === null) {
    return <Text>Application not bootstrapped.</Text>;
  }

  //const isLoggedIn = user?.status === 'fulfilled' && user.accessToken;
  const isLoggedIn =
    loginAndRegister?.status === "fulfilled" && user?.status === "fulfilled";
  console.log("status----", loginAndRegister.status, user.status);
  if (loginAndRegister?.status === "pending" || user?.status === "pending") {
    return <Busy />;
  }
  if (!isLoggedIn) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          options={{ headerShown: false }}
          component={Welcome}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="SignIn"
          component={SignIn}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="SignUp"
          component={SignUp}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Drawer.Navigator
      drawerContent={(props: DrawerContentComponentProps) => (
        <DrawerContent {...props} />
      )}
      // screenOptions={{
      //   headerLeft: () => <HeaderLeft />,
      // }}
      // options={({ navigation }) => ({
      //   title: "Home",
      //   headerLeft: () => (
      //     <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
      //       <Image
      //         source={require("../../assets/icons/hamberger.png")}
      //         resizeMode="contain"
      //       />
      //     </TouchableOpacity>
      //   ),
      //   headerLeftContainerStyle: { paddingLeft: 10 },
      // })}
    >
      <Drawer.Screen
        name="App"
        options={{ headerShown: true }}
        component={TabNavigator}
      />
      <Drawer.Screen
        name="Call"
        component={ActiveCall}
        options={{
          headerShown: false,
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="Incoming Call"
        component={CallInvite}
        options={{
          headerShown: false,
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="Call History"
        component={CallHistoryScreen}
        options={{
          headerShown: true,
        }}
      />
    </Drawer.Navigator>
  );
};

function HeaderLeft(): JSX.Element {
  const navigation = useNavigation();

  const openMenu = () => {
    navigation.toggleDrawer();
  };
  return (
    <TouchableOpacity onPress={openMenu}>
      <Image
        source={require("../../assets/icons/hamberger.png")}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
  // render your Button
}

export default StackNavigator;
