import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, Button } from 'react-native';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { FloatingAction } from "react-native-floating-action";
import { Calendar } from 'react-native-calendars';
import { AuthContext } from '../navigation/AuthProvider';
import IconBadge from 'react-native-icon-badge';
import { fetchEventsForSelectedDay } from '../database/firestore-service';

const HomeScreen = ({ navigation }:any) => {
  const { user, logout } = useContext(AuthContext);
  // Initialize selectedDay as a moment object
  const [selectedDay, setSelectedDay] = useState(moment().format('YYYY-MM-DD'));
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchEvents();
  
    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('notifications')
      .onSnapshot((snapshot) => {
        setNotificationCount(snapshot.size);
      }, (error) => {
        console.error('Error fetching real-time notifications:', error);
      });
      
    return () => unsubscribe();
  }, [selectedDay, user.uid]);

  const fetchEvents = async () => {
    const events = await fetchEventsForSelectedDay(selectedDay);
    setEvents(events);
  };

  const selectDay = () => {
    setModalVisible(!modalVisible);
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={()=>navigation.navigate('EventDetails', { event: item })}
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
      <Text style={styles.eventTitle}>{item.name}</Text>
      <Text style={styles.eventTime}>{item.start_time}</Text>
    </TouchableOpacity>
  );

  const handleDateChange = (date) => {
    setSelectedDay(date.dateString);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
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
          <Text style={{fontSize: 25}}>{moment(selectedDay).format('MMM')}/{moment(selectedDay).format('YYYY')} ({moment(selectedDay).format('ddd')})</Text>
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
              }}
              style={{marginBottom: 20,borderRadius: 15}}
            />
            <Button title="Close" onPress={() => setModalVisible(false)} />
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
        onPressItem={() =>
          navigation.navigate('AddEvent',{userID: user.uid})
        }
        overrideWithAction={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  dayFont:{
    fontSize: 45,
    fontWeight:'bold',
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
  noEventsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  eventsHeader: {
    fontWeight: 'bold',
    fontSize: 25,
    paddingTop: 15,
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
