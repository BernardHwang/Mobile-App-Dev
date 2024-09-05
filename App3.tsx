import React, { useContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import auth from "@react-native-firebase/auth";
import { AuthProvider } from "./navigation/AuthProvider";
import { AuthContext } from './navigation/AuthProvider';
import { SocketProvider } from './navigation/SocketProvider';
import NotificationListener from './NoficationGenerator'
import AuthStack from './navigation/AuthStack';
import AppStack from './navigation/AppStack';
import { createEventsParticipantsTable, createEventsTable, createUsersTable, getDBConnection, getEvents } from './db-services';
import { syncEventsData, syncEventsParticipantsData, syncUsersData } from './sync';

const Routes = () => {
  const { user, setUser } = useContext(AuthContext);
  const [initializing, setInitializing] = useState(true);

  const _sync = async() => {
    await syncUsersData(await getDBConnection());
    await syncEventsData(await getDBConnection());
    await syncEventsParticipantsData(await getDBConnection());
  }

  const handleAuthStateChanged = (user:any) => {
    setUser(user);
    console.log(user);
    if (initializing) setInitializing(false);
  }

  const _createTable = async () => {
    await createUsersTable(await getDBConnection());
    await createEventsTable(await getDBConnection());
    await createEventsParticipantsTable(await getDBConnection());
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(handleAuthStateChanged);
    return subscriber; // unsubscribe on mount
  }, []);

  useEffect(() => {
    _createTable();
    _sync();
  }, []);

  //TODO: consider whether to implement or delete
  //if (initializing) return null;

  return (
    <NavigationContainer>
       {user ? (
        <>
          <NotificationListener />
          <AppStack />
        </>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const App = () => {

  return (
    <AuthProvider>
      <SocketProvider>
        <Routes />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
