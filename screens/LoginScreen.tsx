import { View, Text, TextInput, ActivityIndicator, Alert, Button, KeyboardAvoidingView, StyleSheet, TouchableNativeFeedback } from 'react-native'
import React, { useContext, useState } from 'react'
import app from "@react-native-firebase/app"
import auth from "@react-native-firebase/auth"
import { AuthContext } from '../navigation/AuthProvider';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import {AppButton, InputWithLabel} from '../UI';

//TODO: Precise Error message
const LoginScreen = ({navigation, route}: any) => {

    const { login, loading } = useContext(AuthContext);

    const [inputs, setInputs] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({
        emailErr: '',
        passwordErr: '',
    });

    const validation = (field: string) => {
        let isValid = true;

        //* Handle client side input error */
        switch (field) {
            case "email":
                if (!inputs.email) { //For email
                    handleError('Email field cannot be empty', 'emailErr');
                    isValid = false;
                } else if (!inputs.email.match(/\S+@\S+\.\S+/)) {
                    handleError('Invalid email format', 'emailErr');
                    isValid = false;
                }
                break;
            case "password": //For password
                if (!inputs.password) {
                    handleError('Password field cannot be empty', 'passwordErr');
                    isValid = false;
                }
                break;
        }
    }

    const handleOnChange = (text: any, input: any) => {
        setInputs(prevState => ({ ...prevState, [input]: text }));
    }

    const handleError = (error: any, input: any) => {
        setErrors(prevState => ({ ...prevState, [input]: error }));
    };

    return (
        <>
            <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#E6E6FA", paddingTop: 50, paddingHorizontal: 20 }}>
            <Text style={styles.header}>Welcome Back</Text>
            <Text style={styles.description}>Please sign in to continue</Text>
            <KeyboardAvoidingView behavior='padding'>

                <InputWithLabel
                    label="Email"
                    iconName="email-outline"
                    placeholder="Enter email address"
                    value={inputs.email}
                    error={errors.emailErr}
                    onChangeText={(text:any) => handleOnChange(text, 'email')}
                    onFocus={()=> handleError(null, 'emailErr')}
                    onBlur={() => validation("email")}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <InputWithLabel
                    label="Password"
                    iconName="lock-outline"
                    placeholder="Enter password"
                    value={inputs.password}
                    error={errors.passwordErr}
                    onChangeText={(text:any) => handleOnChange(text, 'password')}
                    onFocus={()=> handleError(null, 'passwordErr')}
                    onBlur={() => validation("password")}
                    autoCapitalize="none"
                    password
                />

                <AppButton
                    title = "Login"
                    onPress = {()=>{login(inputs.email,inputs.password)}}
                    disabled = {loading}
                />
            </KeyboardAvoidingView>
            <View style={{flex: .1, backgroundColor: "#E6E6FA", flexDirection: "row", marginLeft: 30 }}>
                <TouchableWithoutFeedback onPress={() => navigation.navigate('resetPassword')}>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: "#723AA0", textDecorationLine: "underline" }}>Forget Password?</Text>
                </TouchableWithoutFeedback>
            </View>
        </View>
        <View style={{ alignItems: "center", flex: .1, backgroundColor: "#E6E6FA", flexDirection: "row", justifyContent: "center" }}>
            <Text style={{ fontSize: 16, color: "black" }}>Don't have an account? </Text>
            <TouchableWithoutFeedback onPress={() => navigation.navigate("register")}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#723AA0", textDecorationLine: "underline" }}>Sign Up</Text>
            </TouchableWithoutFeedback>
        </View>
    </>
    )
}

const styles = StyleSheet.create({
    header:{
        fontSize: 40,
        fontWeight: "bold",
        color: "black",
        textAlign: "center",
        marginBottom: 10,
    },
    description:{
        color: "gray",
        textAlign: "center",
        marginBottom: 20,
    },
})

export default LoginScreen;