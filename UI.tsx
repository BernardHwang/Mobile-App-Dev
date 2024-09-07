import React from 'react';
import {View, Text, TextInput, StyleSheet, TouchableNativeFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const InputWithIconLabel = (props: any) => {
    const orientationDirection = (props.orientation == 'horizontal')? 'row' : 'column';

    return (
        <View style={[style.inputContainer, {flexDirection: orientationDirection}, props.containerStyle]}>
            <Icon name={props.iconName} color={'#26294D'} {...props}/>
            <TextInput
                style={[style.input, props.styles, props.errorMessage ? style.inputError : null]}
                placeholderTextColor="#999"
                {...props}
            />
            {props.errorMessage ? (
                <Icon name="alert-circle" color="#b52a2a" size={25} style={style.errorIcon} />
            ) : null}
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
        marginVertical: 15,
        marginLeft: 0
    },
    input: {
        flex: 1,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: '#eae4f0',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    inputError: {
        borderColor: '#b52a2a',  // Add red border when error occurs
        borderWidth: 1,
    },
    errorIcon: {
        marginLeft: 5,  // Spacing between the input field and the error icon
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