import React, { useContext, useEffect } from "react";
import { SocketContext } from "../navigation/SocketProvider";
import { AuthContext } from "../navigation/AuthProvider";
import firestore from "@react-native-firebase/firestore";

const NotificationListener = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    console.log('Receiving message from SocketIo server')

    const handleNotification = async ({ notification, userId }) => {
      try {
        if (userId === user.uid) {
          const userNotificationsRef = firestore().collection('users').doc(userId).collection('notifications');
          await userNotificationsRef.doc().set({
            title: notification.title,
            message: notification.message,
            timestamp: firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Error saving notification:", error);
      }
    };

    // Listen for event notifications from the server
    socket.on('eventNotification', handleNotification);
    socket.on('participationNotification', handleNotification);
    socket.on('notificationStatuseventNotificationStatus', handleNotification);


    // Clean up the socket listener when the component unmounts
    return () => {
      socket.off('eventNotification');
      socket.off('participationNotification');
    };
  }, [user, socket]);

  return null;
};

export default NotificationListener;
