import React,{useState} from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import Animated,{ runOnJS, useAnimatedStyle, useSharedValue, withTiming, SharedValue } from 'react-native-reanimated';

export type TabButtonType = {
    title: string;
}

type SavedScreenButtonsProps ={
    buttons: TabButtonType[];
    selectedTab: number;
    setSelectedTab:(index: number) => void;
    tabPositionX: SharedValue<number>; // New prop for tab position
}

const SavedScreenButtons = ({buttons,selectedTab,setSelectedTab, tabPositionX}: SavedScreenButtonsProps) => {
    const [dimensions, setDimensions] = useState({height: 20,width: 100});
    
    const buttonWidth = dimensions.width / buttons.length;

    const onTabbarLayout = (e:LayoutChangeEvent) =>{
        setDimensions({
            height: e.nativeEvent.layout.height,
            width: e.nativeEvent.layout.width,
        });
        tabPositionX.value = withTiming(selectedTab * buttonWidth);
    };

    const handlePress = (index:number) => {
        setSelectedTab(index);
    }

    const onTabPress = (index: number) => {
        tabPositionX.value = withTiming(buttonWidth * index,{},()=>{
            runOnJS(handlePress)(index);
        });
    }

    const animatedStyle = useAnimatedStyle(()=>{
        return{
            transform: [{translateX: tabPositionX.value}]
        }
    })

    return(
        <View 
        accessibilityRole="tablist"
            style={{
                backgroundColor: 'white',
                borderRadius: 20,
                justifyContent:'center',
                borderWidth: 2, 
                borderColor:'#e0e0e0',
                height: dimensions.height+15,
            }}
        >
            <Animated.View
                style={[animatedStyle,{
                    position: 'absolute', 
                    backgroundColor: 'violet', 
                    borderRadius: 10, 
                    marginHorizontal: 10,
                    height: dimensions.height,
                    width: buttonWidth-20, 
                    }]}
            />
            <View onLayout={onTabbarLayout} style={{flexDirection:'row'}}>
                {buttons.map((button, index)=>{
                    const color = selectedTab === index ? 'white' : 'violet';
                    return(
                        <Pressable 
                            key={index} 
                            style={{flex: 1, paddingVertical: 10}} 
                            onPress={() => onTabPress(index)}
                            accessibilityRole="tab"
                        >
                            <Text 
                                style={{
                                    color:color, 
                                    alignSelf:'center', 
                                    fontWeight:'600', 
                                    fontSize: 14
                                }}
                            >
                                {button.title}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    )
}

export default SavedScreenButtons;