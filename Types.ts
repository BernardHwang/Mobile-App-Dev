import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface User {
    user_id: string;
    name: string;
    profile_pic: string;
    phone: string;
    email: string;
    password: string;
  }
  
  export interface Event {
    event_id: string; 
    name: string;
    description: string;
    start_date: string; 
    end_date: string; 
    location: string;
    seats: number;
    guest: string;
    image: string;
    host_id: string;
  }
  