const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');

var serviceAccount = require('./ezpz-mobile-app-y2s3-firebase-adminsdk-ibdsw-f35c4ef927.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ezpz-mobile-app-y2s3.firebaseio.com'
});

const db = admin.firestore();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const eventsCollectionRef = db.collection('events');

// Helper function to fetch user data by ID
const getUserData = async (userId) => {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        console.error(`User with ID ${userId} not found.`);
        return null;
    }
    return userDoc.data();
};


// Helper function to fetch event data by ID
const getEventData = async (eventId) => {
    const eventDoc = await eventsCollectionRef.doc(eventId).get();
    if (!eventDoc.exists) {
        console.error(`Event with ID ${eventId} not found.`);
        return null;
    }
    return eventDoc.data();
};

//Set up a listener for event creation
eventsCollectionRef.onSnapshot(async snapshot => {
    snapshot.docChanges().forEach(async (change) => {
        const eventData = change.doc.data();
        const hostId = eventData.host_id;
        const eventId = change.doc.id;

        const userData = await getUserData(hostId);
        if (!userData) return;

        let notification = {};
        const eventName = eventData.name;

        if (change.type === 'added') {
            notification = {
                title: 'Successfully Posted Event',
                message: `Congratulations ${userData.name}, you have successfully posted the ${eventName}.`
            };
        } else if (change.type === 'modified') {
            notification = {
                title: 'Successfully Modified Event',
                message: `The ${eventName}'s event details have been updated.`
            };
        } else if (change.type === 'removed') {
            notification = {
                title: 'Event Removed',
                message: `The event ${eventName} has been removed.`
            };
        }

        // Emit the notification to all connected clients
        console.log(notification);
        io.emit('eventNotification', { notification, userId: hostId });
    });
});


io.on('connection', (socket) => {
    console.log('A user connected');

    // Set up a listener for participants in events
    socket.on('joinEvent', async ({eventId, userId}) => {
        try {
            const userData = await getUserData(userId);
            const eventData = await getEventData(eventId);
    
            if (!userData || !eventData) {
                console.error('Invalid user or event data.');
                return;
            }
    
            // Check if the user's participant document exists
            const participantDocRef = await eventsCollectionRef
                .doc(eventId)
                .collection('eventParticipant')
                .doc(userId)
                .get();
    
            let notification = {}; 
    
            if (participantDocRef.exists) {
                // User successfully joined the event
                notification = {
                    title: 'Successfully Joined Event',
                    message: `Congratulations ${userData.name}, you have joined the event: ${eventData.name}.`
                };
            } else {
                // User failed to join the event
                notification = {
                    title: 'Failed to Join Event',
                    message: `Unfortunately ${userData.name}, you failed to join the event: ${eventData.name}.`
                };
            }
    
            // Emit the notification for participation changes (either success or failure)
            console.log(notification);
            socket.emit('participationNotification', { notification, userId });
    
        } catch (error) {
            console.error('Error checking for user document:', error);
        }
    });

    socket.on('unjoinEvent', async ({eventId, userId}) => {
        try {
            const userData = await getUserData(userId);
            const eventData = await getEventData(eventId);
    
            if (!userData || !eventData) {
                console.error('Invalid user or event data.');
                return;
            }
    
            // Check if the user's participant document exists
            const participantDocRef = await eventsCollectionRef
                .doc(eventId)
                .collection('eventParticipant')
                .doc(userId)
                .get();
    
            let notification = {}; 
    
            if (!participantDocRef.exists) {
                // User successfully left the event
                notification = {
                    title: 'Successfully Left Event',
                    message: `Congratulations ${userData.name}, you left the event: ${eventData.name}.`
                };
            } else {
                // User failed to leave the event
                notification = {
                    title: 'Failed to Leave Event',
                    message: `Unfortunately ${userData.name}, you failed to leave the event: ${eventData.name}.`
                };
            }
    
            // Emit the notification for participation changes (either success or failure)
            console.log(notification);
            socket.emit('participationNotification', { notification, userId });
    
        } catch (error) {
            console.error('Error checking for user document:', error);
        }
    });

    socket.on('eventNotificationStatus', async ({eventId, userId}) => {
        try {
            const userData = await getUserData(userId);
            const eventData = await getEventData(eventId);
    
            if (!userData || !eventData) {
                console.error('Invalid user or event data.');
                return;
            }
    
            // Check if the user's participant document exists
            const participantDocRef = await eventsCollectionRef
                .doc(eventId)
                .collection('eventParticipant')
                .doc(userId)
                .get();
    
            let notification = {}; 
            const notificationState = participantDocRef.data().notification_status;

            if (notificationState) {
                // User successfully left the event
                notification = {
                    title: `Turn On Notification`,
                    message: `Dear ${userData.name}, any update from ${eventData.name} will be notified to you.`
                };
            } else {
                // User failed to leave the event
                notification = {
                    title: `Turn Off Notification`,
                    message: `Dear ${userData.name}, any update from ${eventData.name} will not be notified to you.`
                };
            }
    
            // Emit the notification for participation changes (either success or failure)
            console.log(notification);
            socket.emit('participationNotification', { notification, userId });
    
        } catch (error) {
            console.error('Error checking for user document:', error);
        }
    });


    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
