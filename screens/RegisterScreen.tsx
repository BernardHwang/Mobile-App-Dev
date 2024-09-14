import React, { useContext, useState } from 'react';
import { View, Text, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider';
import { AppButton, InputWithLabel } from '../UI';

const RegisterScreen = ({navigation, route}: any) => {
    const {register, loading} = useContext(AuthContext);

    const [inputs, setInputs] = useState({
        email:'',
        name: '',
        phone: '',
        password: '',
    });

    const [errors, setErrors] = useState({
        emailErr: '',
        nameErr: '',
        phoneErr: '',
        passwordErr: '',
    });

    const validation = (field:string) => {
        let isValid = true;

        //* Handle client side input error */
        switch(field){
            case "email":
                if (!inputs.email) { //For email
                    handleError('Email field cannot be empty', 'emailErr');
                    isValid = false;
                } else if (!inputs.email.match(/\S+@\S+\.\S+/)) {
                    handleError('Invalid email format', 'emailErr');
                    isValid = false;
                }
                break;
            case "name": //For name
                if (!inputs.name) {
                    handleError('Name field cannot be empty', 'nameErr');
                    isValid = false;
                } else if (!inputs.name.match(/^[A-Za-z][A-Za-z\s\-]*[A-Za-z]$/)) {
                    handleError('Invalid name format', 'nameErr');
                    isValid = false;
                }
                break;
            case "phone": //For phone
                if (!inputs.phone) {
                    handleError('Phone field cannot be empty', 'phoneErr');
                    isValid = false;
                } else if (!inputs.phone.match(/^\d{10,11}$/)) {
                    handleError('Invalid phone format. Must be 10 or 11 digits only.', 'phoneErr');
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
        setInputs(prevState => ({ ...prevState, [input]: text}));
    }

    const handleError = (error:any, input:any) => {
        setErrors(prevState => ({...prevState, [input]: error}));
    };

    return (
        <>
            <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#E6E6FA", paddingTop: 50, paddingHorizontal: 15}}>
            <Text style={styles.header}>Create Account</Text>
            <Text style={styles.description}>Please sign up to login</Text>
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
                    label="Name"
                    iconName="account-outline"
                    placeholder="Enter name"
                    value={inputs.name}
                    error={errors.nameErr}
                    onChangeText={(text:any) => handleOnChange(text, 'name')}
                    onFocus={()=> handleError(null, 'nameErr')}
                    onBlur={() => validation("name")}
                />
                <InputWithLabel
                    label="Phone Number"
                    iconName="phone-outline"
                    placeholder="Enter phone number"
                    value={inputs.phone}
                    error={errors.phoneErr}
                    onChangeText={(text:any) => handleOnChange(text, 'phone')}
                    onFocus={()=> handleError(null, 'phoneErr')}
                    onBlur={() => validation("phone")}
                    keyboardType="number-pad"
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
                    title="Register"
                    onPress={()=>{register(inputs.email, inputs.password, inputs.name, inputs.phone)}}
                    disabled={loading}
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