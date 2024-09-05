import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore'; // Import from @react-native-firebase

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

  const getNotification = async () => {
    try {
      if (!user || !user.uid) return;

      const subDocs = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('notifications')
        .get();

      const notificationDocs = subDocs.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        message: doc.data().message,
      }));

      setNotifications(notificationDocs);
    } catch (error) {
      console.error("Error fetching notifications: ", error);
    }
  };

  useEffect(() => {
    getNotification();
  }, [user]);

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.noNotificationsText}>No notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationItem}>
              <Text style={styles.text}>ID: {item.id}</Text>
              <Text style={styles.text}>Title: {item.title}</Text>
              <Text style={styles.text}>Message: {item.message}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 18,
  },
  notificationItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  noNotificationsText: {
    fontSize: 18,
    color: 'gray',
  },
});

export default NotificationScreen;
