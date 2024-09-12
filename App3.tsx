import React, { useContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import auth from "@react-native-firebase/auth";
import { AuthProvider } from "./navigation/AuthProvider";
import { AuthContext } from './navigation/AuthProvider';
import AuthStack from './navigation/AuthStack';
import AppStack from './navigation/AppStack';
import { createEventsParticipantsTable, createEventsTable, createUsersTable, getDBConnection, getEvents } from './db-services';

const Routes = () => {

  const { user, setUser, logout } = useContext(AuthContext);
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
  }, []);

  //TODO: consider whether to implement or delete
  //if (initializing) return null;

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const App = () => {

  return (
    <AuthProvider>
        <Routes />
    </AuthProvider>
  );
}

export default App;