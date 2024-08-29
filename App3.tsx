import { View, Text } from 'react-native';
import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/Login";
import Login from './screens/Login';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="login">
        <Stack.Screen
          name = "login"
          component = {LoginScreen}
          options = {{headerTitle: "Login"}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App