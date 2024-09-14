import React, {useState} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableNativeFeedback, Dimensions} from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

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

const InputWithLabel = (props: any) => {

    const [hidePassword, setHidePassword] = useState(props.password);

    return (
        <View style={{ marginBottom: 20 }}>
            <Text style={inputLabelStyles.label}>{props.label}</Text>
            <View
                style={[inputLabelStyles.input, {
                        borderColor: props.error ? 'red' : '#ccc',
                        backgroundColor: props.editable === false ? '#e0e0e0' : '#fff'
                    }
                ]}
            >
                <Icon
                    name={props.iconName}
                    style={{ fontSize: 25, color: '#30106B', marginLeft: 10, marginRight: 10 }}
                />
                <TextInput
                    autoCorrect={false}
                    secureTextEntry={hidePassword}
                    style={{ flex: 1, fontSize: 16, fontColor: props.editable === false ? '#747474' : 'black' }}
                    {...props}
                />
                {props.password && (
                    <Icon
                        onPress={() => setHidePassword(!hidePassword)}
                        name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
                        style={{ color: "#30106B", fontSize: 25, marginRight: 10}}
                    />
                )}
            </View>
            {props.error && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: 7, marginLeft: 10 }}>
                    {props.error}
                </Text>
            )}
        </View>
    );
}

const AppButton = (props: any) => {

    let backgroundColorTheme = props.disabled ? "#808080" : "#4B0082";
    let textColor = props.disabled ? '#ddd' : '#fff';

    return (
        <TouchableNativeFeedback
            onPress={props.onPress}
            disabled={props.disabled}
        >
            <View style={[buttonStyles.button, { backgroundColor: backgroundColorTheme }, props.btnStyle]}>
                <Text style={buttonStyles.buttonText}>{props.title}</Text>
            </View>
        </TouchableNativeFeedback>
    )
}

const ProfileActionButton = (props:any) => {
    return(
        <TouchableNativeFeedback onPress={props.onPress}>
            <View style={[styles.actionButtonContainer, { backgroundColor: props.backgroundColor || '#efecf6' }]}>
                <Icon
                    name={props.iconName}
                    style={[styles.icon, {color:props.color || '#3e2769'}]}
                    size={30}
                />
                <Text style={[styles.actionText, { color: props.color || '#3e2769' }]}>{props.title}</Text>
            </View>
        </TouchableNativeFeedback>
    );
}


const DrawerButton = () => {
    const navigation = useNavigation();
    return (
        <TouchableWithoutFeedback onPress={() => navigation.openDrawer()}>
            <Icon name="menu" size={30} color="#000" />
        </TouchableWithoutFeedback>
    );
};

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
        marginVertical: 5,
        marginHorizontal: 10,
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold'
    },
    input: {
        height: 55,
        backgroundColor: "#fff",
        flexDirection: 'row',
        marginHorizontal: 10,
        borderWidth: 1,
        alignItems: 'center',
        borderRadius: 5,
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

const headerStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        marginHorizontal: 16,
    },
    iconContainer: {
        height: 45,
        width: 45,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ccc",
    },
    icon: {
        height: 25,
        width: 25,
        tintColor: "black",
    }
})

const styles = StyleSheet.create({
    actionButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 20,
        marginVertical: 10,
        marginHorizontal: 15,
    },
    icon: {
        padding: 10,
        borderRadius: 30,
        marginRight: 15,
    },
    actionText: {
        fontSize: 18,
        fontWeight: '500',
    },
});

export {
    InputWithIconLabel,
    InputWithLabel,
    AppButton,
    ProfileActionButton,
    DrawerButton
}