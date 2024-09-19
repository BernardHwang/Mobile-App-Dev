import React, {createContext, useState, useEffect} from 'react';
import auth, { updateProfile, EmailAuthProvider, deleteUser, updatePassword, updateEmail } from "@react-native-firebase/auth";
import {Alert} from "react-native";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import { getJoinEventsByUserIDOnline, getHostEventsByUserIDOnline } from '../database/firestore-service';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(async (authUser) => {
            if (authUser) {
                setUser(authUser);
                console.log('Auth User:', authUser);
                const userDoc = await firestore().collection('users').doc(authUser.uid).get();
                const firestoreUser = userDoc.data();

                // Compare emails
                if (firestoreUser && firestoreUser.email !== authUser.email) {
                    console.log('Emails do not match. Updating Firestore...');
                    await saveUserDetailsToFirestore(authUser, firestoreUser.phone);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // Function to update user profile
    const updateUserProfile = async (user, name, photoURL) => {
        await user.updateProfile({
            displayName: name,
            photoURL: photoURL,
        });
    }

    const saveUserDetailsToFirestore = async (user, phone) => {
        const usersCollection = firestore().collection('users');
        await usersCollection.doc(user.uid).set({
            name: user.displayName,
            email: user.email,
            phone: phone,
            pfp: user.photoURL,
        });
    }

    const checkEmailExists = async (email) => {
        const querySnapshot = await firestore().collection('users').where('email', '==', email).get();
        if (!querySnapshot.empty){
            return true;
        }else{
            return false;
        }
    };

    const reauthenticateUser = async(currentPassword) => {
        // get user's credential
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        console.log('Successful get user credential')

        // reauthenticate the user
        await user.reauthenticateWithCredential(credential);
        console.log('User reauthenticate');
    }

    const deleteUserFirestore = async(userID) => {
        try{
            const docRef = firestore().collection('users').doc(userID);
            const deleteSubcollection = async (collectionPath) => {
                const subCollectionRef = firestore().collection(collectionPath);
                const querySnapshot = await subCollectionRef.get();
                const batch = firestore().batch();

                querySnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });

                await batch.commit();
            };
            await deleteSubcollection(`users/${userID}/notifications`);
            docRef.delete();
            console.log('User data is deleted in Firestore');

            await deleteUserJoinEvent(userID);
            await deleteUserHostedEvent(userID);
        }catch(error){
            console.log('Error deleting user in Firestore: ', error);
        }
    }

    const deleteUserJoinEvent = async(userID) => {
        try{
            const joinedEvents = await getJoinEventsByUserIDOnline(userID);
            const batch = firestore().batch();

            joinedEvents.forEach(doc => {
                const eventRef = firestore().collection('events').doc(doc.event_id).collection('eventParticipant').doc(userID);
                batch.delete(eventRef);
            });

            await batch.commit();
            joinedEvents.forEach(doc => {
                unjoinEvent(userID, doc.id);
            })
        }catch(error){
            console.log('Error delete user joined event: ', error);
        }
    }

    const deleteUserHostedEvent = async (userID) => {
        try {
            const hostedEvents = await getHostEventsByUserIDOnline(userID);
            const batch = firestore().batch();

            hostedEvents.forEach(doc => {
                const eventRef = firestore().collection('events').doc(doc.event_id);
                batch.delete(eventRef);
            });
            await batch.commit();
            console.log(`All events hosted by user with ID ${userID} deleted successfully.`);
        } catch (error) {
            console.log('Error delete user hosted event: ', error);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                login: async (email, password) => {
                    try{
                        if (!email|| !password){
                            Alert.alert("Login Failed", "Please make sure you filled up email and password field");
                        }else{
                            setLoading(true);
                            await auth().signInWithEmailAndPassword(email, password);
                        }
                    }catch(error){
                        //* Handle firebase auth validation */
                        if (error.code == "auth/invalid-email"){
                            Alert.alert("Login Failed","The email address is not valid");
                        } else if (error.code == "auth/invalid-credential"){
                            Alert.alert("Login Failed", "Invalid credential");
                        }else if (error.code == "auth/user-not-found"){
                            Alert.alert("Login Failed", "The account is not exist");
                        }else if (error.code == "auth/wrong-password"){
                            Alert.alert("Login Failed", "The password is incorrect.");
                        }else if (error.code == "auth/too-many-requests"){
                            Alert.alert("Login Failed", "Too many requests. Try again later.");
                        }else if (error.code == "auth/network-request-failed"){
                            Alert.alert("Network Error", "Please check your connection.");
                        }else{
                            Alert.alert("Error", "An unexpected error occurred.");
                        }
                        console.log(error);
                    }finally{
                        setLoading(false);
                    }
                },
                register: async (email, password, name, phone) => {
                    try {
                        if (!email || !password || !name || !phone){
                            Alert.alert("Register Failed", "Please filled up all the details");
                        }else{
                            setLoading(true);
                            // Create user with email and password
                            const { user } = await auth().createUserWithEmailAndPassword(email, password);

                            // Reference to image in Firebase storage and get the download URL
                            const url = await storage().ref('default_pfp.jpg').getDownloadURL();

                            // Update user profile with name and photo
                            await updateUserProfile(user, name, url);

                            // Reload user to get updated details
                            await user.reload();
                            const updatedUser = auth().currentUser;

                            // Set user in state
                            await setUser(updatedUser);

                            // Save user details to Firestore
                            await saveUserDetailsToFirestore(updatedUser, phone);

                            console.log('User registered and added to Firestore');
                        }
                    } catch (error) {
                        //* Handle firebase auth validation */
                        if (error.code == 'auth/email-already-in-use'){
                            Alert.alert("Register Failed","This email is already in use.");
                        }else if (error.code == 'auth/invalid-email'){
                            Alert.alert("Register Failed", "This email address is not valid.");
                        }else if (error.code == 'auth/weak-password'){
                            Alert.alert("Register Failed","The password is too weak. Please ensure your password contains at least 6 characters");
                        } else if (error.code == "auth/network-request-failed") {
                            Alert.alert("Network Error", "Please check your connection.");
                        }else{
                            Alert.alert("Error", "An unexpected error occurred.");
                        }
                        console.log(error);
                    }finally{
                        setLoading(false);
                    }
                },

                updateProfile: async (name, phone, photoURL) => {
                    try{
                        setLoading(true);
                        await updateUserProfile(user, name, photoURL);

                        // Reload user to get updated details
                        await user.reload();
                        const updatedUser = auth().currentUser;
                        console.log(updatedUser);

                        // Set user in state
                        await setUser(updatedUser);

                        // Save user details to firestore
                        await saveUserDetailsToFirestore(updatedUser, phone);

                        Alert.alert('Profile Updated!', 'Your profile has been updated successfully.');
                    }catch (error) {
                        Alert.alert('Update Error', 'There is an error occurred.');
                        console.error('Error updating Firebase Auth profile: ', error);
                    }finally{
                        setLoading(false);
                    }
                },

                logout: async () => {
                    try{
                        await auth().signOut();
                        setUser(null);
                    }catch(error){
                        Alert.alert("Logout Failed", "An unexpected error occurred.");
                        console.log(error);
                    }finally{
                        Alert.alert("Logout Successfully");
                    }
                },

                resetPassword: async (email) => {
                    try{
                        setLoading(true);
                        const emailExists = await checkEmailExists(email);
                        if (emailExists) {
                            await auth().sendPasswordResetEmail(email);
                            Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
                        }else{
                            Alert.alert('Error', 'This email is not registered.');
                        }
                    }catch(error){
                        if(error.code == 'auth/network-request-failed'){
                                Alert.alert("Network Error", "Please check your connection.");
                        }else{
                            Alert.alert('Reset Error', 'There was an error sending the password reset link.');
                        }
                        console.log(error);
                    }finally{
                        await user.reload();
                        setLoading(false);
                    }
                },

                editPassword: async (oldPassword, newPassword) => {
                    try {
                        setLoading(true);
                        await reauthenticateUser(oldPassword);
                        await updatePassword(user,newPassword);
                        Alert.alert('Request Success', 'Your password is updated.');

                    } catch (error) {
                        if (error.code == "auth/invalid-credential") {
                            Alert.alert('Authentication Failed', 'The password is incorrect.');
                        } else if (error.code === 'auth/wrong-password') {
                            Alert.alert('Authentication Failed', 'The password is incorrect.');
                        } else if (error.code == "auth/network-request-failed") {
                            Alert.alert("Network Error", "Please check your connection.");
                        } else {
                            Alert.alert('Error', 'An unexpected error occurred.');
                        }
                    } finally {
                        await user.reload();
                        setLoading(false);
                    }
                },

                deleteAccount: async (email, password) => {
                    reauthenticateUser(password)
                        .then(() => {
                            // Delete user from firestore
                            return deleteUserFirestore(user.uid);
                            //return firestore().collection('users').doc(user.uid).delete();
                        }).then(() => {
                            // Delete user from Firebase Authentication
                            return deleteUser(user);
                        }).then(() => {
                            console.log("Deleted on Firebase Auth");
                            Alert.alert('Account deleted', 'Your account has been deleted successfully.');
                        }).catch((error) => {
                            if (error.code == "auth/invalid-credential"){
                                Alert.alert('Authentication Failed', 'The password is incorrect.');
                            } else if (error.code == 'auth/network-request-failed'){
                                Alert.alert("Network Error", "Please check your connection.");
                            }else{
                                Alert.alert('Error', 'There was an error deleting your account.');
                            }
                            console.error(error);
                        })
                },

                updateEmail: async (password, newEmail) => {
                    try{
                        setLoading(true);
                        if (user.email === newEmail) {
                            Alert.alert("Request failed", "The email is same as the current email");
                        }else{
                            await reauthenticateUser(password);
                            await user.verifyBeforeUpdateEmail(newEmail);
                            console.log('Verification email sent to new email');
                            Alert.alert('Request Success', 'Verification email sent. Please verify your new email address.');
                            auth().signOut();
                        }
                    }catch(error){
                        console.log(error);
                        if (error.code == "auth/invalid-credential") {
                            Alert.alert('Authentication Failed', 'The password is incorrect.');
                        } else if (error.code === 'auth/wrong-password') {
                            Alert.alert('Authentication Failed', 'The password is incorrect.');
                        } else if (error.code === 'auth/invalid-new') {
                            Alert.alert('Request failed', 'The new email address is not valid.');
                        } else if (error.code === 'auth/operation-not-allowed') {
                            Alert.alert('Request failed', 'This operation is not allowed.');
                        } else if (error.code == "auth/network-request-failed") {
                            Alert.alert("Network Error", "Please check your connection.");
                        } else {
                            Alert.alert('Error', 'An unexpected error occurred.');
                        }
                    }finally{
                        setLoading(false);
                    }
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}