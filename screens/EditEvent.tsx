import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { launchImageLibrary } from 'react-native-image-picker';
import { InputWithIconLabel } from '../UI';
import { checkInternetConnection } from '../sync';
import { updateEventOnline } from '../firestore-service';
import { editEventLocally, getDBConnection } from '../db-services';
import { AuthContext } from '../navigation/AuthProvider';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DatePicker from 'react-native-date-picker';

const EditEvent = ({navigation, route}: any) => {
    const { user } = useContext(AuthContext);
    const { event } = route.params;

    const [eventTitle, setTitle] = useState<string>(event.name);
    const [startDate, setStartDate] = useState<Date|null>(event.start_date ? new Date(event.start_date) : null);
    const [endDate, setEndDate] = useState<Date|null>(event.end_date ? new Date(event.end_date) : null);
    const [startTime, setStartTime] = useState<Date|null>(event.start_date ? new Date(event.start_date) : null);
    const [endTime, setEndTime] = useState<Date|null>(event.end_date ? new Date(event.end_date) : null);
    const [location, setLocation] = useState<string>(event.location);
    const [guest, setGuest] = useState<string>(event.guest||'');
    const [seat, setSeat] = useState<number>(event.seats||0);
    const [desc, setDesc] = useState<string>(event.description);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
    const [isStartDatePicker, setIsStartDatePicker] = useState<boolean>(true);
    const [isStartTimePicker, setIsStartTimePicker] = useState<boolean>(true);
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState('');
    
    const defaultImages = [
        {uri: require('../images/eventImg1.jpg'), url: 'https://firebasestorage.googleapis.com/v0/b/ezpz-mobile-app-y2s3.appspot.com/o/eventImg1.jpg?alt=media&token=aceff1a6-76a6-4b62-abde-f2028dd51066'},
        {uri: require('../images/eventImg2.jpg'), url: 'https://firebasestorage.googleapis.com/v0/b/ezpz-mobile-app-y2s3.appspot.com/o/eventImg2.jpg?alt=media&token=162760ed-dca8-474d-b267-28179d6bb833'},
        {uri: require('../images/eventImg3.jpg'), url: 'https://firebasestorage.googleapis.com/v0/b/ezpz-mobile-app-y2s3.appspot.com/o/eventImg3.jpg?alt=media&token=7b3a58d2-1fa6-4ae0-b364-377a852b5e4a'}
    ];

    const checkConnection = async () => {
        const connected = await checkInternetConnection();
        setIsOnline(!!connected);
        if (!connected) {
            Alert.alert(
                'No Internet Connection',
                'You are offline. You cannot create or update events while offline.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }
    };

    useEffect(()=>{
        console.log(event);
    },[])
    useEffect(()=>{
        checkConnection();
    },[navigation])

    const handleDatePickerChange = (selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (isStartDatePicker) {
                setStartDate(selectedDate);
                //Reset end date if start date is late than end date
                if (endDate && moment(endDate).isBefore(selectedDate)){
                    setEndDate(undefined);
                }
            } else {
                setEndDate(selectedDate);
                
            }
        }
    };

    const handleTimePickerChange = (selectedTime?: Date) => {
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

    const emailErrorMessage = (input: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input === '' || emailRegex.test(input)) {
            setErrorMessage('');  // No error if valid
        } else {
            setErrorMessage('Please enter a valid email address');
        }
        setGuest(input);  // Update the input field value
    };
    
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    const handleSubmit = async () => {
        // Check event title is filled
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
        if (guest.trim() != '') {
            if (!validateEmail(guest.trim())){
                Alert.alert('Validation Error', 'Please enter a valid guest email.');
                return;
            }
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

    const editEvent = async (id:string) => {
        if (await handleSubmit()){
            try {
                const eventData = {
                    event_id: id,
                    name: eventTitle,
                    start_date: combineDateAndTime(startDate, startTime).toISOString(),
                    end_date: combineDateAndTime(endDate, endTime).toISOString(),
                    location: location,
                    guest: guest,
                    description: desc,
                    seats: seat,
                    image: event.image,
                    host_id: user.uid
                };
        
                await updateEventOnline(eventData)
                await editEventLocally(await getDBConnection(), eventData)
        
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Saved' }],
                });

            } catch (error) {
                console.error("Error editing event: ", error);
                Alert.alert('Error', 'An error occurred while updating the event. Please try again.');
            }
        }
    };

    return (
            <ScrollView keyboardShouldPersistTaps='always'>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => {navigation.reset({
                                                                                        index: 0,
                                                                                        routes: [{ name: 'Saved' }],
                                                                                    })}}
                    >
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Edit Event</Text>
                        <TouchableOpacity style={styles.saveBtn} onPress={() => {editEvent(event.id)}}>
                            <Text style={styles.btnText}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.body}>
                    <InputWithIconLabel
                    orientation={'horizontal'}
                    iconName={"calendar-check"}
                    size={25}
                    placeholder="Add Event Title"
                    value={eventTitle}
                    onChangeText={(input: string) => setTitle(input)}
                    />

                    <View style={styles.dateTimeContainer}>
                        <Text style={{marginBottom: 15}}>Start at</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                            <View style={styles.dateTimePicker}>
                                <FontAwesome name="calendar" size={20} color="#26294D" style={{marginRight: 10}} />
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
                            <FontAwesome name="clock-o" size={20} color="#26294D" style={{marginHorizontal: 10}} />
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
                            <FontAwesome name="calendar" size={20} color="#26294D" style={{marginRight: 10}}  />
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
                            <FontAwesome name="clock-o" size={20} color="#26294D" style={{marginHorizontal: 10}} />
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
                        <FontAwesome name="map-marker" size={28} color="#26294D"/>
                        <View style={{flex:1}}>
                            <GooglePlacesAutocomplete
                            placeholder={location? location:'Add Location'}
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
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 10,
                                width: 310,
                                zIndex: 1,
                                },
                                textInput: {
                                height: 40,
                                paddingLeft: 10,
                                backgroundColor: '#eae4f0',
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
                    iconName={"account-plus"}
                    size={25}
                    placeholder='Invite Guest'
                    value={guest}
                    onChangeText={(input: string) => emailErrorMessage(input)}
                    keyboardType='email-address'
                    errorMessage={errorMessage}
                    />
                    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                    <InputWithIconLabel
                    orientation={'horizontal'}
                    iconName={"account-group"}
                    size={25}
                    placeholder='Seat Capacity'
                    value={seat? String(seat): ''}
                    onChangeText={(input: string) => setSeat(Number(input))}
                    keyboardType= 'numeric'
                    />

                    <InputWithIconLabel
                    orientation={'horizontal'}
                    iconName={"text-long"}
                    size={25}
                    placeholder='Add Event Description'
                    value={desc}
                    onChangeText={(text: string) => setDesc(text)}
                    multiline={true}
                    numberOfLines={7}
                    containerStyle={{alignItems: 'flex-start'}}
                    styles={{textAlignVertical: 'top'}}
                    />

                </View>
                {showDatePicker && (
                    <DatePicker
                        modal
                        date={isStartDatePicker ? (startDate || new Date()) : (endDate || new Date())}
                        mode="date"
                        open={showDatePicker}
                        buttonColor='#26294D'
                        dividerColor='#26294D'
                        onConfirm={(selectedDate) => handleDatePickerChange(selectedDate)}
                        onCancel={()=>setShowDatePicker(false)}
                        minimumDate={isStartDatePicker?new Date():startDate||new Date()}
                    />
                )}
                {showTimePicker && (
                    <DatePicker
                        modal
                        date={isStartTimePicker ? (startTime || new Date()) : (endTime || new Date())}
                        mode="time"
                        open={showTimePicker}
                        buttonColor='#26294D'
                        dividerColor='#26294D'
                        onConfirm={(selectedTime) => handleTimePickerChange(selectedTime)}
                        onCancel={()=>setShowTimePicker(false)}
                    />
                )}
                </View>
                
                </ScrollView>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 17,
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
        padding: 10
    },
    dateTimeContainer: {
        flexDirection: 'column',
        margin: 7
    },
    dateTimePicker: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        paddingBottom: 13,
    },
    inputTouchable: {
        flex: 1,
        justifyContent: 'center',
        borderColor: 'transparent',
        borderWidth: 1,
        backgroundColor: '#eae4f0',
        paddingVertical: 9,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    errorText: {
        color: '#b52a2a',  // Error message in red
        marginLeft: 35
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

export default EditEvent;
