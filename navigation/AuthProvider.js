import React, {createContext, useState} from 'react'
import auth, {updateProfile} from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login: async (email, password) => {
                    try{
                        await auth().signInWithEmailAndPassword(email,password);

                    }catch(error){
                        console.error(error);
                    }
                },
                register: async (email, password, name, phone) => {
                    try {
                        // Create user with email and password
                        const {user} = await auth().createUserWithEmailAndPassword(email, password);

                        // Update user profile with name and photo
                        await updateUserProfile(user, name);

                        // Reload user to get updated details
                        await user.reload();
                        const updatedUser = auth().currentUser;

                        // Set user in state
                        setUser(updatedUser);

                        // Save user details to Firestore
                        await saveUserDetailsToFirestore(updatedUser, phone);
                        
                        console.log('User registered and added to Firestore');
                    } catch (error) {
                        console.error(error);
                    }
                },
                logout: async () => {
                    try{
                        await auth().signOut();
                        setUser(null);
                    }catch(error){
                        console.error(error);
                    }
                }
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Function to update user profile
const updateUserProfile = async (user,name) => {
    await user.updateProfile({
        displayName: name,
        photoURL: "https://static.vecteezy.com/system/resources/previews/036/280/650/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg",
    });
}

const saveUserDetailsToFirestore = async (user, phone) => {
    const usersCollection = firestore().collection('users');
    await usersCollection.doc(user?.uid).set({
        name: user?.displayName,
        email: user?.email,
        phone: phone,
        pfp: user?.photoURL,
    });
}