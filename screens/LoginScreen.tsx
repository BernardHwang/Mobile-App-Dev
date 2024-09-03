import { View, Text, TextInput, ActivityIndicator, Alert, Button, KeyboardAvoidingView, StyleSheet, TouchableNativeFeedback } from 'react-native'
import React, { useContext, useState } from 'react'
import app from "@react-native-firebase/app"
import auth from "@react-native-firebase/auth"
import { AuthContext } from '../navigation/AuthProvider';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import {AppButton, InputWithLabel} from '../UI';

//TODO: Precise Error message
const LoginScreen = ({navigation, route}: any) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const {login} = useContext(AuthContext);

    return (
        <>
        <View style={{flex: 1, justifyContent: "center", backgroundColor: "#E6E6FA"}}>
            <Text style={styles.header}>Welcome Back</Text>
            <Text style={styles.description}>Please sign in to continue</Text>
            <KeyboardAvoidingView behavior='padding'>
                <InputWithLabel
                    label = "Email"
                    value = {email}
                    placeholder = "Enter email"
                    autoCapitalize = "none"
                    onChangeText={(input:any) => setEmail(input)}
                />

                <InputWithLabel
                    label="Password"
                    secureTextEntry={true}
                    value={password}
                    placeholder="Enter password"
                    autoCapitalize="none"
                    onChangeText={(input: any) => setPassword(input)}
                />

                <AppButton
                    title = "Login"
                    onPress = {()=>{login(email,password)}}
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