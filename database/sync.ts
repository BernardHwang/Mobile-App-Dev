import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { cancelEventLocally, createEventLocally, editEventLocally, getDBConnection } from './db-services';
import { Event, User } from '../Types';

// Check online or offline mode
export const checkInternetConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected; // returns true if the device is connected to the internet
    } catch (error) {
      console.error("Failed to check internet connection:", error);
      return false; // in case of error, assume no connection
    }
  };

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
      await db.transaction(tx => {
        usersData.forEach(user => {
          tx.executeSql(
            `INSERT OR REPLACE INTO users (user_id, name, pfp, phone, email)
             VALUES (?, ?, ?, ?, ?)`,
            [user.user_id, user.name, user.pfp, user.phone, user.email]
          );
        });
      });
        console.log('Users data synced successfully');
      } catch (error) {
        console.error('Error syncing users data: ', error);
      }
    };

    // Function to sync events data from Firestore to SQLite
    export const syncEventsData = async (db: SQLiteDatabase) => {
      try {
        await db.transaction(tx => {
          tx.executeSql('DELETE FROM events', [],
            () => console.log('Events table cleared'),
            (tx, error) => console.error('Error clearing events table:', error)
          );
        });
        // Fetch events from Firestore
        const eventsSnapshot = await firestore().collection('events').get();

        const eventsData: Event[] = eventsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            event_id: doc.id,
            start_date: data.start_date.toDate().toISOString(),
            end_date: data.end_date.toDate().toISOString(),
            name: data.name,
            description: data.description,
            location: data.location,
            seats: parseInt(data.seats, 10),
            guest: data.guest,
            image: data.image,
            host_id: data.host_id
          };
        });
        // Insert or update events in SQLite
        await db.transaction(tx => {
          eventsData.forEach(event => {
            tx.executeSql(
              `INSERT OR REPLACE INTO events (event_id, name, description, start_date, end_date, location, seats, guest, image, host_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [event.event_id, event.name, event.description, event.start_date, event.end_date, event.location, event.seats, event.guest, event.image, event.host_id]
            );
          });
        });
        console.log('Events data synced successfully');
      } catch (error) {
        console.error('Error syncing events data: ', error);
      }
    };

  // Function to sync event participants data from Firestore to SQLite
  export const syncEventsParticipantsData = async (db: SQLiteDatabase) => {
      try {
        await db.transaction(tx => {
          tx.executeSql('DELETE FROM events_participants', [],
            () => console.log('Events_Participants table cleared'),
            (tx, error) => console.error('Error clearing events_participants table:', error)
          );
        });
        // Fetch all events
        const eventsSnapshot = await firestore().collection('events').get();

        // Iterate through each event to fetch participants
        for (const eventDoc of eventsSnapshot.docs) {
          const eventID = eventDoc.id;

          // Fetch participants for the event
          const participantsSnapshot = await firestore().collection(`events/${eventID}/eventParticipant`).get();
          const participantsData = participantsSnapshot.docs.map(doc => ({
              participant_id: doc.data().participant_id,
              notification_status: doc.data().notification_status
          }));

          // Insert or update event participants in SQLite
          for (const participant of participantsData) {
            await db.executeSql(
              `INSERT OR REPLACE INTO events_participants (event_id, participant_id)
               VALUES (?, ?)`,
              [eventID, participant.participant_id]
            );
          }
        }

        console.log('Event participants data synced successfully');
      } catch (error) {
        console.error('Error syncing event participants data: ', error);
      }
    };

  export const _sync = async() => {
      const db = await getDBConnection();
      await syncUsersData(db);
      await syncEventsData(db);
      await syncEventsParticipantsData(db);
    }

//********************* */
//IF NO NEED CRUD DURING OFFLINE CAN REMOVE ALL BELOW
//************************* */
export const syncOfflineData = async (db: SQLiteDatabase) => {
  try {
    const unsyncedEvents = await getUnsyncedEvents(db); // Custom function to fetch unsynced data

    unsyncedEvents.forEach(async (event) => {
      await firestore().collection('events').doc(event.event_id).set(event);
      // After successful sync, mark as synced
      await markEventAsSynced(db, event.event_id);
    });

    console.log('Offline data synced to Firestore');
  } catch (error) {
    console.error('Failed to sync offline data:', error);
  }
};

const getUnsyncedEvents = async (db: SQLiteDatabase): Promise<Event[]> => {
    const query = `SELECT * FROM events WHERE sync_status='unsynced'`;
    const results = await db.executeSql(query);
    const eventsData: Event[] = [];  // Explicitly declare eventsData as an array of Event objects
    results.forEach(result => {
      result.rows.raw().forEach((item: Event) => {
        eventsData.push(item);
      });
    });
    return eventsData;
}

const markEventAsSynced = async (db: SQLiteDatabase, eventId:string) => {
  const query = `UPDATE events SET sync_status='synced' WHERE event_id=?`;
  await db.executeSql(query, [eventId]);
};

export const listenForFirestoreChanges = async (db: SQLiteDatabase) => {
    firestore().collection('events').onSnapshot((querySnapshot) => {
      querySnapshot.docChanges().forEach(async (change) => {
        const data = change.doc.data();
        if (data) {
            // Manually map DocumentData to Event type
            const event: Event = {
              event_id: change.doc.id, // Use doc ID as event_id
              name: data.name,
              description: data.description,
              start_date: data.start_date,
              end_date: data.end_date,
              location: data.location,
              seats: data.seats,
              guest: data.guest,
              image: data.image,
              host_id: data.host_id,
              //sync_status: data.sync_status || 'synced'  // You can set a default for sync_status if needed
            };

            if (change.type === 'added') {
              await createEventLocally(db, event); // Insert into SQLite
            } else if (change.type === 'modified') {
              await editEventLocally(db, event); // Update in SQLite
            } else if (change.type === 'removed') {
              await cancelEventLocally(db, event.event_id); // Delete from SQLite
            }
      }});
    });
  };
