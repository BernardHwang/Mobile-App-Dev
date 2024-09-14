import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Platform, ActionSheetIOS } from "react-native";
import { AuthContext } from '../navigation/AuthProvider';
import { InputWithLabel, AppButton } from '../UI';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import Modal from 'react-native-modal';
import { useFocusEffect } from '@react-navigation/native';

const EditProfileScreen = ({ navigation }: any) => {
    const { loading, user, updateProfile } = useContext(AuthContext);
    const [image, setImage] = useState('');
    const [userData, setUserData] = useState<any>({});
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);

    const [nameErr, setNameErr] = useState('');
    const [phoneErr, setPhoneErr] = useState('');

    const nameValidation = (input: any) => {
        let isValid = true;
        //* Handle client side input error */
        if (!input.match(/^[A-Za-z][A-Za-z\s\-]*[A-Za-z]$/)) {
            setNameErr('Invalid name format');
            isValid = false;
        } else {
            setNameErr(null);
            isValid = true;
        }
        return isValid;
    }

    const phoneValidation = (input: any) => {
        let isValid = true;
        //* Handle client side input error */
        if (!input.match(/^\d{10,11}$/)) {
            setPhoneErr('Invalid phone format');
            isValid = false;
        } else {
            setPhoneErr(null);
            isValid = true;
        }
        return isValid;
    }

    const handlePhoneChange = (input:any) => {
        setPhone(input);
        phoneValidation(input);
    }

    const handleNameChange = (input: any) => {
        setName(input);
        nameValidation(input);
    }

    const getUserData = async () => {
        const userDocument = await firestore().collection('users').doc(user.uid).get();
        const userData = userDocument.data();
        setName(user.displayName);
        setEmail(user.email);
        setUserData(userData);
        setPhone(userData?.phone);
        setImage(userData?.pfp);
    };

    useEffect(() => {
        getUserData();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            getUserData();
            return () => {
                setImage(userData.pfp);
            };
        }, [user.photoURL])
    );

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
            compressImageQuality: 1,
        }).then(image => {
            setImage(image.path);
        }).catch((error) => {
            console.error("Error taking photo: ", error);
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
        let imgUrl = userData.pfp;
        if (imgUrl !== image){
            imgUrl = await uploadImageToStorage(image);
        }
        await updateProfile(name, phone, imgUrl);
    };

    const uploadImageToStorage = async (imageUri: string) => {
        const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
        const storageRef = storage().ref(`users/${filename}`);
        await storageRef.putFile(imageUri);
        return await storageRef.getDownloadURL();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCameraIconPress}>
                    <ImageBackground
                        source={{ uri: image || userData?.pfp }}
                        style={styles.profileImage}
                        imageStyle={styles.imageStyle}
                    >
                    <View style={styles.cameraIconContainer}>
                        <Icon name="camera" size={40} color="#fff" />
                    </View>
                    </ImageBackground>
                </TouchableOpacity>
                <Text style={styles.userName}>{user.displayName}</Text>
            </View>
            <View style={styles.formContainer}>
                <InputWithLabel
                    label="Email (Not Editable)"
                    value={email}
                    editable={false}
                />
                <InputWithLabel
                    label="Name"
                    placeholder="Enter name"
                    value={name}
                    onChangeText={handleNameChange}
                    error={nameErr}
                    onFocus={()=>nameValidation(name)}
                />
                <InputWithLabel
                    label="Phone"
                    placeholder="Enter phone"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    error={phoneErr}
                    onFocus={() => phoneValidation(phone)}
                    keyboardType="number-pad"
                />
                <AppButton
                 title="Update"
                 onPress={handleUpdate}
                 disabled={Boolean(nameErr || phoneErr) || loading} />
            </View>

            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
                <View style={styles.modalContent}>
                    <TouchableOpacity
                        onPress={()=>{takePhotoFromCamera(); setModalVisible(false);}}
                        style={styles.modalButton}
                    >
                        <Icon name="camera" size={25}/>
                        <Text style={styles.modalButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <View style={styles.dividerLine} />
                    <TouchableOpacity
                        onPress={() => { handleChoosePhoto(); setModalVisible(false); }}
                        style={styles.modalButton}
                    >
                        <Icon name="folder-image" size={25} />
                        <Text style={styles.modalButtonText}>Choose from Library</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#efecf6',
        padding: 20,
        paddingTop: 30,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 3,
        borderColor: '#fff',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, // For Android shadow
    },
    imageStyle: {
        borderRadius: 100,
    },
    cameraIconContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 30,
        padding: 10,
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'black'
    },
    formContainer: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        width: '100%',
    },
    modalButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    dividerLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 5,
    },
});

export default EditProfileScreen;