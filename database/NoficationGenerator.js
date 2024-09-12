import React, { useContext, useEffect } from "react";
import { SocketContext } from "../navigation/SocketProvider";
import { AuthContext } from "../navigation/AuthProvider";
import firestore from "@react-native-firebase/firestore";

const NotificationListener = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    console.log('Receiving message from SocketIo server')

    // Listen for event notifications from the server
    socket.on('eventNotification', async ({ notification, userId }) => {
      try {
        if (userId === user.uid) {
          const userNotificationsRef = await firestore().collection('users').doc(userId).collection('notifications');
          await userNotificationsRef.doc().set({
            title: notification.title,
            message: notification.message,
            timestamp: firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Error saving notification:", error);
      }
    });

    socket.on('participationNotification', async ({ notification, userId }) => {
        try {
          if (userId === user.uid) {
            const userNotificationsRef = await firestore().collection('users').doc(userId).collection('notifications');
            await userNotificationsRef.doc().set({
              title: notification.title,
              message: notification.message,
              timestamp: firestore.FieldValue.serverTimestamp(),
            });
          }
        } catch (error) {
          console.error("Error saving notification:", error);
        }
      });

    // Clean up the socket listener when the component unmounts
    return () => {
      socket.off('eventNotification');
      socket.off('participationNotification');
    };
  }, [user, socket]);

  return null;
};

export default NotificationListener;
