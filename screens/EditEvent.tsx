import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { InputWithIconLabel } from '../UI';
import { editEventLocally, getDBConnection } from '../database/db-services';
import { updateEventOnline } from '../database/firestore-service';
import { AuthContext } from '../navigation/AuthProvider';
import { _sync, checkInternetConnection } from '../database/sync';

const EditEvent = ({navigation, route}: any) => {
    const { user } = useContext(AuthContext);
    
    const [eventID, setEventID] = useState<string>(route.params.event_id);
    const [event, setEvent] = useState<any>(null);
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
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState('');
    
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

     // Load event data on mount
     useEffect(() => {
        const loadEvent = async () => {
            try {
                const eventDetails = await route.params.refresh(eventID); // Get event data from refresh
                console.log('Event Details: ', eventDetails); // Log to verify
                if (eventDetails) {
                    setEvent(eventDetails);
                } else {
                    console.log('No event details returned');
                }
            } catch (error) {
                console.log("Error loading event: ", error);
            }
        };
        loadEvent();
        checkConnection(); // Check the internet connection
    }, [eventID, navigation]);
    

    // Update form fields when the event data is available
    useEffect(() => {
        if (event) {
            const start = convertTimestampToDate(event.start_date);
            const end = convertTimestampToDate(event.end_date);
            setTitle(event.name || '');
            setStartDate(moment(start).startOf('day').toDate());
            setEndDate(moment(end).startOf('day').toDate());
            setStartTime(start);
            setEndTime(end);
            setLocation(event.location || '');
            setGuest(event.guest || '');
            setSeat(event.seats || 0);
            setDesc(event.description || '');
        }
    }, [event]);

    const convertTimestampToDate = (timestamp) => {
        return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    };

    const handleDatePickerChange = (selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (isStartDatePicker) {
                setStartDate(selectedDate);
                //Reset end date if start date is late than end date
                if (endDate && moment(endDate).isBefore(selectedDate)){
                    setEndDate(null);
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
                    setEndTime(null);
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
        
                await updateEventOnline(eventData);
                await editEventLocally(await getDBConnection(), eventData);
                await _sync();
        
                console.log('Editing Event Data: ', eventData);

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'My Event' }],
                });

            } catch (error) {
                console.log("Error editing event: ", error);
                Alert.alert('Error', 'An error occurred while updating the event. Please try again.');
            }
        }
    };

    return (
        
            <ScrollView keyboardShouldPersistTaps='always'>
                {event
                ? (
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.cancelBtn} 
                        onPress={() => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'My Event' }],
                            });}}
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
                    ):(
                        <Text>Loading event details...</Text>
                    )}
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
