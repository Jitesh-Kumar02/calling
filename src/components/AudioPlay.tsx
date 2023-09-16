import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Sound from "react-native-sound";

const AudioPlayer = ({ url }: { url: string }) => {
  const [playing, setPlaying] = useState();
  const ref = useRef();
  // useEffect(() => {

  // var audio = new Sound(url, "", (error) => {
  //   if (error) {
  //     console.log("failed to load the sound", error);
  //     return;
  //   }
  //   // if loaded successfully
  //   console.log(
  //     "duration in seconds: " +
  //       audio.getDuration() +
  //       "number of channels: " +
  //       audio.getNumberOfChannels()
  //   );
  // });
  // }, []);
  // useEffect(() => {
  //   audio.setVolume(1);
  //   return () => {
  //     audio.release();
  //   };
  // }, []);
  // const playPause = () => {
  //   if (audio.isPlaying()) {
  //     audio.pause();
  //     setPlaying(false);
  //   } else {
  //     setPlaying(true);
  //     audio.play((success) => {
  //       if (success) {
  //         setPlaying(false);
  //         console.log("successfully finished playing");
  //       } else {
  //         setPlaying(false);
  //         console.log("playback failed due to audio decoding errors");
  //       }
  //     });
  //   }
  // };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playBtn}
        // onPress={playPause}
      >
        <Ionicons
          name={playing ? "ios-pause-outline" : "ios-play-outline"}
          size={36}
          color={"#fff"}
        />
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  playBtn: {
    padding: 20,
  },
});
export default AudioPlayer;
