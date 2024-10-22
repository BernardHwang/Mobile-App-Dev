import { SQLiteDatabase, enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { Event } from '../Types';
import moment from 'moment';
const databaseName = 'db';
let db: SQLiteDatabase | null = null;

enablePromise(true);

export const getDBConnection = async() => {
    if (db !== null) {
        console.log('Database connection already open.');
        return db; // Return the already opened database
      }

      try {
        db = await openDatabase(
          { name: `${databaseName}`}, // Ensure the correct name and location
          openCallback,
          errorCallback
        );
        return db; // Return the database connection after opening
      } catch (error) {
        console.error('Error opening database: ', error);
        throw error; // Throw error for further handling
      }
}

const openCallback = () => {
    console.log('database open success');
}

const errorCallback = (err: any) => {
    console.log('Error in opening the database: '+err);
}

export const closeDBConnection = async (): Promise<void> => {
    if (db !== null) {
      console.log('Closing database...');
      try {
        await db.close(); // Close the database connection
        console.log('Database closed successfully.');
      } catch (error) {
        console.error('Error closing the database: ', error);
      } finally {
        db = null; // Reset the global db variable
      }
    } else {
      console.log('Database connection was already closed.');
    }
  };

export const createUsersTable = async(db: SQLiteDatabase) => {
    try{
        const query = `CREATE TABLE IF NOT EXISTS users (
                            user_id TEXT PRIMARY KEY,
                            name TEXT NOT NULL,
                            pfp TEXT,
                            phone TEXT,
                            email TEXT NOT NULL UNIQUE
                        )`;
        await db.executeSql(query);
        console.log('Table users created successful');
    }catch (error){
        console.error(error);
        throw Error('Failed to create users table');
    }
}

export const createEventsTable = async(db: SQLiteDatabase) => {
    try{
        const query = `CREATE TABLE IF NOT EXISTS events (
                            event_id TEXT PRIMARY KEY,
                            name TEXT NOT NULL,
                            description TEXT,
                            start_date TIMESTAMP NOT NULL,
                            end_date TIMESTAMP NOT NULL,
                            location TEXT NOT NULL,
                            seats INTEGER NOT NULL,
                            guest TEXT,
                            image TEXT,
                            host_id TEXT,
                            FOREIGN KEY (host_id) REFERENCES users(user_id))`;
        await db.executeSql(query);
        console.log('Table events created successful');
    }catch (error){
        console.error(error);
        throw Error('Failed to create events table');
    }
}

export const createEventsParticipantsTable = async(db: SQLiteDatabase) => {
    try{
        const query = `CREATE TABLE IF NOT EXISTS events_participants(
                            event_id TEXT NOT NULL,
                            participant_id TEXT NOT NULL,
                            PRIMARY KEY (event_id, participant_id),
                            FOREIGN KEY (event_id) REFERENCES events(event_id),
                            FOREIGN KEY (participant_id) REFERENCES users(user_id)
                        )`;
        await db.executeSql(query);
        console.log('Table users created successful');
    }catch (error){
        console.error(error);
        throw Error('Failed to create users table');
    }
}

export const getEventsByEventID = async(db: SQLiteDatabase, event_id: string): Promise<any> => {
    try{
        const query = `SELECT * FROM events WHERE event_id = ?`;
        const results = await db.executeSql(query, [event_id]);
        return results[0].rows.item(0)
    }catch (error){
        console.error(error);
        throw Error('Failed to get events');
    }
}

export const getEventsByDate = async (db: SQLiteDatabase, date: Date): Promise<any[]> => {
    try {
        const formattedStartOfDay = moment(date).startOf('day').toISOString();  // Start of the selected day
        const formattedEndOfDay = moment(date).endOf('day').toISOString();      // End of the selected day

        const query = `
            SELECT event_id, name, description, image, location, start_date, end_date, guest, seats, host_id
            FROM events
            WHERE start_date <= ? AND end_date >= ?`;

        const results = await db.executeSql(query, [formattedEndOfDay, formattedStartOfDay]);

        const eventsData = results[0].rows.raw().map((item: any) => {
            const eventStartDate = moment(item.start_date);  // Parse start_date
            const eventEndDate = moment(item.end_date);      // Parse end_date

            return {
                id: item.event_id,
                name: item.name,
                description: item.description,
                image: item.image,
                location: item.location,
                start_date: eventStartDate.format('YYYY-MM-DD HH:mm:ss'),  // Full date with time
                start_time: eventStartDate.format('HH:mm'),  // Extract time part
                end_date: eventEndDate.format('YYYY-MM-DD HH:mm:ss'),      // Full date with time
                end_time: eventEndDate.format('HH:mm'),      // Extract time part
                guest: item.guest,
                seats: item.seats,
                host_id: item.host_id,
            };
        });
        return eventsData;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw Error('Failed to get events');
    }
};

export const getHostEventsByUserIDOffline = async(db: SQLiteDatabase,user_id: string): Promise<any> => {
    try{
        const eventsData: any = [];
        const query =  `SELECT * FROM events WHERE host_id=?`;
        const results = await db.executeSql(query, [user_id]);
        results.forEach(result => {
            (result.rows.raw()).forEach((item: any) => {
                eventsData.push(item);
            })
        });
        return eventsData;
    }catch(error){
        console.error(error);
        throw Error('Failed to get events offline');
    }
}

// Show in 'Joined event' screen
export const getJoinEventsByUserIDOffline = async (db: SQLiteDatabase, user_id: string): Promise<any[]> => {
    try {
        const eventsData: any[] = [];

        const participantQuery = `SELECT event_id FROM events_participants WHERE participant_id = ?`;
        const participantResults = await db.executeSql(participantQuery, [user_id]);

        const eventIds: string[] = [];
        participantResults.forEach(result => {
            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows.item(i);
                eventIds.push(row.event_id);
            }
        });

        if (eventIds.length === 0) {
            console.log('No event ID found'); //
            return [];
        }

        const placeholders = eventIds.map(() => '?').join(', ');
        const eventsQuery = `SELECT * FROM events WHERE event_id IN (${placeholders})`;
        const eventsResults = await db.executeSql(eventsQuery, eventIds);

        eventsResults.forEach(result => {
            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows.item(i);
                eventsData.push(row); // Add each event's data to the result array
            }
        });

        return eventsData;
    } catch (error) {
        console.error('Failed to get joined events offline: ', error);
        throw new Error('Failed to get joined events offline');
    }
};


// User view their own profile details
export const getUsersByID = async(db: SQLiteDatabase, user_id: string): Promise<any> => {
    try{
        const query = `SELECT * FROM users WHERE user_id=?`;
        const results = await db.executeSql(query, [user_id]);
        if (results[0].rows.length > 0) {
            return results[0].rows.item(0);
        } else {
            throw new Error("No user found with the given ID");
        }
    }catch(error){
        console.error(error);
        throw Error('Failed to get users');
    }
}

// Number of participants for an event
export const getEventsParticipantsByEventIDOffline = async(db: SQLiteDatabase, event_id: string): Promise<any> => {
    try{
        const eventsParticipantsData:any = [];
        const query = `SELECT * FROM events_participants WHERE event_id=?`;
        const results = await db.executeSql(query, [event_id]);
        results.forEach(result => {
            (result.rows.raw()).forEach((item:any)=>{
                eventsParticipantsData.push(item);
            })
        });
        console.log('Fetch event participants offline');
        return eventsParticipantsData;
    }catch(error){
        console.error(error);
        throw Error('Failed to get events and their participants');
    }
}

// Host can see details of the participants for an event
export const getParticipantsByEventIDOffline = async (db: SQLiteDatabase, event_id: string): Promise<any[]> => {
    try {
        // Step 1: Fetch participant IDs from events_participants table
        const participantIdsQuery = `SELECT participant_id FROM events_participants WHERE event_id = ?`;
        const participantIdsResult = await db.executeSql(participantIdsQuery, [event_id]);

        if (participantIdsResult[0].rows.length === 0) {
            console.log('No participants found for this event.');
            return [];
        }

        // Extract participant IDs from result
        const participantIds = [];
        for (let i = 0; i < participantIdsResult[0].rows.length; i++) {
            const row = participantIdsResult[0].rows.item(i);
            participantIds.push(row.participant_id);
        }

        if (participantIds.length === 0) {
            return []; // No participants found
        }

        // Step 2: Fetch user details from users table
        const userIdsPlaceholders = participantIds.map(() => '?').join(', ');
        const usersQuery = `SELECT * FROM users WHERE user_id IN (${userIdsPlaceholders})`;
        const usersResult = await db.executeSql(usersQuery, participantIds);

        const usersData: any[] = [];
        for (let i = 0; i < usersResult[0].rows.length; i++) {
            const row = usersResult[0].rows.item(i);
            usersData.push(row);
        }
        console.log('Fetch event participants offline');
        return usersData;
    } catch (error) {
        console.error('Failed to get event participants: ', error);
        throw new Error('Failed to get event participants');
    }
};


//Create event when offline
export const createEventLocally = async (
    db: SQLiteDatabase,
    event: Event) => {
    try {
      const query = 'INSERT INTO events(event_id, name, description, start_date, end_date, location, seats, guest, image, host_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const parameters = [
        event.event_id,
        event.name,
        event.description,
        event.start_date,
        event.end_date,
        event.location,
        event.seats,
        event.guest,
        event.image,
        event.host_id,
      ];
      await db.executeSql(query, parameters);
      console.log('Event created successfully in local');
    } catch (error) {
      console.error(error);
      throw Error('Failed to create event');
    }
  };

//Join event
/*
export const createEventsParticipants = async(
    db: SQLiteDatabase,
    eventID: string,
    participantID: string) => {
        try{
            const query = 'INSERT INTO events_participants(event_id, participant_id) VALUES (?,?)';
            const parameters = [eventID, participantID];
            await db.executeSql(query,parameters);
            console.log("Participant is added to the event successfully");
        }catch(error){
            console.error(error);
            throw Error('Failed to add participant to event')
        }
}*/

//Update user profile
/*
export const updateUser = async(
    db: SQLiteDatabase,
    user_id: string,
    name: string,
    profile_pic: string,
    phone: string,
    email: string,
    password: string) => {
        try{
            const query = 'UPDATE users SET name=?, profile_pic=?,phone=?,email=?,password=? WHERE user_id=?';
            const parameters = [name,profile_pic,phone,email,password,user_id];
            await db.executeSql(query, parameters);
            console.log("User updated successfully");
        }catch(error){
            console.error(error);
            throw Error('Failed to create user =(');
        }
    }*/

//Update event
export const editEventLocally = async(
    db: SQLiteDatabase,
    event: Event) => {
        try{
            const query = 'UPDATE events SET name=?,description=?,start_date=?,end_date=?,location=?,guest=?,seats=? WHERE event_id=?';
            const parameters = [
                event.name,
                event.description,
                event.start_date,
                event.end_date,
                event.location,
                event.guest,
                event.seats,
                event.event_id,
              ];
            await db.executeSql(query, parameters);
            console.log("Event updated successfully");
        }catch(error){
            console.error(error);
            throw Error('Failed to create event =(');
        }
    }

//Delete user account
/*
export const deleteUser = async(
    db: SQLiteDatabase,
    userID: string) => {
        try{
            const query = 'DELETE FROM users WHERE user_id=?';
            await db.executeSql(query,[userID]);
            console.log("Delete user successfully");
        }catch(error){
            console.error(error);
            throw Error('Failed to delete user');
        }
    }*/

//Cancel host event
export const cancelEventLocally = async(
    db: SQLiteDatabase,
    eventID: string) => {
        try{
            const query = 'DELETE FROM events WHERE event_id=?';
            await db.executeSql(query,[eventID]);
            console.log("Cancel event successfully");
        }catch(error){
            console.error(error);
            throw Error('Failed to cancel event');
        }
    }

//Unjoin event
/*
export const unjoinEvent = async(
    db: SQLiteDatabase,
    participantID: string,
    eventID: string) => {
        try{
            const query = 'DELETE FROM events_participants WHERE event_id=? and participant_id=?';
            const parameters = [eventID, participantID];
            await db.executeSql(query,parameters);
            console.log("Unjoin event successfully");
        }catch(error){
            console.error(error);
            throw Error('Failed to unjoin event');
        }
    }*/