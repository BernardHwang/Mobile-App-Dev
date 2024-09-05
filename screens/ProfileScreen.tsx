import React, {useState, useEffect, useContext} from 'react';
import { View, Text, StyleSheet, Button, Image, TouchableOpacity } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

const ProfileScreen = ({navigation, route}:any) => {
  const {user, logout} =  useContext(AuthContext);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "#fff"}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{justifyContent: 'center', alignItems:'center'}}
        showsVerticalScrollIndicator={false}
      >
        <Image style={styles.profileImage} source={{ uri: user.photoURL }}/>
        <Text style={{}}>{user.displayName}</Text>

        <View>
          <TouchableOpacity onPress={()=>{}}>
            <Text>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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

