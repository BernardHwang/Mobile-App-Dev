import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

//use socket to send message, flatlist to display message
const NotificationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notification Screen</Text>
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
});

export default NotificationScreen;

