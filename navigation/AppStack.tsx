import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

const AppStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="profile"
                component={ProfileScreen}
                //delete the option
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="home"
                component={HomeScreen}
                //delete the option
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

export default AppStack;