import React,{ useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import TabButtons, {TabButtonType} from './SavedScreenButtons';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

export enum CustomTab {
  Tab1,
  Tab2,
}

const SavedScreen = () => {
  const [selectedTab,setSelectedTab] = useState<CustomTab>(CustomTab.Tab1);
  const pagerRef = useRef<PagerView>(null); // Ref to control PagerView
  const tabPositionX = useSharedValue(0); // Shared value for tab position

  const buttons : TabButtonType[] = [
    {title: 'Tab 1'},
    {title: 'Tab 2'},
  ]

  const buttonWidth = 195;

  const onPageSelected = (event: any) => {
    const index = event.nativeEvent.position;
    setSelectedTab(index); // Update selected tab when page changes
    tabPositionX.value = withTiming(index * buttonWidth);
  };

  const onTabPress = (index: number) => {
    pagerRef.current?.setPage(index); // Sync PagerView with tab press
    setSelectedTab(index);
    tabPositionX.value = withTiming(index * buttonWidth);
  };

    return (
      <>
      <TabButtons 
        buttons={buttons} 
        selectedTab={selectedTab} 
        setSelectedTab={onTabPress}
        tabPositionX={tabPositionX}
      />
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={onPageSelected}
      >
        <View key="1" style={styles.page}>
          <Text style={styles.text}>Tab 1 Content</Text>
        </View>
        <View key="2" style={styles.page}>
          <Text style={styles.text}>Tab 2 Content</Text>
        </View>
      </PagerView>
    </>
   );
  };
  
  const styles = StyleSheet.create({
    page: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 18,
      color: 'B9A1E4',
    },
  });

export default SavedScreen;
