import React, { useContext } from 'react';
import { Image, Text, TouchableNativeFeedback, View } from 'react-native';
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyEventScreen from '../screens/MyEventScreen.tsx';
import AddEvent from '../screens/AddEvent.tsx';
import NotificationScreen from '../screens/NotificationScreen.tsx';
import EventDetails from '../screens/EventDetails.tsx';
import EditEvent from '../screens/EditEvent.tsx';
import EditProfileScreen from '../screens/EditProfileScreen.tsx';
import { EditEmailScreen, EditPasswordScreen } from '../screens/EditCredentialScreen';
import { AuthContext } from '../navigation/AuthProvider.js';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawer = (props: any) => {
    const { user, logout } = useContext(AuthContext);
    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: .3, backgroundColor: '#3e2769', justifyContent: "center", alignItems: "center" }}>
                <Image style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 20, borderWidth:3, borderColor:'#fff' }} source={{ uri: user?.photoURL || 'https://placehold.co/100x100' }} />
                <Text style={{color:"#fff", fontSize:20, fontWeight:'bold'}}>{user.displayName}</Text>
            </View>
            <View style={{ flex: .65 }}>
                <DrawerItemList {...props} />
            </View>
            <View style={{ flex: .05, borderTopWidth: 1, paddingVertical:10,  }}>
                <TouchableNativeFeedback onPress={logout}>
                    <View style={{ flexDirection: 'row', paddingLeft: 20}}>
                        <Icon name="exit" size={35} />
                        <Text style={{ fontSize: 20, paddingLeft: 15 }}>Logout</Text>
                    </View>
                </TouchableNativeFeedback>
            </View>
        </View>
    );
};

const DrawerNav = () => {
    return (
        <Drawer.Navigator
            screenOptions={{
                drawerStyle: { backgroundColor: "#fff", width: 300 },
                headerShown: false,
                drawerActiveTintColor: 'white',
                drawerActiveBackgroundColor: '#bea9e7',
            }}
            drawerContent={(props) => <CustomDrawer {...props} />}
        >
            <Drawer.Screen
                name="Home"
                component={BottomTabNav}
                options={{
                    drawerLabel: "Home",
                    drawerIcon: () => (<Icon name="home" size={24} />)
                }}
            />
            <Drawer.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                    headerShown:true,
                    headerTitle: "Edit Profile",
                    drawerLabel: "Edit Profile",
                    drawerIcon: () => (<Icon name="person" size={24} />),
                }}
            />
            <Drawer.Screen
                name="AddEvent"
                component={AddEvent}
                options={{
                    drawerLabel: "Create Event",
                    drawerIcon: () => (<Icon2 name="calendar-plus" size={24} />),
                }}
            />
            <Drawer.Screen
                name="Notification"
                component={NotificationScreen}
                options={{
                    headerShown: true,
                    drawerLabel: "Notifications",
                    drawerIcon: () => (<Icon name="notifications" size={24} />),
                }}
            />
        </Drawer.Navigator>
    );
};

const BottomTabNav = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home Page"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Home Page') {
                        iconName = 'home';
                    } else if (route.name === 'Event Page') {
                        iconName = 'heart';
                    } else if (route.name === 'Profile Page') {
                        iconName = 'person';
                    }
                    return <Icon name={iconName} color={color} size={size} />;
                },
                tabBarActiveTintColor: '#3e2769',
                tabBarInactiveTintColor: '#B5B5B5',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home Page" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
            <Tab.Screen name="Event Page" component={EventStackNav} options={{ tabBarLabel: "Event"}}/>
            <Tab.Screen name="Profile Page" component={ProfileStackNav} options={{ tabBarLabel: "Profile"}} />
        </Tab.Navigator>
    );
};

const EventStackNav = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="Event"
                component={MyEventScreen}
                options={{ headerShown: true}}
            />
            <Stack.Screen
                name="EventDetails"
                component={EventDetails}
            />
            <Stack.Screen
                name="EditEvent"
                component={EditEvent}
            />
        </Stack.Navigator>
    );
};

const ProfileStackNav = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
            />
            <Stack.Screen
                name="EditEmail"
                component={EditEmailScreen}
            />
            <Stack.Screen
                name="EditPassword"
                component={EditPasswordScreen}
            />
        </Stack.Navigator>
    );
};

const AppStack = () => {
    return (
        <DrawerNav />
    );
};

export default AppStack;
