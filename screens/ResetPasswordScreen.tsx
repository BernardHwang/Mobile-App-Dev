import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React, {useState, useContext} from 'react'
import { AuthContext } from '../navigation/AuthProvider.js';
import { InputWithLabel, AppButton} from '../UI.tsx'

const ForgetPasswordScreen = ({ navigation, route }: any) => {

  const { resetPassword } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState<any>('');

  const validation = (input: any) => {
    let isValid = true;

    //* Handle client side input error */
    if (!input) { //For email
      setEmailErr('Email field cannot be empty');
        isValid = false;
    } else if (!email.match(/\S+@\S+\.\S+/)) {
      setEmailErr('Invalid email format');
      isValid = false;
    } else {
      setEmailErr(null);
      isValid = true;
    }

    return isValid;
  }

  const handleEmailChange = (input: any) => {
    setEmail(input);
    validation(input);
  }

    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#E6E6FA", paddingTop: 50, paddingHorizontal: 15}}>
          <Text style={styles.header}>Reset your Password</Text>
          <Text style={styles.description}>Enter your email address</Text>
          <InputWithLabel
            label="Email"
            iconName="email-outline"
            placeholder="Enter email address"
            value={email}
            error={emailErr}
            onChangeText={handleEmailChange}
            onFocus={() => validation(email)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <AppButton
            title="Continue"
            onPress= {() => {resetPassword(email)}}
          />
        <View style={{ flex: .1, backgroundColor: "#E6E6FA", flexDirection: "row", marginLeft: 30 }}>
          <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#723AA0", textDecorationLine: "underline" }}>Return to login</Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
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
})

export default ForgetPasswordScreen