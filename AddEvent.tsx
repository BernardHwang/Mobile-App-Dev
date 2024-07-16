import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';

const App = () => {
    const [eventTitle, setTitle] = useState<string>('');
    const [eventDate, setDate] = useState<Date | undefined>(new Date());
    const [eventTime, setTime] = useState<Date | undefined>(new Date());
    const [location, setLocation] = useState<string>('');
    const [guest, setGuest] = useState<string>('');
    const [desc, setDesc] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => {}}>
                    <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>New Event</Text>
                <TouchableOpacity style={styles.saveBtn} onPress={() => {}}>
                    <Text style={styles.btnText}>Save</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.body}>
                <View style={styles.inputContainer}>
                    <Icon name="calendar-check-o" size={20} color="#8A6536" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Add Event Title"
                        value={eventTitle}
                        onChangeText={setTitle}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="calendar" size={20} color="#8A6536" style={styles.icon} />
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputTouchable}>
                        <Text>{eventDate?.toDateString() || 'Select Date'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="clock-o" size={20} color="#8A6536" style={styles.icon} />
                    <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputTouchable}>
                        <Text>{eventTime?.toLocaleTimeString() || 'Select Time'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="map-marker" size={20} color="#8A6536" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder='Add Location'
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="user-plus" size={20} color="#8A6536" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder='Invite Guest'
                        value={guest}
                        onChangeText={setGuest}
                    />
                </View>
                <Text>Event Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Enter Event Description'
                    value={desc}
                    onChangeText={setDesc}
                />
            </View>
            {showDatePicker && (
                <DateTimePicker
                    value={eventDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                            setDate(selectedDate);
                        }
                    }}
                />
            )}
            {showTimePicker && (
                <DateTimePicker
                    value={eventTime || new Date()}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                        setShowTimePicker(false);
                        if (selectedTime) {
                            setTime(selectedTime);
                        }
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
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
        margin: 15,
    },
    input: {
        flex: 1,
        marginLeft: 10,
    },
    inputTouchable: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    icon: {
        marginRight: 10,
    }
});

export default App;
