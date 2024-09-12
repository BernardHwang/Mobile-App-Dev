import auth from "@react-native-firebase/auth";
import { NavigationContainer } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { createEventsParticipantsTable, createEventsTable, createUsersTable, getDBConnection } from './database/db-services';
import AppStack from './navigation/AppStack';
import { AuthContext, AuthProvider } from "./navigation/AuthProvider";
import AuthStack from './navigation/AuthStack';
import { SocketProvider } from './navigation/SocketProvider';
import NotificationListener from './database/NoficationGenerator';
import { _sync } from './database/sync';

const Routes = () => {
  const { user, setUser } = useContext(AuthContext);
  const [initializing, setInitializing] = useState(true);

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
