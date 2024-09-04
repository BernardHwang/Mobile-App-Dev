import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Animated, Modal } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons2 from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;
const MIN_IMG_HEIGHT = 100; // minimum height of the image after scroll

const EventDetails = ({ route }) => {
    const { event } = route.params;
    const navigation = useNavigation();
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
                        <MaterialCommunityIcons name="location-sharp" size={18} color='#3e2769' />
                        <Text style={styles.paragraph}>{event.location}</Text>
                        <Text style={styles.seats}>3m Seats Left</Text>
                    </View>

                    <View style={styles.timeContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.timeWrapper}>
                                <Text style={styles.paragraph}>Start Time</Text>
                                <Text style={{ fontSize: 30, color: '#3e2769', fontWeight: '500', }}>{event.time}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.timeWrapper}>
                                <Text style={styles.paragraph}>Date</Text>
                                <Text style={{ fontSize: 25, color: '#3e2769', fontWeight: '500', }}>{event.startDate.format('Do MMM')}</Text>
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
            <View style={styles.detailFooter}>
                <TouchableOpacity onPress={() => { }} style={styles.footerBtn} >
                    <MaterialCommunityIcons2 name="bell-ring-outline" size={14} style={styles.footerIcon} />
                    <Text style={styles.footerBtnTxt}>Remind Me ༼;´༎ຶ ۝ ༎ຶ༽ </Text>
                </TouchableOpacity>
            </View>

            {/* Custom Back Button */}
            <TouchableOpacity
                onPress={() => navigation.goBack()} // Navigate to Home screen
                style={styles.headerLeftContainer}
            >
                <View style={styles.headerIconContainer}>
                    <MaterialCommunityIcons name='chevron-back-outline' size={30} color="#3e2769" />
                </View>
            </TouchableOpacity>
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
});
