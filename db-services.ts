import {SQLiteDatabase, enablePromise, openDatabase} from 'react-native-sqlite-storage';

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
                            profile_pic TEXT,
                            phone TEXT,
                            email TEXT NOT NULL UNIQUE,
                            password TEXT NOT NULL
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
                            PRIMARY KEY (event_id, participant_id)
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
}

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
}

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
export const getHostEventsByUserID = async(db: SQLiteDatabase,user_id: string): Promise<any> => {
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
export const getJoinEventsByUserID = async(db: SQLiteDatabase,user_id: string): Promise<any> => {
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
        return results[0].rows.item(0)
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