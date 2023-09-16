import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/user";
import { type Dispatch, type State } from "../store/app";

export default function DrawerContent(
  props: DrawerContentComponentProps
): React.ReactNode {
  const dispatch = useDispatch<Dispatch>();
  const user = useSelector((state: State) => state.user);

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: "#ccc" }}>
        <TouchableOpacity onPress={() => dispatch(logout())}>
          <Text>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
