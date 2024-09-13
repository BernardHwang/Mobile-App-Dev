import React, { useContext, useEffect, useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { getDBConnection, getHostEventsByUserIDOffline, getJoinEventsByUserIDOffline } from '../database/db-services';
import { getHostEventsByUserIDOnline, getJoinEventsByUserIDOnline } from '../database/firestore-service';
import { AuthContext } from '../navigation/AuthProvider';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import TabButtons, { TabButtonType } from './MyEventScreenButtons';
import { _sync, checkInternetConnection } from '../database/sync';
import moment from 'moment';

export enum CustomTab {
  Tab1,
  Tab2,
}
  
const MyEventScreen = ({ navigation }:any) => {
  const [selectedTab,setSelectedTab] = useState<CustomTab>(CustomTab.Tab1);
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);
  const [hostedEvents, setHostedEvents] = useState<any[]>([]);
  const { user } = useContext(AuthContext);
  const pagerRef = useRef<PagerView>(null); // Ref to control PagerView
  const tabPositionX = useSharedValue(0); // Shared value for tab position
  const buttons : TabButtonType[] = [
    {title: 'Joined Event'},
    {title: 'Hosted Event'},
  ]
  const buttonWidth = 194;

  const onPageSelected = (event: any) => {
    const index = event.nativeEvent.position;
    setSelectedTab(index); // Update selected tab when page changes
    tabPositionX.value = withTiming(index * buttonWidth);
  };

  const onTabPress = (index: number) => {
    pagerRef.current?.setPage(index); // Sync PagerView with tab press
    setSelectedTab(index);
    tabPositionX.value = withTiming(index * buttonWidth);
  };

  const fetchEventsForHost = async () => {                                                  
    const connected = await checkInternetConnection();
    if (connected) {
      const hostEventOnline = await getHostEventsByUserIDOnline(user.uid);
      setHostedEvents(hostEventOnline);
      console.log('Fetch host event online');
    } else {
      const hostEventOffline = await getHostEventsByUserIDOffline(await getDBConnection(),user.uid);
      setHostedEvents(hostEventOffline);
      console.log('Fetch host event offline');
      console.log(hostedEvents);
    }
  };

  const fetchEventsForJoin = async () => {                                                  
    const connected = await checkInternetConnection();
    if (connected) {
      const joinEventOnline = await getJoinEventsByUserIDOnline(user.uid);
      setJoinedEvents(joinEventOnline);
      console.log('Fetch join event online');        
    } else {
      const joinEventOffline = await getJoinEventsByUserIDOffline(await getDBConnection(), user.uid);
      setJoinedEvents(joinEventOffline);
      console.log('Fetch join event offline');
    }
  };

  const renderEventItem = ({ item }) => {
    const isEventActive = moment().isBefore(item.end_date);
    return(
      <TouchableOpacity
      style={styles.eventCard}
      onPress={()=>navigation.navigate('EventDetails', { event_id: item.id, refresh: fetchEventsForHost})}
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.eventImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noImagePlaceholder}>
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.eventInfo}>
        <View style={styles.eventTextContainer}>
          <Text style={styles.eventTitle}>{item.name}</Text>
          <Text style={styles.eventTime}>
            {moment(item.start_date).format('MMMM Do YYYY, h:mm A')}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Ionicons
            name="ellipse"
            size={12}
            color={isEventActive ? 'green' : 'grey'} // Green for active, red for inactive
            style={styles.statusIcon}
          />
          <Text style={[styles.statusText, { color: isEventActive ? 'green' : 'grey' }]}>
            {isEventActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (selectedTab === CustomTab.Tab1) {
      _sync();
      fetchEventsForJoin();
    } else if (selectedTab === CustomTab.Tab2) {
      _sync();
      fetchEventsForHost();
    }
  }, [selectedTab]); // Runs when selectedTab changes

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (selectedTab === CustomTab.Tab2) {
        await fetchEventsForHost();  // Ensure hosted events are refreshed on focus
      } else if (selectedTab === CustomTab.Tab1){
        await fetchEventsForJoin();
      }
    });
  
    return unsubscribe;  // Clean up the listener on unmount
  }, [navigation, selectedTab]);

  
    return (
      <>
      <TabButtons 
        buttons={buttons} 
        selectedTab={selectedTab} 
        setSelectedTab={onTabPress}
        tabPositionX={tabPositionX}
      />
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={onPageSelected}
      >
        <View key="1" style={styles.page}>
          <Text style={styles.eventsHeader}>Joined Events</Text>
          <FlatList
            data={joinedEvents}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.noEventsText}>No events joined.</Text>}
          />
        </View>
        <View key="2" style={styles.page}>
          <Text style={styles.eventsHeader}>Hosted Events</Text>
          <FlatList
            data={hostedEvents}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.noEventsText}>No events hosted.</Text>}
          />
        </View>
      </PagerView>
    </>
   );
  };
  
  const styles = StyleSheet.create({
    page: {
      flex: 1,
    },
    eventCard: {
      backgroundColor: '#f8f8f8',
      borderRadius: 8,
      padding: 10,
      marginVertical: 8,
    },
    eventImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 10,
    },
    noImagePlaceholder: {
      width: '100%',
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#e0e0e0',
      borderRadius: 8,
      marginBottom: 10,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    eventTime: {
      fontSize: 14,
      color: '#888',
    },
    eventsHeader: {
      fontWeight: 'bold',
      paddingLeft: 15,
      fontSize: 25,
      paddingTop: 15,
    },
    noEventsText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#888',
    },
    eventInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    eventTextContainer: {
      flex: 1,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusIcon: {
      marginRight: 5,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
  });

export default MyEventScreen;
