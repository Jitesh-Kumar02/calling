import React, { useEffect } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { type Dispatch, type State } from "../../store/app";
import { getProfile } from "../../store/profile";
const BlingLogo = require("../../../assets/icons/bling_logo.png");

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F4F4F6",
    height: "100%",
    width: "100%",
    display: "flex",
    alignContent: "center",
  },
  body: {
    marginHorizontal: 40,
    marginTop: 30,
    textAlign: "center",
  },
  client: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userText: {
    fontWeight: "700",
    fontSize: 24,
    marginTop: 8,
  },
  greetingText: {
    fontWeight: "bold",
    fontSize: 32,
    // marginTop: 8,
    textAlign: "center",
  },
  logoContainer: {
    marginTop: 100,
    alignSelf: "center",
  },
  logo: {
    maxHeight: "100%",
  },
  logoutText: {
    color: "#0263E0",
    textDecorationLine: "underline",
    padding: 0,
  },
});

const Home: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const user = useSelector((state: State) => state.user);

  useEffect(() => {
    if (user.status === "fulfilled") {
      dispatch(getProfile());
    }
  }, [user]);

  // useEffect(() => {
  //   const getDetails = async () => {
  //     // await AsyncStorage.removeItem('oneSignalId');
  //     const value = await AsyncStorage.getItem("oneSignalId");
  //     if (value === null) {
  //       // value previously stored
  //       const deviceState = await OneSignal.getDeviceState();
  //       const playerId: string | undefined = deviceState?.userId;
  //       const urlWithParams: any = new URL(
  //         "https://dashback.bling-test.xyz/phone/player"
  //       );
  //       urlWithParams.searchParams.append("playerId", playerId);
  //       urlWithParams.searchParams.append("userId", "602");
  //       fetch(urlWithParams, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       })
  //         .then(async (response) => {
  //           console.log(
  //             "Store Player id to server response: ",
  //             response.status
  //           );
  //           if (response.status == 200) {
  //             if (playerId) {
  //               await AsyncStorage.setItem("oneSignalId", playerId);
  //             }
  //           }
  //         })
  //         .catch((err) => {
  //           console.log("Store player Id Error: ", err);
  //         });
  //     }
  //   };
  //   getDetails();
  // }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={BlingLogo} resizeMode="contain" />
      </View>
      <View style={styles.body}>
        <Text style={styles.greetingText}>
          Welcome {user?.name ? user?.name : "User"}
        </Text>
        {/* <View style={styles.client}>
          <Text>Client ID:</Text>
          <TouchableHighlight onPress={handleLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableHighlight>
        </View>
        {user?.status === 'fulfilled' && (
          <Text style={styles.userText}>{user.email}</Text>
        )} */}
      </View>
    </View>
  );
};

export default Home;
