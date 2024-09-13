import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { cancelEventLocally, getDBConnection, getEventsByEventID, getEventsParticipantsByEventIDOffline, getParticipantsByEventIDOffline } from '../database/db-services';
import { cancelEventOnline, getEvents, getEventsParticipantsByEventID, getParticipantsByEventID, joinEvent, unjoinEvent, getEventNotificationStatus, changeNotificationStatus } from '../database/firestore-service';
import { AuthContext } from '../navigation/AuthProvider';
import { _sync, checkInternetConnection } from '../database/sync';
import { SocketContext } from '../navigation/SocketProvider';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import OpenMap from 'react-native-open-maps';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;
const MIN_IMG_HEIGHT = 100; // minimum height of the image after scroll

const EventDetails = ({ route, navigation }: any) => {
    
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);

    const [participantsCount, setParticipantsCount] = useState(0);
    const [cancel, setCancel] = useState<boolean>(false);
    const [join, setJoin] = useState<boolean>(false);
    const [joinedUsers, setJoinedUsers] = useState<any[]>([]);
    const [showSplitButtons, setShowSplitButtons] = useState<boolean>(false);
    const [event, setEvent] = useState<any>(null); 
    const [eventID, setEventID] = useState(route.params.event_id);
    const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });
    const [loading, setLoading] = useState(true);
    const [isBellOff, setIsBellOff] = useState();
    const [isEventEnded, setIsEventEnded] = useState<boolean>(false);
    
    // Fetch participants on mount and check if the user is already a participant
    const checkIfJoined = async () => {
        try {
          const connected = await checkInternetConnection();
      
          // Use online or offline data source based on connection status
          const participants = connected
            ? await getEventsParticipantsByEventID(eventID)
            : await getEventsParticipantsByEventIDOffline(await getDBConnection(), eventID);
      
          const icons = connected
            ? await getParticipantsByEventID(eventID)
            : await getParticipantsByEventIDOffline(await getDBConnection(), eventID);
      
          const isParticipant = participants.some(p => p.participant_id === user.uid);
      
          // Update state
          setJoin(isParticipant);
          setJoinedUsers(icons);
          setParticipantsCount(participants.length);
          setShowSplitButtons(isParticipant);
        } catch (error) {
          console.log("Error fetching participants: ", error);
        }
      };

    const fetchEventData = async () => {
        try {
            const theEvent = await getEventByID(eventID);
            if (theEvent){
                setEvent(theEvent);
                console.log('Updated Event Data: ', event);
                const currentTime = moment(); // Get current time
                const eventEndTime = moment(theEvent.end_date);
                setIsEventEnded(eventEndTime.isBefore(currentTime));
                return theEvent;
            }
        } catch (error) {
            console.log("Error fetching event data:", error);
        }
    };    

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchEventData();
            checkIfJoined();
        });

        fetchEventNotificationStatus();
    
        return unsubscribe;
    }, [navigation, eventID]);
    
    useEffect(() => {
        // Function to fetch coordinates based on the location string
        const fetchCoordinates = async () => {
            if (!event || !event.location) return;
            try {
                const response = await axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(event.location)}&key=${'AIzaSyDfYC_0IwQ1K2Ua07Ix1vYMaSP-eafAmbw'}`
                );
                const locationData = response.data.results[0].geometry.location;
                setCoordinates({
                    latitude: locationData.lat,
                    longitude: locationData.lng,
                });
                setLoading(false);
            } catch (error) {
                console.log('Error fetching location data:', error);
            }
        };

        fetchCoordinates();
    }, [event]);

    const fetchEventNotificationStatus = async () => {
        const notificationStatus = await getEventNotificationStatus(eventID, user.uid)
        setIsBellOff(notificationStatus);
    }

    const scrollY = useRef(new Animated.Value(0)).current;
    const imgHeight = scrollY.interpolate({
        inputRange: [0, IMG_HEIGHT - MIN_IMG_HEIGHT],
        outputRange: [IMG_HEIGHT, MIN_IMG_HEIGHT],
        extrapolate: 'clamp', // Prevents the value from exceeding the defined range
    });

    const imgOverlayOpacity = scrollY.interpolate({
        inputRange: [0, IMG_HEIGHT / 2],
        outputRange: [0, 0.8], // Increase opacity as the user scrolls
        extrapolate: 'clamp',
    });
    const [modalVisible, setModalVisible] = useState(true);

    const closeModal = () => {
        setModalVisible(false);
        navigation.goBack(); // Navigate back to the previous screen when closing the modal
    };

    const getEventByID = async (event_id: string) => {
        const connected = await checkInternetConnection();
        const eventByID = connected
        ? await getEvents(event_id)
        : await getEventsByEventID(await getDBConnection(), event_id);
        return eventByID;
    }

    const cancelEvent = async (id: string) => {
        try{
            const connected = await checkInternetConnection();
            if (connected){
                const db = await getDBConnection();
                await cancelEventOnline(id);
                await cancelEventLocally(db, id);
                await _sync();
                setCancel(false);
                route.params.refresh();
                navigation.goBack();
            }
            else{
                Alert.alert('Failed to cancel event! Please connect to internet.');
            }
        } catch(error) {
            console.log("Error canceling event: ", error);
            Alert.alert('Error', 'An error occurred while cancelling event. Please try again.');
        }
        
    };

    const joinEventFunction = async (participant_id: string, event_id: string) => {
        try{
            const connected = await checkInternetConnection();
            if (connected){
                await joinEvent(participant_id, event_id);
                await _sync();
                setJoin(!join);
                checkIfJoined();
                socket.emit('joinEvent', {eventId: event_id, userId: user.uid})
            }
            else {
                Alert.alert('Failed to join event! Please connect to internet.')
            }
        }catch(error){
            console.log("Error joining event: ", error);
            Alert.alert('Error', 'An error occurred while joining event. Please try again.');
        }
    }

    const unjoinEventFunction = async (participant_id: string, event_id: string) => {
        try{
            const connected = await checkInternetConnection();
            if (connected){
                await unjoinEvent(participant_id, event_id);
                await _sync();
                setJoin(!join);
                checkIfJoined();
                socket.emit('unjoinEvent', {eventId: event_id, userId: user.uid})
            }
            else{
                Alert.alert('Failed to unjoin event! Please connect to internet.')
            }
        }catch(error){
            console.log("Error unjoining event: ", error);
            Alert.alert('Error', 'An error occurred while unjoining event. Please try again.');
        }
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
        >
        <View style={styles.container}>
            <Animated.ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16} // Determines how often the scroll events are fired (for better performance)
            >
                {event
                ? (
                <>
                {/* Image Container */}
                <View>
                    <Animated.Image
                        source={{uri:event.image}}
                        style={[styles.image, { height: imgHeight }]}
                    />
                    {/* Shading Overlay */}
                    <Animated.View
                        style={[styles.imageOverlay, { opacity: imgOverlayOpacity }]}
                    />
                </View>

                {/* Content */}
                <View style={styles.contentWrapper}>
                        {joinedUsers.length > 0 ? (
                            <FlatList
                                horizontal
                                data={joinedUsers}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.avatarList}
                                renderItem={({ item }) => (
                                    <View style={{  backgroundColor: 'transparent' }}>
                                        <Avatar 
                                            source={{ uri: item.pfp }}
                                            size={35}
                                            rounded
                                            containerStyle={{overflow:'hidden'}}
                                        />
                                    </View>
                                )}
                            />
                        ) : (
                    <Text style={styles.location}>No participants found for current event</Text>
                )}
                    <Text style={styles.title}>{event.name} </Text>
                    <View style={styles.locationWrapper}>
                        <Ionicons name="location-sharp" size={18} color='#3e2769' />
                        <Text style={styles.location}>{event.location}</Text>
                    </View>
                    <Text style={styles.seats}>{event.seats - participantsCount} Seats Left</Text>
                    <View style={styles.timeContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.timeWrapper}>
                                <Text style={styles.timeHeader}>Start</Text>
                                <Text style={{ fontSize: 20, color: '#3e2769', fontWeight: '500', }}>{moment(event.start_date).format('Do MMM')}</Text>
                                <Text style={{ fontSize: 20, color: '#3e2769', fontWeight: '500', }}>{moment(event.start_date).format('h:mm A')}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.timeWrapper}>
                                <Text style={styles.timeHeader}>End</Text>
                                <Text style={{ fontSize: 20, color: '#3e2769', fontWeight: '500', }}>{moment(event.end_date).format('Do MMM')}</Text>
                                <Text style={{ fontSize: 20, color: '#3e2769', fontWeight: '500', }}>{moment(event.end_date).format('h:mm A')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={{ marginLeft: 20, fontSize: 25, fontWeight: '400', color: 'black', marginBottom: 10 }}>Description</Text>
                <Text style={styles.description}>
                    {event.description}
                </Text>

                <View style={styles.mapContainer}>
                    {!loading ? (
                        <MapView
                            style={{ width: '100%', height: 300 }}
                            initialRegion={{
                                latitude: coordinates.latitude,
                                longitude: coordinates.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            onPress={() => OpenMap({
                                latitude: coordinates.latitude,
                                longitude: coordinates.longitude
                            })}
                        >
                            <Marker
                                coordinate={coordinates}
                                title={event.name}
                                description={event.location}
                            />
                        </MapView>
                    ) : (
                        <Text>Loading map...</Text>
                    )}
                </View>
                </>
                ):(
                    <Text>Loading event details...</Text>
                )}
            </Animated.ScrollView>

            {/* Fixed Footer */}
            {event && event.host_id == user.uid?
            //Cancel event
            
            <View style={styles.detailFooter}>
                <TouchableOpacity onPress={() => {setCancel(true)}} style={styles.footerBtn} >
                    <Text style={styles.footerBtnTxt}>{isEventEnded ? "Delete Event" : "Cancel Event"}</Text>
                </TouchableOpacity>
            </View>
            
            : 
            // Join or unjoin event
            <View style={styles.detailFooter}>
                {showSplitButtons ? (
                <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                    <TouchableOpacity onPress={() => {setShowSplitButtons(true);setIsBellOff(!isBellOff);changeNotificationStatus(eventID, user.uid);socket.emit('eventNotificationStatus', {eventId: eventID, userId: user.uid})}} style={styles.remindBtn}>
                        <MaterialCommunityIcons name={isBellOff ? "bell-ring-outline":"bell-off-outline"} size={23} color='#3e2769'/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{unjoinEventFunction(user.uid, event.id);setShowSplitButtons(false)}} style={styles.unjoinButton}>
                        <Text style={styles.footerBtnTxt}>Unjoin Event</Text>
                    </TouchableOpacity>
                </View>
                ) : (
                    event && (
                    <TouchableOpacity onPress={() => {
                        if (event.seats - participantsCount > 0) {
                            setShowSplitButtons(true);
                            joinEventFunction(user.uid, event.id);
                        }
                    }}
                    style={[
                        styles.footerBtn, 
                        { 
                            backgroundColor: event.seats - participantsCount === 0 ? 'grey' : '#3e2769',
                            opacity: event.seats - participantsCount === 0 ? 0.7 : 1, // Optional: dim the button
                        }
                    ]}
                    disabled={event.seats - participantsCount === 0} >
                        <Text style={styles.footerBtnTxt}>{join ? "Unjoin" : "Join"}</Text>
                    </TouchableOpacity>
                    )
                )}
            </View>
            }

            {event && cancel ? (
            <View style={styles.overlay}>
                <View style={styles.cancelContainer}>
                <Text style={{ textAlign: 'center', margin: 50, fontSize: 18, fontWeight: '500' }}>Are you sure you want to cancel the event?</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', }}>
                    <TouchableOpacity style={[styles.yesNoBtn, { backgroundColor: '#e7dcf2' }]} onPress={() => { cancelEvent(event.id) }}>
                    <Text style={{ color: 'black', fontSize: 15 }}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.yesNoBtn, { backgroundColor: '#3e2769' }]} onPress={() => { setCancel(false) }}>
                    <Text style={{ color: 'white' }}>No</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </View>
            ) : null}


            {/* Custom Back Button */}
            <TouchableOpacity
                onPress={() => navigation.goBack()} // Navigate to Home screen
                style={styles.headerLeftContainer}
            >
                <View style={styles.headerIconContainer}>
                    <Ionicons name='chevron-back-outline' size={30} color="#3e2769" />
                </View>
            </TouchableOpacity>

            { /* Edit Button */}
            {event && event.host_id == user.uid?
           <TouchableOpacity
                onPress={()=> navigation.navigate('EditEvent', {
                    event_id: eventID, 
                    refresh: fetchEventData
                })}
                style={styles.headerRightContainer}
           >
                <View style={styles.headerIconContainer}>
                    <Ionicons name='pencil' size={30} color="#3e2769"/>
                </View>
           </TouchableOpacity>
            : null}
           
        </View>
        </Modal>
    );
};


export default EventDetails;

const styles = StyleSheet.create({
    image: {
        width: width,
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '100%',
      backgroundColor: 'black',
    },
    container: {
        flex: 1,
        backgroundColor: '#e6e6fa',
    },
    contentWrapper: {
        padding: 20,
    },
    avatarList: {
        flexDirection: 'row', // Ensure avatars are placed horizontally
        paddingVertical: 10,
    },
    locationWrapper: {
        flexDirection: 'row',
        marginTop: 5,
        marginBottom: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: '500',
        color: 'black',
        letterSpacing: 0.5,
    },
    location: {
        marginRight: 10,
        fontSize: 15,
        marginLeft: 10,
        color: '#3e2769',
        letterSpacing: 0.5,
    },
    description: {
        marginRight: 20,
        fontSize: 15,
        marginLeft: 20,
        color: '#3e2769',
        letterSpacing: 0.5,
    },
    timeHeader: {
        fontSize: 25,
        fontWeight: '500',
        color: '#3e2769',
        letterSpacing: 0.5,
    },
    seats: {
        marginLeft: 28,
        fontSize: 18,
        fontWeight: '500',
        color: '#3e2769',
        letterSpacing: 0.5,
    },
    timeContainer: {
        flexDirection: 'row',
        margin: 5,
        justifyContent: 'space-evenly',
    },
    timeWrapper: {
        backgroundColor: 'rgb(244,243,243)',
        padding: 20,
        borderRadius: 15,
        minWidth: 150,
        margin: 5
    },
    detailFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
        backgroundColor: '#e6e6fa',
    },
    footerBtn: {
        flexDirection: 'row',
        backgroundColor: '#3e2769',
        padding: 10,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerBtnTxt: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'uppercase',
        marginLeft: 5,
    },
    unjoinButton: {
        backgroundColor: '#3e2769',
        padding: 10,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: 230
    },
    remindBtn: {
        backgroundColor: '#e7dcf2',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 30
    },
    headerLeftContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: 50,
        justifyContent: 'center',
        padding: 10,
        zIndex: 1,
    },
    headerIconContainer: {
        backgroundColor: "rgba(255,255,255, 0.8)",
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        marginLeft: 10,
        minWidth: 50,
        minHeight: 50,
    },
    headerRightContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: 50,
        justifyContent: 'center',
        padding: 10,
        zIndex: 1,
    },
    cancelContainer: {
        borderWidth: 1,
        backgroundColor: 'white',
        padding: 10,
        width: 300,
        height: 250,
        justifyContent: 'center',
        flexDirection: 'column',
        alignSelf: 'center',
        position: 'absolute',
        top: 250,
        bottom: 300,
        borderColor: 'transparent',
        borderRadius: 10,
    },
    yesNoBtn:{
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2, // Ensure it appears above other content
    },
    mapContainer: {
        marginTop: 40
    },
    maps: {
        width: '100%',
        height: 300,
        borderRadius: 10,
    }
});
