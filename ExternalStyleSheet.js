import { StyleSheet } from "react-native";

const ExternalStyleSheet=StyleSheet.create({
    eventCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        padding: 10,
        marginVertical: 8,
      },
      eventImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
      },
      noImagePlaceholder: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 10,
      },
      eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#26294D'
      },
      eventTime: {
        fontSize: 14,
        color: '#888',
      },
      eventsHeader: {
        fontWeight: 'bold',
        paddingLeft: 15,
        fontSize: 25,
        paddingTop: 15,
        color: '#330c94'
      },
      noEventsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#888',
      },
});

export default ExternalStyleSheet;