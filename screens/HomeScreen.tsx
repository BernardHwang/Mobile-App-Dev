import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image } from 'react-native';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = () => {
  const [currentWeek, setCurrentWeek] = useState([]);
  const [selectedDay, setSelectedDay] = useState(moment().startOf('week'));
  const [events, setEvents] = useState([]);
  const [searchItem, setSearchItem] = useState('');

  useEffect(() => {
    generateCurrentWeek();
    fetchEventsForSelectedDay(selectedDay);
  }, [selectedDay]);

  const generateCurrentWeek = () => {
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');

    const weekDays = [];
    let day = startOfWeek;

    while (day <= endOfWeek) {
      weekDays.push(day.clone());
      day = day.add(1, 'd');
    }

    setCurrentWeek(weekDays);
  };

  const fetchEventsForSelectedDay = async (day) => {
    try {
      const eventsRef = firestore().collection('events');
      const querySnapshot = await eventsRef.get();

      const fetchedEvents = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const eventDate = data.date.toDate(); // Firestore timestamp to JavaScript Date object
          const localEventDate = moment(eventDate).local(); // Convert to local time
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            image: data.image,
            location: data.location,
            time: localEventDate.format('HH:mm'), // Format time in local time
            date: localEventDate, // Keep the local date for comparison
          };
        })
        .filter((event) => event.date.isSame(day, 'day')) // Compare dates based on local time
        .sort((a, b) => moment(a.time, 'HH:mm').diff(moment(b.time, 'HH:mm')));

      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.eventCard}>
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
      <Text style={styles.eventTime}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          onChangeText={(input) => {
            setSearchItem(input);
          }}
          value={searchItem}
        />
        <Ionicons name="search-circle-outline" style={styles.searchIcon} />
      </View>

      <View style={styles.weekContainer}>
        {currentWeek.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateItem,
              selectedDay.isSame(date, 'day') && styles.selectedDateItem,
            ]}
            onPress={() => setSelectedDay(date)}
          >
            <Text style={styles.dateText}>{date.format('ddd')}</Text>
            <Text style={styles.dateNumber}>{date.format('D')}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.eventsHeader}>Events</Text>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noEventsText}>No events today</Text>}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
  },
  searchInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
  },
  searchIcon: {
    marginLeft: 8,
    fontSize: 40,
    color: '#888',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    width: 50,
  },
  selectedDateItem: {
    backgroundColor: '#d0d0d0',
  },
  dateText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  dateNumber: {
    fontSize: 15,
    color: '#888',
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
});

export default HomeScreen;
