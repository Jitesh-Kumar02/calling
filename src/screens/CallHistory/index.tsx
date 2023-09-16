import React, { useEffect } from "react";
import { Text, View, FlatList } from "react-native";
import { State, Dispatch } from "../../store/app";
import { useSelector, useDispatch } from "react-redux";
import { getLogs } from "../../store/callLogs";
import Busy from "../../components/Busy";
import AudioPlayer from "../../components/AudioPlay";
const CallHistoryScreen = () => {
  const { status, callLogs } = useSelector((state: State) => state.callLogs);
  const dispatch = useDispatch<Dispatch>();
  useEffect(() => {
    if (!callLogs) {
      console.log("call logs not exists");
    }
    console.log("call logs", callLogs);
  }, [callLogs]);

  useEffect(() => {
    dispatch(getLogs());
  }, []);
  console.log(callLogs);
  if (status !== "fulfilled") {
    <Busy />;
  }
  return (
    <View>
      <FlatList
        data={callLogs || []}
        renderItem={({ item }) => (
          <View key={item.id}>
            <Text>From : {item.customerNumber}</Text>
            <Text>To: {item.toNumber}</Text>
            <Text>To: {item.callType}</Text>
            <Text>To: {item.recordUrl}</Text>
            <AudioPlayer url={item.recordUrl} />
          </View>
        )}
      />
    </View>
  );
};

export default CallHistoryScreen;
