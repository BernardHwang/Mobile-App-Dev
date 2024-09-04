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

export const createEvent = async(
    db: SQLiteDatabase, 
    eventID: string,
    name: string,
    startDate: Date,
    endDate: Date,
    location: string,
    guest: string,
    description: string,
    seats: number,
    image: string,
    hostID: string) => {
        try{
            const query = 'INSERT INTO events(event_id,name,description,start_date,end_date,location,seats,guest,image,host_id) VALUES (?,?,?,?,?,?,?,?,?,?)';
            const parameters = [eventID,name,description,startDate.toISOString(),endDate.toISOString(),location,seats,guest,image,hostID];
            await db.executeSql(query, parameters);
            console.log("Event created successfully");
        }catch(error){
            console.error(error);
            throw Error('Failed to create event =(');
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

export const editEvent = async(
        db: SQLiteDatabase, 
        eventID: string,
        name: string,
        startDate: Date,
        endDate: Date,
        location: string,
        guest: string,
        description: string,
        seats: number,
        image: string) => {
            try{
                const query = 'UPDATE events SET name=?,description=?,start_date=?,end_date=?,location=?,guest=?,seats=?,image=? WHERE event_id=?';
                const parameters = [name,description,startDate,endDate,location,guest,seats,image,eventID];
                await db.executeSql(query, parameters);
            }catch(error){
                console.error(error);
                throw Error('Failed to create event =(');
            }
        }