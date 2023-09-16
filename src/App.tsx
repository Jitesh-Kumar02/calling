import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { Provider } from "react-redux";
import StackNavigator from "./screens/StackNavigator";
import { defaultStore } from "./store/app";
import { PaperProvider } from "react-native-paper";
import {
  bootstrapCalls,
  bootstrapCallInvites,
  bootstrapUser,
  bootstrapNavigation,
  bootstrapOneSignal,
} from "./store/bootstrap";
import { navigationRef } from "./util/navigation";

const App = () => {
  React.useEffect(() => {
    const bootstrap = async () => {
      await defaultStore.dispatch(bootstrapUser());
      await defaultStore.dispatch(bootstrapCalls());
      await defaultStore.dispatch(bootstrapCallInvites());
      await defaultStore.dispatch(bootstrapNavigation());
      await defaultStore.dispatch(bootstrapOneSignal());
    };

    bootstrap();
  }, []);

  return (
    <Provider store={defaultStore}>
      <PaperProvider>
        <NavigationContainer ref={navigationRef}>
          <StackNavigator />
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
};

export default App;
