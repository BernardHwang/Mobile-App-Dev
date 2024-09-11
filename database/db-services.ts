import { SQLiteDatabase, enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { Event } from '../Types';
const databaseName = 'db';

enablePromise(true);

export const getDBConnection = async() => {
    return openDatabase(
        {name: `${databaseName}`},
        openCallback,
        errorCallback
    );
}

const openCallback = () => {
    console.log('database open success');
}

const errorCallback = (err: any) => {
    console.log('Error in opening the database: '+err);
}

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

/*
export const getUsers = async(db: SQLiteDatabase): Promise<any> => {
    try{
        const usersData: any = [];
        const query =  `SELECT * FROM users`;
        const results = await db.executeSql(query);
        results.forEach(result=> {
            (result.rows.raw()).forEach((item:any)=>{
                usersData.push(item);
            })
        });
        return usersData;
    }catch(error){
        console.error(error);
        throw Error('Failed to get users');
    }
}*/
/*
export const getEvents = async(db: SQLiteDatabase): Promise<any> => {
    try{
        const eventsData:any = [];
        const query = `SELECT * FROM events`;
        const results = await db.executeSql(query);
        results.forEach(result => {
            (result.rows.raw()).forEach((item:any)=>{
                eventsData.push(item);
            })
        });
        return eventsData;
    }catch (error){
        console.error(error);
        throw Error('Failed to get events');
    }
}*/

// Show in 'Home' screen to display the events happen in that day
export const getEventsByDate = async(db: SQLiteDatabase,date: Date): Promise<any> => {
    try{
        const eventsData: any = [];
        const formattedDate = date.toISOString().split('T')[0]; //convert to date format YYYY-MM-DD
        const query = `SELECT * FROM events WHERE DATE(start_date) = ?`;
        const results = await db.executeSql(query, [formattedDate]);
        results.forEach(result => {
            (result.rows.raw()).forEach((item: any) => {
                eventsData.push(item);
            })
        });
        return eventsData;
    }catch(error){
        console.error(error);
        throw Error('Failed to get events');
    }
}

// Show in 'Hosted event' screen
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
        throw Error('Failed to get events');
    }
}

// Show in 'Joined event' screen
export const getJoinEventsByUserIDOffline = async(db: SQLiteDatabase,user_id: string): Promise<any> => {
    try{
        const eventsData: any = [];
        const query =  `SELECT * FROM events_participants WHERE participant_id=?`;
        const results = await db.executeSql(query, [user_id]);
        results.forEach(result => {
            (result.rows.raw()).forEach((item: any) => {
                eventsData.push(item);
            })
        });
        return eventsData;
    }catch(error){
        console.error(error);
        throw Error('Failed to get events');
    }
}

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

// Host can see details of the participants for an event
export const getEventsParticipantsByEventID = async(db: SQLiteDatabase, event_id: string): Promise<any> => {
    try{
        const eventsParticipantsData:any = [];
        const query = `SELECT * FROM events_participants WHERE event_id=?`;
        const results = await db.executeSql(query, [event_id]);
        results.forEach(result => {
            (result.rows.raw()).forEach((item:any)=>{
                eventsParticipantsData.push(item);
            })
        });
        return eventsParticipantsData;
    }catch(error){
        console.error(error);
        throw Error('Failed to get events and their participants');
    }
}

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