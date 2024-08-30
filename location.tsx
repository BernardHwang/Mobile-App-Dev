import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/FontAwesome';

const App = () => {
  return (
    <FlatList
      data={[{key: 'item1'}]} // Add your actual data here
      renderItem={() => (
        <View style={styles.container}>
          <Icon name="map-marker" size={28} color="#8A6536" style={styles.icon} />
          <View style={styles.inputWrapper}>
            <GooglePlacesAutocomplete
              placeholder="Search"
              onPress={(data, details = null) => {
                console.log(data, details);
              }}
              query={{
                key: 'AIzaSyDfYC_0IwQ1K2Ua07Ix1vYMaSP-eafAmbw',
                language: 'en',
              }}
              styles={{
                textInputContainer: {
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  zIndex: 1,
                },
                textInput: {
                  height: 40,
                  paddingLeft: 10,
                  backgroundColor: 'transparent',
                  borderBottomWidth: 1,
                  borderBottomColor: 'black',
                  fontSize: 16,
                  flex: 1,
                },
                listView: {
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: 45,
                  left: 0,
                  right: 0,
                  zIndex: 3,
                },
              }}
            />
          </View>
        </View>
      )}
      keyExtractor={item => item.key}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  icon: {
    marginRight: 10,
  },
  inputWrapper: {
    flex: 1, // Allow input to take up available space
  },
});

export default App;
