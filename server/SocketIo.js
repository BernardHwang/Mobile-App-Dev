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

//Set up a global listener for participants in events
eventsCollectionRef.onSnapshot(async snapshot => {
    snapshot.docChanges().forEach(async (change) => {
        const eventId = change.doc.id;
        const eventParticipantsRef = eventsCollectionRef.doc(eventId).collection('eventParticipant');

        try {
            const participantSnapshot = await eventParticipantsRef.get();
            // Ensure the participant subcollection exists
            if (!participantSnapshot.empty) {
                // Listen for real-time changes in the participant subcollection
                eventParticipantsRef.onSnapshot(async (participantSnapshot) => {
                    participantSnapshot.docChanges().forEach(async (participantChange) => {
                        const userId = participantChange.doc.id;

                        const userData = await getUserData(userId);
                        const eventData = await getEventData(eventId);

                        if (!userData || !eventData) return;

                        let notification = {};

                        if (participantChange.type === 'added') {
                            notification = {
                                title: 'Successfully Joined Event',
                                message: `Congratulations ${userData.name}, you have joined the event: ${eventData.name}.`
                            };
                        } else if (participantChange.type === 'removed') {
                            notification = {
                                title: 'Left Event',
                                message: `You have left the event: ${eventData.name}.`
                            };
                        }
                        // Emit the notification for participation changes
                        console.log(notification);
                        io.emit('participationNotification', { notification, userId });
                    });
                });
            } else {
                console.log(`No participants found for event ${eventId}`);
            }
        } catch (error) {
            console.error(`Error accessing participants for event ${eventId}:`, error);
        }
    });
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', (msg) => {
        console.log('Message received:', msg);
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
