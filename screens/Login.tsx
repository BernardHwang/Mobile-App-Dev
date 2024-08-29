import { View, Text, TextInput } from 'react-native'
import React, { useState } from 'react'
import app from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <View>
      <Text>Login</Text>
      <TextInput style={{margin: 1}}></TextInput>
    </View>
  )
}

export default Login