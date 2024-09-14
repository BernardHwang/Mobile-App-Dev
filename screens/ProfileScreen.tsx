import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, Dimensions, ScrollView } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import {ProfileActionButton} from '../UI';
import firestore from '@react-native-firebase/firestore';
import { checkInternetConnection } from '../database/sync';

const ProfileScreen = ({ navigation }: any) => {
    const { user,resetPassword , updateEmail, deleteAccount, logout } = useContext(AuthContext);
    const [userData, setUserData] = useState<any>({});

    const getUserData = async () => {
      const userDocument = await firestore().collection('users').doc(user.uid).get();
      setUserData(userDocument.data());
      console.log(userData);
    };

    const handleEditProfile = async() => {
        const connected = await checkInternetConnection();
        if (connected){
            navigation.navigate('Edit Profile');
        }
        else{
            Alert.alert(
                'No Internet Connection',
                'Failed to edit profile! Please connect to internet.',
                [{ text: 'OK'}]
            );
        }
    }

    const handleEditEmail = async() => {
        const connected = await checkInternetConnection();
        if (connected){
            navigation.navigate('Edit Email');
        }
        else{
            Alert.alert(
                'No Internet Connection',
                'Failed to edit email! Please connect to internet.',
                [{ text: 'OK'}]
            );
        }
    }

    const handleEditPassword = async() => {
        const connected = await checkInternetConnection();
        if (connected){
            navigation.navigate('Edit Password');
        }
        else{
            Alert.alert(
                'No Internet Connection',
                'Failed to edit password! Please connect to internet.',
                [{ text: 'OK'}]
            );
        }
    }

    const handleDeleteAccount = async() => {
        const connected = await checkInternetConnection();
        if (connected){
            navigation.navigate('Delete Account');
        }
        else{
            Alert.alert(
                'No Internet Connection',
                'Failed to delete account! Please connect to internet.',
                [{ text: 'OK'}]
            );
        }
    };

    useEffect(()=>{
        getUserData();
    },[]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.profileContainer}>
                <Text style={styles.header}>My Profile</Text>
                <View style={styles.imageWrapper}>
                <Image style={styles.profileImage} source={{uri: user?.photoURL}} />
                </View>
                <Text style={styles.nameText}>{user.displayName}</Text>
                <Text style={styles.infoText}>{user.email}</Text>
                <Text style={styles.infoText}>{userData?.phone}</Text>
            </View>
            <ScrollView style={styles.touchableContainer}>
                <ProfileActionButton
                    title='Edit Profile'
                    iconName='account-edit'
                    onPress={handleEditProfile}
                />

                <ProfileActionButton
                    title='Email Address'
                    iconName='email'
                    onPress={handleEditEmail}
                />

                <ProfileActionButton
                    title='Password'
                    iconName='lock'
                    onPress={handleEditPassword}
                />

                <ProfileActionButton
                    title='Delete Account'
                    iconName='account-cancel'
                    onPress={handleDeleteAccount}
                />
                <ProfileActionButton
                    title='Log Out'
                    iconName='logout'
                    onPress={logout}
                    backgroundColor='#3e2769'
                    color= '#eee'
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#fff',
        height: Dimensions.get('window').height
    },
    profileContainer:{
        width: '100%',
        backgroundColor: '#3e2769',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        height: Dimensions.get('window').height * .45
    },
    header:{
        color: '#ffffff',
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: 0,
        marginBottom:30,

    },
    imageWrapper: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: 'hidden',
        marginBottom: 20,
        borderColor: '#fff',
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        flex: 1,
    },
    nameText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    infoText: {
        fontSize: 15,
        color: '#E0E0E0',
        marginBottom: 5,
    },
    touchableContainer: {
        width: '97%',
        marginVertical: 10,
    },
});

export default ProfileScreen;
