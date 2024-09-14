import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, Button, Alert } from 'react-native';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { FloatingAction } from "react-native-floating-action";
import { Calendar } from 'react-native-calendars';
import { AuthContext } from '../navigation/AuthProvider';
import IconBadge from 'react-native-icon-badge';
import { fetchEventsForSelectedDay } from '../database/firestore-service';
import { checkInternetConnection } from '../database/sync';
import { getDBConnection, getEventsByDate } from '../database/db-services';
import { useFocusEffect } from '@react-navigation/native';
import { DrawerButton } from '../UI';
import  ExternalStyleSheet  from '../ExternalStyleSheet';

const HomeScreen = ({ navigation }:any) => {
  const { user, logout } = useContext(AuthContext);
  // Initialize selectedDay as a moment object
  const [selectedDay, setSelectedDay] = useState(moment().format('YYYY-MM-DD'));
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      // Fetch events every time the screen comes into focus
      fetchEvents();
      
      // Fetch notification count in real-time
      const unsubscribe = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('notifications')
        .onSnapshot((snapshot) => {
          setNotificationCount(snapshot.size);
        }, (error) => {
          console.log('Error fetching real-time notifications:', error);
        });

      return () => unsubscribe(); // Clean up on unmount
    }, [selectedDay, user.uid]) // Re-run this effect when selectedDay or user.uid changes
  );

  const fetchEvents = async () => {
    const connected = await checkInternetConnection();

    const eventsGet = connected 
    ? await fetchEventsForSelectedDay(selectedDay)
    : await getEventsByDate(await getDBConnection(), new Date(selectedDay));
    
    setEvents(eventsGet);
  };

  const selectDay = () => {
    setModalVisible(!modalVisible);
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={ExternalStyleSheet.eventCard}
      onPress={()=>navigation.navigate('EventDetails', { event_id: item.id, refresh: fetchEvents })}
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={ExternalStyleSheet.eventImage}
          resizeMode="cover"
        />
      ) : (
        <View style={ExternalStyleSheet.noImagePlaceholder}>
          <Text>No Image</Text>
        </View>
      )}
      <Text style={ExternalStyleSheet.eventTitle}>{item.name}</Text>
      <Text style={ExternalStyleSheet.eventTime}>{item.start_time}</Text>
    </TouchableOpacity>
  );

  const handleDateChange = (date) => {
    setSelectedDay(date.dateString);
    setModalVisible(false);
  };

  const handleCreatePress = async() => {
    const connected = await checkInternetConnection();
        if (connected) {
            navigation.navigate('AddEvent',{userID: user.uid});
        } else {
            Alert.alert(
                'No Internet Connection',
                'You are offline. You cannot create events while offline.',
                [{ text: 'OK'}]
            );
        }
  }

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <DrawerButton />
        <Text style={{ fontSize: 30, fontWeight: '500' }}>Home</Text>
        <IconBadge
          MainElement={
            <Ionicons
              name='notifications-outline'
              size={30}
              color='black'
              style={{ marginTop: 5 }}
              onPress={() => navigation.navigate('Notification')}
            />
          }
          BadgeElement={
            <Text style={{color: 'white', fontSize: 12}}>{notificationCount}</Text>
          }
          IconBadgeStyle={
            { width: 20, height: 20, backgroundColor: '#FF0000' }
          }
          Hidden={notificationCount === 0}
        />
      </View>
      <TouchableOpacity onPress={selectDay}>
        <View style={{flexDirection:'row', justifyContent:'flex-start', alignItems:'baseline'}}>
          <Text style={styles.dayFont}>{moment(selectedDay).format('Do')} </Text>
          <Text style={{fontSize: 25, color: '#26294D'}}>{moment(selectedDay).format('MMM')}/{moment(selectedDay).format('YYYY')} ({moment(selectedDay).format('ddd')})</Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Calendar
              current={selectedDay}
              onDayPress={handleDateChange}
              minDate={moment().format('YYYY-MM-DD')}
              markedDates={{
                [selectedDay]: {
                  selected: true,
                  selectedColor: '#26294D', // Background color of the selected date
                  selectedTextColor: '#FFFFFF', // Text color of the selected date
                }
              }}
              theme={{
                calendarBackground: '#f0f0f0', // Background color for the calendar
                todayTextColor: '#26294D', // Color for today's date
                arrowColor: '#26294D',
              }}
              style={{marginBottom: 20,borderRadius: 15}}
            />
            <Button title="Close" onPress={() => setModalVisible(false)} color={'#26294D'}/>
          </View>
        </View>
      </Modal>

      <Text style={styles.eventsHeader}>Events</Text>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noEventsText}>No events today</Text>}
      />
      <FloatingAction
        actions={[
          {
            name: 'create',
            text: 'Create an Event',
            icon: <Ionicons name='calendar-outline' color={'white'} size={20} />,
          }
        ]}
        buttonSize={50}
        color='#3e2769'
        onPressItem={handleCreatePress}
        overrideWithAction={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e6e6fa',
  },
  dayFont:{
    fontSize: 40,
    fontWeight:'bold',
    color: '#330c94'
  },
  noEventsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  eventsHeader: {
    fontWeight: 'bold',
    fontSize: 24,
    paddingTop: 15,
    color: '#26294D'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default HomeScreen;
