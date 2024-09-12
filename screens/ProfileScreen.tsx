import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';

//! need to change the edit profile >> profile icon
//! change not hardcode

const ProfileScreen = ({ navigation }: any) => {
    const { user,resetPassword , updateEmail, deleteAccount, logout } = useContext(AuthContext);
    const [userData, setUserData] = useState<any>({});

    const getUserData = async () => {
      const userDocument = await firestore().collection('users').doc(user.uid).get();
      setUserData(userDocument.data());
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: deleteAccount, style: "destructive" }
            ]
        );
    };

    const handleResetEmail = async (newEmail:any) => {
      //!here need to update
      newEmail = 'lim.vincy188@gmail.com';
      updateEmail(newEmail);
    };

    const handleResetPassword = async () => {
      resetPassword(user.email);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Profile Image */}
            <Image style={styles.profileImage} source={{ uri: user?.photoURL || 'https://placehold.co/100x100' }} />

            {/* Display User Information */}
          <Text style={styles.nameText}>{user.displayName}</Text>
            <Text style={styles.infoText}>{user.email}</Text>
            <Text style={styles.infoText}>{userData.phone}</Text>

            {/* Touchable Areas */}
            <View style={styles.touchableContainer}>
                <TouchableOpacity style={styles.touchable} onPress={() => navigation.navigate('EditProfile')}>
                    <Text style={styles.touchableText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.touchable} onPress={handleResetEmail}>
                    <Text style={styles.touchableText}>Change Email</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.touchable} onPress={handleResetPassword}>
                    <Text style={styles.touchableText}>Change Password</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.touchable, styles.danger]} onPress={handleDeleteAccount}>
                    <Text style={styles.touchableText}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutTouchable} onPress={() => logout()}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    nameText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    infoText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    touchableContainer: {
        width: '100%',
        marginVertical: 20,
    },
    touchable: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    touchableText: {
        fontSize: 16,
        color: '#333',
    },
    danger: {
        backgroundColor: '#ffe6e6',
    },
    logoutTouchable: {
        padding: 15,
        backgroundColor: '#1e90ff',
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginVertical: 20,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
