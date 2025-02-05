import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore'; // Import from @react-native-firebase
import Icon from 'react-native-vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';
import { Timestamp } from 'firebase-admin/firestore';
import moment from 'moment';

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
        timestamp: doc.data().timestamp.toDate()
      })).sort((a, b) => b.timestamp - a.timestamp);
      
      setNotifications(notificationDocs);
    } catch (error) {
      console.log("Error fetching notifications: ", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      if (!user || !user.uid) return;

      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('notifications')
        .doc(notificationId)
        .delete();

      setNotifications((prevNotifications) => 
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.log("Error deleting notification: ", error);
    }
  };

  const renderRightActions = (notificationId) => {
    return (
      <TouchableOpacity onPress={() => deleteNotification(notificationId)} style={styles.deleteButton}>
        <Icon name="trash-bin-outline" size={35} color="white" />
      </TouchableOpacity>
    );
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
          renderItem={({ item, index }) => (
            <Swipeable
              renderRightActions={() => renderRightActions(item.id)}
            >
              <View style={[
                styles.notificationItem,
                { backgroundColor: index % 2 === 0 ? '#ededf7' : '#fff' } // Alternate colors for even and odd rows
              ]}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={{fontSize: 12,}}>{moment(item.timestamp).format('D MMM HH:mm')}</Text>
                </View>
                <View>
                  <Text style={styles.text}>{item.message}</Text>
                </View>
              </View>
            </Swipeable>
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3e2769'
  },
  text: {
    fontSize: 15,
    textAlign: 'justify'
  },
  notificationItem: {
    flex: 1,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    height: 100,
    width: Dimensions.get('window').width,
  },
  noNotificationsText: {
    fontSize: 18,
    color: 'gray',
    fontWeight: 'bold'
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    backgroundColor: 'red',
    height: 100
  },
});

export default NotificationScreen;
