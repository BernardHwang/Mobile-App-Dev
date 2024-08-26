import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { InputWithIconLabel } from '../UI'; 

const AddEvent = ({navigation}: any) => {
    const [eventTitle, setTitle] = useState<string>('');
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [startTime, setStartTime] = useState<Date | undefined>(new Date());
    const [endTime, setEndTime] = useState<Date | undefined>(new Date());
    const [location, setLocation] = useState<string>('');
    const [guest, setGuest] = useState<string>('');
    const [desc, setDesc] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
    const [isStartDatePicker, setIsStartDatePicker] = useState<boolean>(true);
    const [isStartTimePicker, setIsStartTimePicker] = useState<boolean>(true);
    

    const defaultImages = [
        require('../images/eventImg1.jpg'),
        require('../images/eventImg2.jpg'),
        require('../images/eventImg3.jpg')
    ];
    
    

    const [selectedImage, setSelectedImage] = useState<any | null>(defaultImages[0]);

    const handleChoosePhoto = () => {
        launchImageLibrary(
            { mediaType: 'photo', maxWidth: 300, maxHeight: 300, quality: 1 },
            (response) => {
                if (response.assets && response.assets.length > 0) {
                    const userImage = response.assets[0].uri;
                    setSelectedImage(userImage ?? selectedImage); 
                }
            }
        );
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
            } else {
                setEndTime(selectedTime);
            }
        }
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => {navigation.goBack()}}>
                        <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>New Event</Text>
                    <TouchableOpacity style={styles.saveBtn} onPress={() => {}}>
                        <Text style={styles.btnText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.body}>
                    <InputWithIconLabel
                    orientation={'horizontal'}
                    iconName={"calendar-check-o"}
                    size={20}
                    color={"#8A6536"}
                    placeholder="Add Event Title"
                    value={eventTitle}
                    onChangeText={setTitle}
                    />

                    <View style={styles.dateTimeContainer}>
                        <Text style={{marginBottom: 15}}>Start at</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                            <View style={styles.dateTimePicker}>
                                <Icon name="calendar" size={20} color="#8A6536" style={styles.icon} />
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsStartDatePicker(true);
                                        setShowDatePicker(true);
                                    }}
                                    style={styles.inputTouchable}
                                >
                                    <Text>{startDate?.toDateString() || 'Select Date'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dateTimePicker}>
                                <Icon name="clock-o" size={20} color="#8A6536" style={styles.icon} />
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsStartTimePicker(true);
                                        setShowTimePicker(true);
                                    }}
                                    style={styles.inputTouchable}
                                >
                                    <Text>{startTime?.toLocaleTimeString() || 'Select Time'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.dateTimeContainer}>
                        <Text style={{marginBottom: 15}}>End at</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                            <View style={styles.dateTimePicker}>
                                <Icon name="calendar" size={20} color="#8A6536" style={styles.icon} />
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsStartDatePicker(false);
                                        setShowDatePicker(true);
                                    }}
                                    style={styles.inputTouchable}
                                >
                                    <Text>{endDate?.toDateString() || 'Select Date'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dateTimePicker}>
                                <Icon name="clock-o" size={20} color="#8A6536" style={styles.icon} />
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsStartTimePicker(false);
                                        setShowTimePicker(true);
                                    }}
                                    style={styles.inputTouchable}
                                >
                                    <Text>{endTime?.toLocaleTimeString() || 'Select Time'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <InputWithIconLabel
                    orientation={'horizontal'}
                    iconName={"map-marker"}
                    size={20}
                    color={"#8A6536"}
                    placeholder='Add Location'
                    value={location}
                    onChangeText={setLocation}
                    />
                    
                    <InputWithIconLabel
                    orientation={'horizontal'}
                    iconName={"user-plus"}
                    size={20}
                    color={"#8A6536"}
                    placeholder='Invite Guest'
                    value={guest}
                    onChangeText={setGuest}
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
                                <Image source={image} style={styles.image} />
                            </TouchableOpacity>
                        ))}

                            <TouchableOpacity onPress={handleChoosePhoto} style={styles.uploadBox}>
                                {selectedImage && !defaultImages.includes(selectedImage) ? (
                                    <Image source={{ uri: selectedImage }} style={styles.image} />
                                ) : (
                                    <Text>Tap to Upload</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {showDatePicker && (
                    <DateTimePicker
                        value={isStartDatePicker ? startDate || new Date() : endDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDatePickerChange}
                    />
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={isStartTimePicker ? startTime || new Date() : endTime || new Date()}
                        mode="time"
                        display="default"
                        onChange={handleTimePickerChange}
                    />
                )}
            </View>
        </ScrollView>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15
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
        color: '#C7A06D',
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
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        margin: 15
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
        backgroundColor: '#C7A06D',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    }
});

export default AddEvent;
