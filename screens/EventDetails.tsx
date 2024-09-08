import React, { useState, useRef, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Animated, Modal, Alert } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from '../navigation/AuthProvider';
import { cancelEventOnline, getEventsParticipantsByEventID, joinEvent, unjoinEvent } from '../firestore-service';
import { cancelEventLocally, getDBConnection } from '../db-services';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;
const MIN_IMG_HEIGHT = 100; // minimum height of the image after scroll

const EventDetails = ({ route, navigation }: any) => {
    const { event } = route.params;
    const { user } = useContext(AuthContext);

    const [cancel, setCancel] = useState<boolean>(false);
    const [join, setJoin] = useState<boolean>(false);

    // Fetch participants on mount and check if the user is already a participant
    const checkIfJoined = async () => {
        try {
            const participants = await getEventsParticipantsByEventID(event.id);
            const isParticipant = participants.some(p => p.participant_id === user.uid);
            setJoin(isParticipant);
        } catch (error) {
            console.error("Error fetching participants: ", error);
        }
    };

    useEffect(() => {checkIfJoined()}, [event.id, user.uid]);

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

    const cancelEvent = async (id: string) => {
        try{
            await cancelEventOnline(id);
            await cancelEventLocally(await getDBConnection(), id);
            setCancel(false);

            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch(error){
            console.error("Error canceling event: ", error);
            Alert.alert('Error', 'An error occurred while cancelling event. Please try again.');
        }
        
    };

    const joinEventFunction = async (participant_id: string, event_id: string) => {
        try{
            await joinEvent(participant_id, event_id);
            setJoin(!join);
        }catch(error){
            console.error("Error joining event: ", error);
            Alert.alert('Error', 'An error occurred while joining event. Please try again.');
        }
    }

    const unjoinEventFunction = async (participant_id: string, event_id: string) => {
        try{
            await unjoinEvent(participant_id, event_id);
            setJoin(!join);
        }catch(error){
            console.error("Error unjoining event: ", error);
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
                    <Text style={styles.title}>{event.name} </Text>
                    <View style={styles.locationWrapper}>
                        <Ionicons name="location-sharp" size={18} color='#3e2769' />
                        <Text style={styles.paragraph}>{event.location}</Text>
                        <Text style={styles.seats}>3m Seats Left</Text>
                    </View>

                    <View style={styles.timeContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.timeWrapper}>
                                <Text style={styles.paragraph}>Date</Text>
                                <Text style={{ fontSize: 20, color: '#3e2769', fontWeight: '500', }}>{event.start_date.format('Do MMM')}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.timeWrapper}>
                                <Text style={styles.paragraph}>Time</Text>
                                <Text style={{ fontSize: 20, color: '#3e2769', fontWeight: '500', }}>{event.start_time} - {event.end_time}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={{ marginLeft: 10, fontSize: 25, fontWeight: '400', color: 'black', marginBottom: 10 }}>Description</Text>
                <Text style={styles.paragraph}>
                    {event.description}
                </Text>
            </Animated.ScrollView>

            {/* Fixed Footer */}
            {event.host_id == user.uid?
            //Cancel event
            <View style={styles.detailFooter}>
                <TouchableOpacity onPress={() => {setCancel(true)}} style={styles.footerBtn} >
                    <Text style={styles.footerBtnTxt}>Cancel Event</Text>
                </TouchableOpacity>
            </View>
            : 
            // Join or unjoin event
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <TouchableOpacity onPress={()=>{}}> 
                    <MaterialCommunityIcons name="bell-ring-outline" size={23} color='#3e2769' style={styles.remindBtn} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {join?unjoinEventFunction(user.uid, event.id):joinEventFunction(user.uid, event.id)}} style={styles.joinButton} >
                    <Text style={styles.footerBtnTxt}>{join ? "Unjoin" : "Join"}</Text>
                </TouchableOpacity>
            </View>
            }

            {cancel ? (
            <View style={styles.overlay}>
                <View style={styles.cancelContainer}>
                <Text style={{ textAlign: 'center', margin: 10, fontSize: 18 }}>Confirm cancel?</Text>
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
            {event.host_id == user.uid?
           <TouchableOpacity
                onPress={()=> navigation.navigate('EditEvent', {event: event})}
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
        backgroundColor: 'white',
    },
    contentWrapper: {
        padding: 20,
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
    paragraph: {
        fontSize: 15,
        marginLeft: 10,
        color: '#3e2769',
        letterSpacing: 0.5,
    },
    seats: {
        fontSize: 18,
        marginLeft: 5,
        fontWeight: '300',
        color: 'black',
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
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: 'rgb(244,243,243)',
    },
    footerBtn: {
        flexDirection: 'row',
        backgroundColor: '#3e2769',
        padding: 10,
        borderRadius: 10,
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
    footerIcon: {
        color: 'white',
        marginBottom: 9,
    },
    joinButton: {
        backgroundColor: '#3e2769',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 230
    },
    remindBtn: {
        backgroundColor: '#e7dcf2',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10
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
        width: 250,
        height: 180,
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
        }
});
