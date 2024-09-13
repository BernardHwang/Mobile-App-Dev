import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Event } from '../Types';
import moment from 'moment';

// Function to get event by event ID
export const getEvents = async (event_id: string): Promise<any> => {
  try {
    // Directly access the document by its ID
    const eventDoc = await firestore().collection('events').doc(event_id).get();

    if (!eventDoc.exists) {
      console.log('No matching document.');
      return null; // Return null if the document doesn't exist
    }

    const data = eventDoc.data();

      // Convert Firestore Timestamps to JavaScript Dates
      if (data.start_date && data.start_date.toDate) {
          data.start_date = data.start_date.toDate().toISOString(); // Convert to JavaScript Date
      }
      if (data.end_date && data.end_date.toDate) {
          data.end_date = data.end_date.toDate().toISOString(); // Convert to JavaScript Date
      }
    // Return the event data, including the document ID
    return {
      id: eventDoc.id,  // Firestore document ID
      ...data // Spread the event data fields
    };
    
  } catch (error) {
    console.error('Failed to get event: ', error);
    throw new Error('Failed to get event');
  }
};

// Function to get events hosted by a specific user
export const getHostEventsByUserIDOnline = async (user_id: string): Promise<any[]> => {
    try {
        const eventsRef = firestore().collection('events');
        const snapshot = await eventsRef.where('host_id', '==', user_id).get();
        
        if (snapshot.empty) {
            console.log('No matching documents.');
            return [];
        }

        const eventsData: any[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();

            // Convert Firestore Timestamps to JavaScript Dates
            if (data.start_date && data.start_date.toDate) {
                data.start_date = data.start_date.toDate().toISOString(); // Convert to JavaScript Date
            }
            if (data.end_date && data.end_date.toDate) {
                data.end_date = data.end_date.toDate().toISOString(); // Convert to JavaScript Date
            }
            eventsData.push({ id: doc.id, ...data });
        });
        
        return eventsData;
    } catch (error) {
        console.error('Failed to get host events online: ', error);
        throw new Error('Failed to get host events online');
    }
};

// Function to get events where a specific user is a participant
export const getJoinEventsByUserIDOnline = async (user_id: string): Promise<any[]> => {
  try {
      const eventsRef = firestore().collection('events');
      const eventDocs = await eventsRef.get(); // Get all events

      const joinedEvents: any[] = [];

      for (const doc of eventDocs.docs) {
          const eventParticipantsRef = doc.ref.collection('eventParticipant');
          const participantsSnapshot = await eventParticipantsRef.where('participant_id', '==', user_id).get();
          
          if (!participantsSnapshot.empty) {
            const eventData = doc.data();
            if (eventData.start_date && eventData.start_date.toDate) {
                eventData.start_date = eventData.start_date.toDate().toISOString(); // Convert to JavaScript Date
            }
            if (eventData.end_date && eventData.end_date.toDate) {
                eventData.end_date = eventData.end_date.toDate().toISOString(); // Convert to JavaScript Date
            }
            joinedEvents.push({ id: doc.id, ...eventData });
          }
      }

      return joinedEvents;
  } catch (error) {
      console.error('Failed to get joined events: ', error);
      throw new Error('Failed to get joined events');
  }
};

//Get participants
export const getEventsParticipantsByEventID = async (event_id: string): Promise<any[]> => {
  try {
      const eventParticipantsRef = firestore().collection('events').doc(event_id).collection('eventParticipant');
      const snapshot = await eventParticipantsRef.get();
      
      if (snapshot.empty) {
          console.log('No participants found for this event.');
          return [];
      }

      const participantsData: any[] = [];
      snapshot.forEach(doc => {
          participantsData.push(doc.data());
      });
      
      return participantsData;
  } catch (error) {
      console.error('Failed to get event participants: ', error);
      throw new Error('Failed to get event participants');
  }
};

//Get participant details
export const getParticipantsByEventID = async (event_id: string): Promise<any[]> => {
  try {
    const userRef = firestore().collection('users');
    const participantsRef = firestore().collection('events').doc(event_id).collection('eventParticipant');
    const participantsSnapshot = await participantsRef.get();
    
    const participantIds = participantsSnapshot.docs.map(doc => doc.data().participant_id);
    
    if (participantIds.length === 0) {
      return []; // No participants found
    }

    const usersSnapshot = await userRef.where(firestore.FieldPath.documentId(), 'in', participantIds).get();
    const joinedUsers: any[] = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return joinedUsers;
  } catch (error) {
    console.error('Failed to get event participants: ', error);
    throw new Error('Failed to get event participants');
  }
};

// Function to add an event to Firestore
export const createEventOnline = async (eventData: Event) => {
  try {
    const eventDataFirestore = {
        name: eventData.name,
        description: eventData.description,
        start_date: firestore.Timestamp.fromDate(new Date(eventData.start_date)), 
        end_date: firestore.Timestamp.fromDate(new Date(eventData.end_date)),    
        location: eventData.location,
        seats: eventData.seats,
        guest: eventData.guest,
        image: eventData.image,
        host_id: eventData.host_id
    }
    await firestore().collection('events').doc(eventData.event_id).set(eventDataFirestore);
    console.log('Event added successfully in Firestore!');
  } catch (error) {
    console.error('Error adding event: ', error);
  }
};

export const updateEventOnline = async(eventData: Event) => {
  try {
    const { host_id, ...updateData } = eventData;
    const eventDataFirestore = {
        name: updateData.name,
        description: updateData.description,
        start_date: firestore.Timestamp.fromDate(new Date(updateData.start_date)), 
        end_date: firestore.Timestamp.fromDate(new Date(updateData.end_date)),      
        location: updateData.location,
        seats: updateData.seats,
        guest: updateData.guest,
    }
    await firestore().collection('events').doc(eventData.event_id).update(eventDataFirestore);
    console.log('Event added successfully in Firestore!');
  } catch (error) {
    console.error('Error updating event: ', error);
  }
}

export const cancelEventOnline = async(eventID: string) => {
  try{
    const docRef = firestore().collection('events').doc(eventID);
    const deleteSubcollection = async (collectionPath) => {
      const subcollectionRef = firestore().collection(collectionPath);
      const querySnapshot = await subcollectionRef.get();
      const batch = firestore().batch();
      
      querySnapshot.forEach(doc => {
          batch.delete(doc.ref);
      });

      await batch.commit();
    };
    await deleteSubcollection(`events/${eventID}/eventParticipant`);
    docRef.delete();
    console.log('Event cancelled successfully!');
  }catch(error){
    console.error('Error canceling event: ', error);
  }
}

export const joinEvent = async(participant_id: string, event_id: string) => {
  try{
    const eventsParticipantsRef = await firestore().collection('events').doc(event_id).collection('eventParticipant');
    await eventsParticipantsRef.doc(participant_id).set({participant_id: participant_id, notification_status: false});
    console.log('Joined event successfully');
  }catch(error){
    console.error('Error joining event: ', error);
  }
}

export const unjoinEvent = async(participant_id: string, event_id: string) => {
  try{
    const eventsParticipantsRef = await firestore().collection('events').doc(event_id).collection('eventParticipant');
    await eventsParticipantsRef.doc(participant_id).delete();
    console.log('Unjoined event successfully');
  }catch(error){
    console.error('Error unjoining event: ', error);
  }
}

 export const fetchEventsForSelectedDay = async (day: moment.MomentInput) => {
  try {
    const eventsRef = firestore().collection('events');
    const querySnapshot = await eventsRef.get();

    const fetchedEvents = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const eventStartDate = moment(data.start_date.toDate()).local(); // Start date in local time
        const eventEndDate = moment(data.end_date.toDate()).local(); // End date in local time

        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          image: data.image,
          location: data.location,
          start_time: eventStartDate.format('HH:mm'), // Format time in local time
          start_date: eventStartDate.toISOString(),
          end_time: eventEndDate.format('HH:mm'),
          end_date: eventEndDate.toISOString(), // Keep the end date for comparison
          guest: data.guest,
          seats: data.seats,
          host_id: data.host_id
        };
      })
      .filter((event) => moment(event.start_date).isSameOrBefore(day, 'day') && moment(event.end_date).isSameOrAfter(day, 'day')) // Filter by date range
      .sort((a, b) => moment(a.start_time, 'HH:mm').diff(moment(b.start_time, 'HH:mm')));

    return fetchedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

export const getEventNotificationStatus = async (event_id: string, user_id: string) => {
  const participantDoc = await firestore().collection('events').doc(event_id).collection('eventParticipant').doc(user_id).get();
  const notificationStatus = participantDoc.data()?.notification_status;
  
  return notificationStatus;
}

export const changeEventNotificationStatus = async (event_id: string, user_id: string) => {
  const eventsParticipantsRef = firestore().collection('events').doc(event_id).collection('eventParticipant').doc(user_id);

  // Get the current notification status
  const participantDoc = await eventsParticipantsRef.get();

  if (participantDoc.exists) {
    const notificationStatus = participantDoc.data()?.notification_status;

    // Toggle the notification status
    await eventsParticipantsRef.update({
      notification_status: !notificationStatus,
    });

    console.log(`Notification status changed to ${!notificationStatus}`);
  } else {
    console.error('Participant not found');
  }
};
