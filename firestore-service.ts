import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Event } from './Types';

// Function to get events hosted by a specific user
export const getHostEventsByUserID = async (user_id: string): Promise<any[]> => {
    try {
        const eventsRef = firestore().collection('events');
        const snapshot = await eventsRef.where('host_id', '==', user_id).get();
        
        if (snapshot.empty) {
            console.log('No matching documents.');
            return [];
        }

        const eventsData: any[] = [];
        snapshot.forEach(doc => {
            eventsData.push({ id: doc.id, ...doc.data() });
        });
        
        return eventsData;
    } catch (error) {
        console.error('Failed to get host events: ', error);
        throw new Error('Failed to get host events');
    }
};

// Function to get events where a specific user is a participant
export const getJoinEventsByUserID = async (user_id: string): Promise<any[]> => {
  try {
      const eventsRef = firestore().collection('events');
      const eventDocs = await eventsRef.get(); // Get all events

      const joinedEvents: any[] = [];

      for (const doc of eventDocs.docs) {
          const eventParticipantsRef = doc.ref.collection('eventParticipant');
          const participantsSnapshot = await eventParticipantsRef.where('participant_id', '==', user_id).get();
          
          if (!participantsSnapshot.empty) {
              joinedEvents.push({ id: doc.id });
          }
      }

      return joinedEvents;
  } catch (error) {
      console.error('Failed to get joined events: ', error);
      throw new Error('Failed to get joined events');
  }
};

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

// Function to add an event to Firestore
export const createEventOnline = async (eventData: Event) => {
  try {
    const eventDataFirestore = {
        event_id:eventData.event_id,
        name: eventData.name,
        description: eventData.description,
        start_date: FirebaseFirestoreTypes.Timestamp.fromDate(new Date(eventData.start_date)), 
        end_date: FirebaseFirestoreTypes.Timestamp.fromDate(new Date(eventData.end_date)),      
        location: eventData.location,
        seats: eventData.seats,
        guest: eventData.guest,
        image: eventData.image,
        host_id: eventData.host_id
    }
    await firestore().collection('events').add(eventDataFirestore);
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
        start_date: FirebaseFirestoreTypes.Timestamp.fromDate(new Date(updateData.start_date)), 
        end_date: FirebaseFirestoreTypes.Timestamp.fromDate(new Date(updateData.end_date)),      
        location: updateData.location,
        seats: updateData.seats,
        guest: updateData.guest,
        image: updateData.image
    }
    await firestore().collection('events').doc(eventData.event_id).update(eventDataFirestore);
    console.log('Event added successfully in Firestore!');
  } catch (error) {
    console.error('Error updating event: ', error);
  }
}

export const cancelEventOnline = async(eventID: string) => {
  try{
    await firestore().collection('events').doc(eventID).delete();
    console.log('Event cancelled successfully!');
  }catch(error){
    console.error('Error canceling event: ', error);
  }
}

export const joinEvent = async(participant_id: string, event_id: string) => {
  try{
    const eventsParticipantsRef = await firestore().collection('events').doc(event_id).collection('eventParticipant');
    await eventsParticipantsRef.doc(participant_id).set({participant_id: participant_id});
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