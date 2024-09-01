import React, { useContext, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, Button, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import auth from "@react-native-firebase/auth";
import { AuthContext } from '../navigation/AuthProvider';
import { AppButton, InputWithLabel } from '../UI';

const RegisterScreen = ({navigation, route}: any) => {
    const {register} = useContext(AuthContext);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    //Validation
    const [data, setData] = useState({
        username: '',
        password: '',
        check_textInputChange: false,
        secureTextEntry: true,
        isValidPassword: true,
    });

    return (
        <>
        <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#E6E6FA" }}>
            <Text style={styles.header}>Create Account</Text>
            <Text style={styles.description}>Please sign up to login</Text>
            <KeyboardAvoidingView behavior='padding'>
                <InputWithLabel
                    label="Name"
                    value={name}
                    placeholder="Enter name"
                    autoCapitalize="words"
                    onChangeText={(input: any) => setName(input)}
                />
                <InputWithLabel
                    label="Email"
                    value={email}
                    placeholder="Enter email"
                    autoCapitalize="none"
                    onChangeText={(input: any) => setEmail(input)}
                />
                <InputWithLabel
                    label="Phone number"
                    value={phone}
                    placeholder="Enter phone"
                    onChangeText={(input: any) => setPhone(input)}
                />
                <InputWithLabel
                    //TODO: Consider whether to do confirm password
                    label="Password"
                    value={password}
                    placeholder="Enter password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    onChangeText={(input: any) => setPassword(input)}
                />

                <AppButton
                    title="Register"
                    onPress={()=>{register(email, password)}}
                />
            </KeyboardAvoidingView>
        </View>
        <View style={{ alignItems: "center", flex: .1, backgroundColor: "#E6E6FA", flexDirection: "row", justifyContent: "center" }}>
            <Text style={{ fontSize: 16, color: "black" }}>Already have an account? </Text>
            <TouchableWithoutFeedback onPress={() => navigation.navigate('login')}>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: "#723AA0", textDecorationLine: "underline"}}>Sign In</Text>
            </TouchableWithoutFeedback>
        </View>
       </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    header: {
        fontSize: 40,
        fontWeight: "bold",
        color: "black",
        textAlign: "center",
        marginBottom: 10,
    },
    description: {
        color: "gray",
        textAlign: "center",
        marginBottom: 20,
    },
    label: {
        marginLeft: 10,
        paddingBottom: 5,
        textAlignVertical: "center",
        fontWeight: "bold",
        fontSize: 16,
        color: "black",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        backgroundColor: "#f9f9f9"
    }
})

export default RegisterScreen;