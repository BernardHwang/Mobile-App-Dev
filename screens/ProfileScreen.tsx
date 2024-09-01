import React, {useState, useEffect, useContext} from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider';

const ProfileScreen = ({navigation, route}:any) => {
  const {user, logout} =  useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome {user.email}</Text>
      <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
      <Button title="Logout" onPress= {()=> logout()}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
});

export default ProfileScreen;

