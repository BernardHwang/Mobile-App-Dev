import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
    return (
        <Stack.Navigator initialRouteName="login">
            <Stack.Screen
                name="login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="register"
                component={RegisterScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="resetPassword"
                component={ResetPasswordScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

export default AuthStack;