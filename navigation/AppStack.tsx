import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SavedScreen from '../screens/SavedScreen.tsx';
import AddEvent from '../screens/AddEvent.tsx';
import NotificationScreen from '../screens/NotificationScreen.tsx';
import EventDetails from '../screens/EventDetails.tsx';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppStack = () => {
    return (
        <Tab.Navigator initialRouteName="Home Page"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    if (route.name === 'Home Page') {
                        iconName = 'home';
                    } else if (route.name === 'Saved') {
                        iconName = 'heart';
                    } else if (route.name === 'Profile') {
                        iconName = 'person';
                    }

                    return <Icon name={iconName} color={color} size={size} />;
                },
                tabBarActiveTintColor: '#3e2769',  // Active icon and label color
                tabBarInactiveTintColor: '#B5B5B5',  // Inactive icon and label color
            })}
        >
            <Tab.Screen
                name="Home Page"
                component={StackNav}
                options={{
                    headerShown: false
                }}
            />
            <Tab.Screen
                name="Saved"
                component={SavedScreen}

            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
            />
        </Tab.Navigator>
    );
}

const StackNav = () => {
    return(
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
                name="Home"
                component={HomeScreen}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
            />
            <Stack.Screen
                name="AddEvent"
                component={AddEvent}
            />
            <Stack.Screen
                name="EventDetails"
                component={EventDetails}
            />
            <Stack.Screen
                name="Notification"
                component={NotificationScreen}
                options={{ headerShown: true }}
            />
        </Stack.Navigator>
    );
}



export default AppStack;