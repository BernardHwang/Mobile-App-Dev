import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native'
import React, {useContext, useState} from 'react'
import { AppButton, InputWithLabel } from '../UI';
import { AuthContext } from '../navigation/AuthProvider';

const passwordValidation = (input: string) => {
    let isValid = true;
    let errorMessage = '';

    //* Handle client side input error */
    if (!input) {
        errorMessage = 'Password field cannot be empty';
        isValid = false;
    } else if (input.length < 6) {
        errorMessage = 'Password must be at least 6 characters long';
        isValid = false;
    }

    return { isValid, errorMessage };
};

export const EditEmailScreen = () => {
    const { loading, updateEmail } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [passwordErr, setPasswordErr] = useState('');
    const [emailErr, setEmailErr] = useState('');

    const emailValidation = (input: any) => {
        let isValid = true;
        //* Handle client side input error */
        if (!input) {
            setEmailErr('New email field cannot be empty');
            isValid = false;
        } else if (!input.match(/\S+@\S+\.\S+/)){
            setEmailErr('Invalid email format');
            isValid = false;
        } else {
            setEmailErr(null);
            isValid = true;
        }

        return isValid;
    }

    const handleEmailChange = (input: any) => {
        setNewEmail(input);
        emailValidation(input);
    }

    const handlePasswordChange = (input: any) => {
        setCurrentPassword(input);
        const {isValid, errorMessage } = passwordValidation(input);
        setPasswordErr(errorMessage);
        return isValid;
    }

    return (
        <View style={styles.screen}>
        <View style={styles.container}>
            <Text style={styles.header}>Update Email</Text>
            <Text style={styles.instructions}>
                For security reasons, you need to re-authenticate by entering your current password to update your email address.
            </Text>
            <InputWithLabel
                label="Current Password"
                value={currentPassword}
                error={passwordErr}
                onChangeText={handlePasswordChange}
                placeholder="Enter current password"
                password
            />
            <InputWithLabel
                label="New Email"
                value={newEmail}
                error={emailErr}
                onChangeText={handleEmailChange}
                placeholder="Enter new email"
                keyboardType="email-address"
            />

            <AppButton title="Update Email" disabled={loading} onPress={() => {updateEmail(currentPassword, newEmail)}} />
            <Text style={styles.note}>
                Note: Once your email is updated, you will need to use the new email address to sign in.
            </Text>
        </View>
        </View>
    );
};

export const EditPasswordScreen = () => {
    const { loading, editPassword, user } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordErr, setPasswordErr] = useState('');
    const [newPasswordErr, setNewPasswordErr] = useState('');

    const handlePasswordChange = (input: any) => {
        setCurrentPassword(input);
        const { isValid, errorMessage } = passwordValidation(input);
        setPasswordErr(errorMessage);
        return isValid;
    }

    const handleNewPasswordChange = (input: any) => {
        setNewPassword(input);
        const { isValid, errorMessage } = passwordValidation(input);
        setNewPasswordErr(errorMessage);
        return isValid;
    }

    return (
        <View style={styles.screen}>
            <View style={styles.container}>
                <Text style={styles.header}>Change Password</Text>
                <Text style={styles.instructions}>
                    For security reasons, you need to re-authenticate by entering your current password to proceed.
                </Text>
                <InputWithLabel
                    label="Old Password"
                    value={currentPassword}
                    error={passwordErr}
                    onChangeText={handlePasswordChange}
                    placeholder="Enter current password"
                    password
                />
                <InputWithLabel
                    label="New Password"
                    value={newPassword}
                    error={newPasswordErr}
                    onChangeText={handleNewPasswordChange}
                    placeholder="Enter new password"
                    password
                />
                <AppButton title="Confirm" disabled={loading} onPress={()=>{editPassword(currentPassword,newPassword)}} />
            </View>
        </View>
    );
}

export const DeleteAccountScreen = () => {
    const { loading,user, deleteAccount } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [passwordErr, setPasswordErr] = useState('');

    const handlePasswordChange = (input: any) => {
        setCurrentPassword(input);
        const { isValid, errorMessage } = passwordValidation(input);
        setPasswordErr(errorMessage);
        return isValid;
    }

    const handleDelete = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: ()=>{deleteAccount(user.email, currentPassword)}, style: "destructive" }
            ]
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.container}>
                <Text style={styles.header}>Delete Account</Text>
                <Text style={styles.instructions}>
                    For security reasons, you need to re-authenticate by entering your current password to delete your account.
                </Text>
                <InputWithLabel
                    label="Current Password"
                    value={currentPassword}
                    error={passwordErr}
                    onChangeText={handlePasswordChange}
                    placeholder="Enter current password"
                    password
                />

                <AppButton title="Delete Account" disabled={loading} onPress={handleDelete} />
                <Text style={styles.note}>
                    Note: This action is irreversible. Once deleted all your data will be removed.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#26154b',
        alignItems: "center",
        justifyContent: "center"
    },
    container: {
        //width:'90%',
        width: Dimensions.get('window').width * 0.9,
        //height: '65%',
        height: Dimensions.get('window').height * 0.55,
        //padding: 20,
        padding: Dimensions.get('window').width * 0.05,
        //paddingVertical: 40,
        paddingVertical: Dimensions.get('window').width * 0.1,
        //margin: 15,
        margin: Dimensions.get('window').width * 0.38,
        borderRadius: 10,
        backgroundColor: "#efecf6",
        justifyContent: "center",
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: 'black',
    },
    instructions: {
        fontSize: 14,
        color: "red",
        marginBottom: 20,
        textAlign: 'justify',
        marginHorizontal: 15,
    },
    note: {
        fontSize: 12,
        color: "#999",
        marginTop: 15,
        textAlign: 'center',
    },
});