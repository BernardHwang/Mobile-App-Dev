import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import moment from 'moment';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { InputWithIconLabel } from '../UI';

const AddEvent = ({navigation}: any) => {
    const [eventTitle, setTitle] = useState<string>('');
    const [startDate, setStartDate] = useState<Date|null>(null);
    const [endDate, setEndDate] = useState<Date|null>(null);
    const [startTime, setStartTime] = useState<Date|null>(null);
    const [endTime, setEndTime] = useState<Date|null>(null);
    const [location, setLocation] = useState<string>('');
    const [guest, setGuest] = useState<string>('');
    const [seat, setSeat] = useState<number>(0);
    const [desc, setDesc] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
    const [isStartDatePicker, setIsStartDatePicker] = useState<boolean>(true);
    const [isStartTimePicker, setIsStartTimePicker] = useState<boolean>(true);

    const defaultImages = [
        {uri: require('../images/eventImg1.jpg'), url: 'https://firebasestorage.googleapis.com/v0/b/ezpz-mobile-app-y2s3.appspot.com/o/eventImg1.jpg?alt=media&token=aceff1a6-76a6-4b62-abde-f2028dd51066'},
        {uri: require('../images/eventImg2.jpg'), url: 'https://firebasestorage.googleapis.com/v0/b/ezpz-mobile-app-y2s3.appspot.com/o/eventImg2.jpg?alt=media&token=162760ed-dca8-474d-b267-28179d6bb833'},
        {uri: require('../images/eventImg3.jpg'), url: 'https://firebasestorage.googleapis.com/v0/b/ezpz-mobile-app-y2s3.appspot.com/o/eventImg3.jpg?alt=media&token=7b3a58d2-1fa6-4ae0-b364-377a852b5e4a'}
    ];

    const [selectedImage, setSelectedImage] = useState<any | null>(defaultImages[0]);

    const handleChoosePhoto = () => {
        launchImageLibrary(
            { mediaType: 'photo', maxWidth: 300, maxHeight: 300, quality: 1 },
            (response) => {
                if (response.assets && response.assets.length > 0) {
                    const userImage = response.assets[0].uri;
                    setSelectedImage({uri: userImage}); 
                }
            }
        );
    };

    const uploadImageToStorage = async (imageUri: string) => {
        const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
        const storageRef = storage().ref(`events/${filename}`);

        await storageRef.putFile(imageUri);
        const downloadUrl = await storageRef.getDownloadURL();

        return downloadUrl;
    };
    
    const handleDatePickerChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (isStartDatePicker) {
                setStartDate(selectedDate);
            } else {
                setEndDate(selectedDate);
            }
        }
    };

    const handleTimePickerChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            if (isStartTimePicker) {
                setStartTime(selectedTime);
                // Reset end time if it's now earlier than the new start time on the same date
                if (endDate && startDate && moment(endDate).isSame(startDate, 'day') && endTime && moment(selectedTime).isAfter(endTime)) {
                    setEndTime(undefined);
                }
            } else {
                // If the start and end dates are the same, ensure the end time is after the start time
                if (startDate && endDate && moment(startDate).isSame(endDate, 'day')) {
                    if (moment(selectedTime).isAfter(startTime)) {
                        setEndTime(selectedTime);
                    } else {
                        Alert.alert('End time must be after start time. Please select again.');
                    }
                } else {
                    setEndTime(selectedTime);
                }
            }
        }
    };
    

    const combineDateAndTime = (date: Date, time: Date): Date => {
        const combined = new Date(date);
        combined.setHours(time.getHours());
        combined.setMinutes(time.getMinutes());
        combined.setSeconds(time.getSeconds());
        combined.setMilliseconds(time.getMilliseconds());
        return combined;
    };

    const getNextEventId = async () => {
        const counterRef = firestore().collection('counters').doc('eventCounter');
    
        try {
            const newId = await firestore().runTransaction(async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
    
                if (!counterDoc.exists) {
                    // If the document doesn't exist, initialize it with count = 0
                    transaction.set(counterRef, { count: 0 });
                    return 'E1'; // The first event ID
                }
    
                const currentCount = counterDoc.data().count || 0;
                const newCount = currentCount + 1;
    
                transaction.update(counterRef, { count: newCount });
    
                return 'E' + newCount;
            });
    
            return newId;
        } catch (error) {
            console.error("Transaction failed: ", error);
            throw error;
        }
    };
    
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    const handleSubmit = async () => {
        if (!eventTitle.trim()) {
            Alert.alert('Validation Error', 'Event title is required.');
            return;
        }
    
        // Check for missing dates or times
        if (!startDate || !endDate || !startTime || !endTime) {
            Alert.alert('Validation Error', 'All date and time fields are required.');
            return;
        }
    
        // Validate guest email
        if (!validateEmail(guest.trim())) {
            Alert.alert('Validation Error', 'Please enter a valid guest email.');
            return;
        }

        // Check location
        if (!location.trim()) {
            Alert.alert('Validation Error', 'Please enter a location.');
            return false;
        }

        // Validate seat capacity
        if (seat <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid seat capacity.');
            return false;
        }

        // Validate desc
        if (!desc.trim()) {
            Alert.alert('Validation Error', 'Please enter an event description.');
            return false;
        }
        
        return true;
    };

    const addEvent = async () => {
        if (await handleSubmit()){
            
            try {
                let imageUrl = '';
                if (selectedImage && selectedImage.uri && typeof selectedImage.uri === 'string') {
                    if (selectedImage.uri.startsWith('file://')) {
                        imageUrl = await uploadImageToStorage(selectedImage.uri);
                    } else {
                        imageUrl = selectedImage.url;
                    }
                } else if (selectedImage && selectedImage.url) {
                    imageUrl = selectedImage.url;
                }

                const newDocId = await getNextEventId();
        
                const eventData = {
                    name: eventTitle,
                    startDate: combineDateAndTime(startDate, startTime),
                    endDate: combineDateAndTime(endDate, endTime),
                    location: location,
                    guest: guest,
                    description: desc,
                    seats: seat,
                    image: imageUrl
                };
        
                await firestore().collection('events').doc(newDocId).set(eventData);
        
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Saved' }],
                });
            } catch (error) {
                console.error("Error adding event: ", error);
            }
        }
    };

    return (
            <ScrollView keyboardShouldPersistTaps='always'>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => {navigation.goBack()}}>
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>New Event</Text>
                        <TouchableOpacity style={styles.saveBtn} onPress={addEvent}>
                            <Text style={styles.btnText}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.body}>
                    <InputWithIconLabel
                    orientation={'horizontal'}
                    iconName={"calendar-check-o"}
                    size={20}
                    placeholder="Add Event Title"
                    value={eventTitle}
                    onChangeText={(input: string) => setTitle(input)}
                    />

                    <View style={styles.dateTimeContainer}>
                        <Text style={{marginBottom: 15}}>Start at</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                            <View style={styles.dateTimePicker}>
                                <Icon name="calendar" size={20} color="#26294D" style={styles.icon} />
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsStartDatePicker(true);
                                        setShowDatePicker(true);
                                    }}
                                    style={styles.inputTouchable}
                                >
                                    <Text>{startDate ? moment(startDate).format('YYYY-MM-DD') : 'Select Date'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dateTimePicker}>
                                <Icon name="clock-o" size={20} color="#26294D" style={styles.icon} />
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsStartTimePicker(true);
                                        setShowTimePicker(true);
                                    }}
                                    style={styles.inputTouchable}
                                >
                                    <Text>{startTime? moment(startTime).format('hh:mm A') : 'Select Time'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.dateTimeContainer}>
                        <Text style={{marginBottom: 15}}>End at</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                            <View style={styles.dateTimePicker}>
                                <Icon name="calendar" size={20} color="#26294D" style={styles.icon} />
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsStartDatePicker(false);
                                        setShowDatePicker(true);
                                    }}
                                    style={styles.inputTouchable}
                                >
                                    <Text>{endDate? moment(endDate).format('YYYY-MM-DD') : 'Select Date'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dateTimePicker}>
                                <Icon name="clock-o" size={20} color="#26294D" style={styles.icon} />
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsStartTimePicker(false);
                                        setShowTimePicker(true);
                                    }}
                                    style={styles.inputTouchable}
                                >
                                    <Text>{endTime? moment(endTime).format('hh:mm A') : 'Select Time'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Icon name="map-marker" size={28} color="#26294D" style={styles.icon} />
                        <View style={{flex:1}}>
                            <GooglePlacesAutocomplete
                            placeholder="Add location"
                            onPress={(data, details = null) => {
                                if (details) {
                                    console.log("Selected Location:", data.description);
                                    setLocation(data.description);
                                }
                            }}
                            query={{
                                key: 'AIzaSyDfYC_0IwQ1K2Ua07Ix1vYMaSP-eafAmbw',
                                language: 'en',
                            }}
                            styles={{
                                textInputContainer: {
                                backgroundColor: 'transparent',
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 10,
                                zIndex: 1, 
                                },
                                textInput: {
                                height: 40,
                                paddingLeft: 10,
                                backgroundColor: 'transparent',
                                borderBottomWidth: 1,
                                borderBottomColor: 'black',
                                fontSize: 14,
                                flex: 1,
                                },
                                listView: {
                                backgroundColor: 'white',
                                position: 'absolute', 
                                top: 45, 
                                left: 0,
                                right: 0,
                                zIndex: 2, 
                                },
                            }}
                            />
                        </View>
                    </View>
                    
                    <InputWithIconLabel
                    orientation={'horizontal'}
                    iconName={"user-plus"}
                    size={20}
                    placeholder='Invite Guest'
                    value={guest}
                    onChangeText={(input: string) => setGuest(input)}
                    keyboardType='email-address'
                    />

                    <InputWithIconLabel
                    orientation={'horizontal'}
                    iconName={"users"}
                    size={20}
                    placeholder='Seat Capacity'
                    value={seat}
                    onChangeText={(input: number) => setSeat(input)}
                    keyboardType= 'numeric'
                    />

                    <View>
                        <Text>Event Description</Text>
                        <TextInput
                            style={styles.eventDesc}
                            placeholder="Enter Event Description"
                            value={desc}
                            onChangeText={(text: string) => setDesc(text)}
                            multiline={true}
                            numberOfLines={7}
                        />
                    </View>

                    <View>
                        <Text style = {{marginVertical: 15}}>Choose an image</Text>
                        <View style={styles.imagesSection}>
                        {defaultImages.map((image, index) => (
                            <TouchableOpacity key={index} onPress={() => setSelectedImage(image)}>
                                <Image source={image.uri} style={[styles.image, selectedImage.uri === image.uri && styles.selectedImage]} />
                            </TouchableOpacity>
                        ))}

                            <TouchableOpacity onPress={handleChoosePhoto} style={styles.uploadBox}>
                                {selectedImage && !defaultImages.some(image => image.uri === selectedImage.uri) ? (
                                    <Image source={selectedImage} style={styles.selectedImage}/>
                                ) : (
                                    <Text style={{color: 'white'}}>Tap to Upload</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {showDatePicker && (
                    <DateTimePicker
                        value={isStartDatePicker ? (startDate || new Date()) : (endDate || new Date())}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => handleDatePickerChange(event, selectedDate)}
                        minimumDate={isStartDatePicker?undefined:startDate||new Date()}
                    />
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={isStartTimePicker ? startTime || new Date() : endTime || new Date()}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => handleTimePickerChange(event, selectedTime)}
                    />
                )}
                </View>
                
                </ScrollView>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fdf1f0'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cancelBtn: {
        marginLeft: 10,
        color: 'black'
    },
    title: {
        color: '#26294D',
        fontWeight: '400',
        fontSize: 25
    },
    saveBtn: {
        marginRight: 10,
        color: 'black'
    },
    btnText: {
        color: 'black',
        fontWeight: 'bold',
    },
    body: {
        flex: 1
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        //margin: 15,
        padding: 10
    },
    dateTimeContainer: {
        flexDirection: 'column',
        margin: 13
    },
    dateTimePicker: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        paddingBottom: 13, 
        marginHorizontal: 6
    },
    inputTouchable: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    icon: {
        marginRight: 10,
    },
    eventDesc: {
        marginTop: 15,
        borderWidth: 1,
        borderColor: 'black',
        height: 200,
        textAlignVertical: 'top'
    },
    imagesSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    uploadBox: {
        width: 80,
        height: 80,
        borderRadius: 10,
        backgroundColor: '#26294D',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderWidth: 3,           
        borderColor: 'black', 
        borderRadius: 10,
    },
    textInputContainer: {
        marginVertical: 10,
        borderBottomColor: 'black',
        borderBottomWidth: 1,
    },
    textInput: {
        marginLeft: 10,
        height: 40,
        fontSize: 14,
        backgroundColor: 'transparent',
    },
    map: {
        width: '100%',
        height: 200,
        marginTop: 15,
    },
});

export default AddEvent;
