import sqlite3
db = sqlite3.connect('db.sqlite')

db.execute('DROP TABLE IF EXISTS users')
db.execute('DROP TABLE IF EXISTS events')
db.execute('DROP TABLE IF EXISTS events_participants')

usersTable = '''CREATE TABLE users(
    user_id TEXT PRIMARY KEY, 
    name TEXT NOT NULL,
    profile_pic TEXT,
    phone TEXT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)'''

eventsTable = '''CREATE TABLE events (
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
    FOREIGN KEY (host_id) REFERENCES users(user_id)
)'''

eventsParticipantsTable = '''CREATE TABLE events_participants(
    event_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    PRIMARY KEY (event_id, participant_id)
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (participant_id) REFERENCES users(user_id)
)'''

db.execute(usersTable)
db.execute(eventsTable)
db.execute(eventsParticipantsTable)

cursor = db.cursor()
cursor.execute('''INSERT INTO users (user_id,name,profile_pic,phone,email,password) VALUES ("U1","Bernard","bkhjkgs://ezpz-mobile-app-y2s3.appspot.com/Screenshot 2023-03-25 020540.png","0123456789","bernard@gmail.com","bernard523")''')

db.commit()
db.close()