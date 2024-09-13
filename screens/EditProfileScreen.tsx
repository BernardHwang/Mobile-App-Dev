import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TextInput, Alert, TouchableOpacity, ScrollView, Platform, ActionSheetIOS } from "react-native";
import { AuthContext } from '../navigation/AuthProvider';
import { AppButton } from '../UI';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import Modal from 'react-native-modal';
import auth from '@react-native-firebase/auth';

const EditProfileScreen = ({ navigation }: any) => {
    const { user, updateProfile} = useContext(AuthContext);
    const [image, setImage] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>({});
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isModalVisible, setModalVisible] = useState(false); // Manage modal visibility for Android

    // Fetch user data from Firestore
    const getUser = async () => {
        const documentSnapshot = await firestore()
            .collection('users')
            .doc(user.uid)
            .get();

        if (documentSnapshot.exists) {
            const data = documentSnapshot.data();
            setUserData(data);
            setName(data?.name || '');
            setEmail(data?.email || '');
            setPhone(data?.phone || '');
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    const handleChoosePhoto = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response?.assets) {
                const uri = response.assets[0].uri;
                setImage(uri);
            }
        });
    };

    const takePhotoFromCamera = () => {
        ImagePicker.openCamera({
            compressImageMaxHeight: 300,
            compressImageMaxWidth: 300,
            cropping: true,
            compressImageQuality: 1,
        }).then(image => {
            setImage(image.path);
        }).catch((error) => {
            console.log("Error taking photo: ", error);
        });
    };

    const handleCameraIconPress = () => {
        if (Platform.OS === 'ios') {
            // Use ActionSheetIOS for iOS
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Library'],
                    cancelButtonIndex: 0,
                },
                buttonIndex => {
                    if (buttonIndex === 1) {
                        takePhotoFromCamera();
                    } else if (buttonIndex === 2) {
                        handleChoosePhoto();
                    }
                }
            );
        } else {
            // Show modal for Android
            setModalVisible(true);
        }
    };

    const handleUpdate = async () => {
        let imgUrl = image ? await uploadImageToStorage(image) : userData.pfp;

        updateProfile(name, phone, imgUrl);
    };

    const uploadImageToStorage = async (imageUri: string) => {
        const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
        const storageRef = storage().ref(`users/${filename}`);
        await storageRef.putFile(imageUri);
        return await storageRef.getDownloadURL();
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCameraIconPress}>
                    <ImageBackground
                        source={{ uri: image || userData?.pfp }}
                        style={styles.profileImage}
                        imageStyle={styles.imageStyle}
                    >
                        <View style={styles.cameraIconContainer}>
                            <Icon name="camera" size={30} color="#fff" />
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
                <Text style={styles.userName}>{userData?.name || 'User Name'}</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    editable={false}
                />
                <TextInput
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    keyboardType="number-pad"
                />
                <AppButton title="Update Profile" onPress={handleUpdate} />
            </View>

            {/* Modal for Android */}
            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
                <View style={styles.modalContent}>
                    <TouchableOpacity onPress={takePhotoFromCamera} style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleChoosePhoto} style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>Choose from Library</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageStyle: {
        borderRadius: 60,
    },
    cameraIconContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 30,
        padding: 5,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 10,
    },
    formContainer: {
        width: '100%',
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 15,
        borderRadius: 8,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    modalButton: {
        padding: 15,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default EditProfileScreen;
