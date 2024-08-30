import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export const InputWithIconLabel = (props: any) => {
    const orientationDirection = (props.orientation == 'horizontal')? 'row' : 'column';

    return (
        <View style={[style.inputContainer, {flexDirection: orientationDirection}]}>
            <Icon name={props.iconName} style={style.icon} color={'#26294D'} {...props}/>
            <TextInput
                style={style.input}
                placeholderTextColor="#999"
                {...props}
            />
        </View>
    );
}

const style = StyleSheet.create({
    inputContainer: {
        alignItems: 'center',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        margin: 15
    },
    input: {
        flex: 1,
        marginLeft: 10,
    },
    icon: {
        marginRight: 10,
    },
})
