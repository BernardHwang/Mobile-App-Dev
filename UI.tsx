import React from 'react';
import {View, Text, TextInput, StyleSheet, TouchableNativeFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const InputWithIconLabel = (props: any) => {
    const orientationDirection = (props.orientation == 'horizontal')? 'row' : 'column';

    return (
        <View style={[style.inputContainer, {flexDirection: orientationDirection}]}>
            <Icon name={props.iconName} style={style.icon} {...props}/>
            <TextInput
                style={style.input}
                {...props}
            />
        </View>
    );
}

const InputWithLabel = (props:any) => {
    return(
        <View style={inputLabelStyles.container}>
            <Text style={inputLabelStyles.label}>{props.label}</Text>
            <TextInput
                style={[inputLabelStyles.input, props.styles]}
                {...props}
            />
        </View>
    );

}

const AppButton = (props: any) => {

    let backgroundColorTheme = '';

    if (props.theme) {
        switch (props.theme) {
            case 'disable':
                backgroundColorTheme = "#60717d";
            default:
                backgroundColorTheme = "#4B0082";
        }
    } else {
        backgroundColorTheme = "#4B0082";
    }

    return (
        <TouchableNativeFeedback
            onPress={props.onPress}
        >
            <View style={[buttonStyles.button, { backgroundColor: backgroundColorTheme }]}>
                <Text style={buttonStyles.buttonText}>{props.title}</Text>
            </View>
        </TouchableNativeFeedback>
    )
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

const inputLabelStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    label: {
        marginLeft: 10,
        paddingBottom: 5,
        textAlignVertical: "center",
        fontWeight: "bold",
        fontSize: 16,
        color: "black",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        backgroundColor: "#fff"
    }
})

const buttonStyles = StyleSheet.create({
    button: {
        margin: 20,
        alignItems: "center",
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 20,
        color: "#fff",
        padding: 15,
    }
})

export {
    InputWithIconLabel,
    InputWithLabel,
    AppButton
}