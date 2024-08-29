import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const App = () => {
    useEffect(() => {
        const addUserDocument = async () => {
            try {
                const usersCollection = firestore().collection('users');

                // Retrieve the number of documents in the 'users' collection
                const snapshot = await usersCollection.get();
                const documentCount = snapshot.size; // Number of documents

                // Generate the new document ID
                const newDocumentId = `U${documentCount + 1}`;

                // Add a new document with the generated ID
                await usersCollection.doc(newDocumentId).set({
                    name: 'Hwang Jen Fung',
                    email: 'hwang.jen@example.com',
                    pfp: '',
                    phone: '0123456789'
                });

                console.log(`User added with ID: ${newDocumentId}`);

                // Example: Retrieving data from the 'users' collection
                const updatedSnapshot = await usersCollection.get();
                updatedSnapshot.forEach(documentSnapshot => {
                    console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
                });
            } catch (error) {
                console.error('Error adding user: ', error);
            }
        };

        addUserDocument();
    }, []);

    return (
        <View>
            <Text>Firebase Firestore Example</Text>
        </View>
    );
};

export default App;
