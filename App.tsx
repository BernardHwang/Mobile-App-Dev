import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SavedScreen from './screens/SavedScreen.tsx';
import AddEvent from './screens/AddEvent.tsx';
import NotificationScreen from './screens/NotificationScreen.tsx';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
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
          tabBarActiveTintColor: '#8A6536',  // Active icon and label color
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
    </NavigationContainer>
  );
};

const StackNav = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen}/>
      <Stack.Screen name="AddEvent" component={AddEvent}/>
      <Stack.Screen name="Notification" component={NotificationScreen} options={{headerShown: true}}/>
    </Stack.Navigator>
  );
};

export default App;