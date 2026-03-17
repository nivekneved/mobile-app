import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Card, Title, Paragraph, Button, Chip } from 'react-native-paper';

const mockBookings = [
  { id: 1, serviceName: 'Hair Salon', date: '2026-03-20', time: '14:30', status: 'confirmed' },
  { id: 2, serviceName: 'House Cleaning', date: '2026-03-22', time: '10:00', status: 'pending' },
  { id: 3, serviceName: 'Massage Therapy', date: '2026-03-25', time: '16:00', status: 'confirmed' },
];

export default function BookingsScreen() {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderBookingItem = ({ item }) => (
    <Card style={styles.bookingCard}>
      <Card.Content>
        <View style={styles.headerRow}>
          <Title>{item.serviceName}</Title>
          <Chip
            textStyle={{ color: 'white', fontSize: 12 }}
            style={{ backgroundColor: getStatusColor(item.status) }}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Chip>
        </View>
        <Paragraph style={styles.dateText}>
          Date: {new Date(item.date).toLocaleDateString()} at {item.time}
        </Paragraph>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button onPress={() => console.log(`View details for booking ${item.id}`)}>
          Details
        </Button>
        {item.status === 'confirmed' && (
          <Button 
            onPress={() => console.log(`Cancel booking ${item.id}`)}
            color="#F44336"
          >
            Cancel
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {mockBookings.length > 0 ? (
        <FlatList
          data={mockBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Title>No bookings yet</Title>
          <Paragraph style={styles.emptyText}>
            You haven't made any bookings. Start exploring services to book your first appointment!
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => console.log('Navigate to explore')}
          >
            Explore Services
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  bookingCard: {
    marginBottom: 15,
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
});