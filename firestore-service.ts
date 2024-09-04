// firestoreService.js
import firestore from '@react-native-firebase/firestore';
import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { getUsers } from './db-services';
import { User, Event } from './Types';

interface EventData {
  id: any;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  guest: string;
  description: string;
  seats: number;
  image: string;
  hostID: any;
}

// Function to sync users data from Firestore to SQLite
export const syncUsersData = async (db: SQLiteDatabase) => {
    try {
      // Fetch users from Firestore
      const usersSnapshot = await firestore().collection('users').get();
      const usersData: User[] = usersSnapshot.docs.map(doc => ({
        user_id: doc.id,
        ...doc.data() as Omit<User, 'user_id'>
    }));
  
      // Insert or update users in SQLite
      for (const user of usersData) {
        await db.executeSql(
          `INSERT OR REPLACE INTO users (user_id, name, profile_pic, phone, email, password)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [user.user_id, user.name, user.profile_pic, user.phone, user.email, user.password]
        );
      }
      console.log('Users data synced successfully');
    } catch (error) {
      console.error('Error syncing users data: ', error);
    }
  };
  
  // Function to sync events data from Firestore to SQLite
  export const syncEventsData = async (db: SQLiteDatabase) => {
    try {
      // Fetch events from Firestore
      const eventsSnapshot = await firestore().collection('events').get();
      const eventsData: Event[] = eventsSnapshot.docs.map(doc => ({
        event_id: doc.id,
        ...doc.data() as Omit<Event, 'event_id'>
      }));
  
      // Insert or update events in SQLite
      for (const event of eventsData) {
        await db.executeSql(
          `INSERT OR REPLACE INTO events (event_id, name, description, start_date, end_date, location, seats, guest, image, host_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [event.event_id, event.name, event.description, event.start_date, event.end_date, event.location, event.seats, event.guest, event.image, event.host_id]
        );
      }
      console.log('Events data synced successfully');
    } catch (error) {
      console.error('Error syncing events data: ', error);
    }
  };
  
// Function to sync event participants data from Firestore to SQLite
export const syncEventsParticipantsData = async (db: SQLiteDatabase) => {
    try {
      // Fetch all events
      const eventsSnapshot = await firestore().collection('events').get();

      // Iterate through each event to fetch participants
      for (const eventDoc of eventsSnapshot.docs) {
        const eventID = eventDoc.id;

        // Fetch participants for the event
        const participantsSnapshot = await firestore().collection(`events/${eventID}/eventparticipants`).get();
        const participantsData = participantsSnapshot.docs.map(doc => ({
            participants_id: doc.data().user_id
        }));

        // Insert or update event participants in SQLite
        for (const participant of participantsData) {
          await db.executeSql(
            `INSERT OR REPLACE INTO events_participants (event_id, participant_id)
             VALUES (?, ?)`,
            [eventID, participant.participants_id]
          );
        }
      }
  
      console.log('Event participants data synced successfully');
    } catch (error) {
      console.error('Error syncing event participants data: ', error);
    }
  };

// Function to add an event to Firestore
export const createEvent = async (eventData: EventData) => {
  try {
    await firestore().collection('events').add(eventData);
    console.log('Event added successfully!');
  } catch (error) {
    console.error('Error adding event: ', error);
  }
};
