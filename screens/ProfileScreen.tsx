import React, {useState, useEffect, useContext} from 'react';
import { View, Text, StyleSheet, Button, Image, TouchableOpacity } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

const ProfileScreen = ({navigation, route}:any) => {
  const {user, logout} =  useContext(AuthContext);

  return (
    <View style={styles.container}>
        <Image style={styles.profileImage} source={{ uri: user.photoURL }} />
        <Text style={{}}>{user.displayName}</Text>
        <View>
          <TouchableOpacity onPress={() => { }}>
            <Text>Edit Profile</Text>
          </TouchableOpacity>
          <Button title="Logout" onPress={() => logout()} />
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

