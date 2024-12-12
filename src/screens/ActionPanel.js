
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import Draggable from 'react-native-draggable';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ActionPanel({ route }) {
  const { spriteCount = 2 } = route.params || {}; // Receive spriteCount from MainScreen
  const navigation = useNavigation();

  // Initialize actions state for all sprites dynamically
  const initialActions = {};
  for (let i = 1; i <= spriteCount; i++) {
    initialActions[`sprite${i}`] = [];
  }

  const [actions, setActions] = useState(initialActions);
  const [activeTab, setActiveTab] = useState('sprite1'); // Default active tab is sprite1

  const codeOptions = [
    "Move X by 50",
    "Move X by -50",
    "Rotate 30",
    "Go to (0,0)",
    "Move X=50, Y=50",
    "Go to random position",
    "Repeat",
  ];

  const handleDrop = (item, x, y) => {
    const dropArea = {
      x: screenWidth * 0.1,
      y: screenHeight * 0.4,
      width: screenWidth * 0.8,
      height: screenHeight * 0.4,
    };

    if (
      x > dropArea.x &&
      x < dropArea.x + dropArea.width &&
      y > dropArea.y &&
      y < dropArea.y + dropArea.height
    ) {
      setActions((prevActions) => ({
        ...prevActions,
        [activeTab]: [...prevActions[activeTab], { id: Date.now(), name: item }],
      }));
    }
  };

  const handleDeleteAction = (actionId) => {
    setActions((prevActions) => ({
      ...prevActions,
      [activeTab]: prevActions[activeTab].filter((action) => action.id !== actionId),
    }));
  };

  const navigateToMainScreen = () => {
    // Pass all sprite actions back to MainScreen
    navigation.navigate('MainScreen', { spriteActions: actions });
  };

  const renderActionItem = ({ item, drag }) => (
    <TouchableOpacity
      style={styles.actionItem}
      onLongPress={drag} // Enables dragging when long-pressed
    >
      <Text style={styles.actionText}>{item.name}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteAction(item.id)}
      >
        <MaterialIcons name="delete" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.codeSection}>
        <Text style={styles.sectionHeader}>CODE</Text>
        <View style={styles.codeOptionsContainer}>
          {codeOptions.map((item, index) => (
            <Draggable
              key={index}
              x={20}
              y={index * 70 + 20} // Staggered placement with a gap
              renderSize={60}
              renderColor="blue"
              renderText={item}
              isCircle={true}
              onDragRelease={(e, gestureState) =>
                handleDrop(item, gestureState.moveX, gestureState.moveY)
              }
              shouldReverse={true} // Ensures draggable returns to original position if not dropped
            />
          ))}
        </View>
      </View>

      <View style={styles.actionSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollContainer}>
          <View style={styles.tabContainer}>
            {Array.from({ length: spriteCount }, (_, i) => i + 1).map((spriteIndex) => (
              <TouchableOpacity
                key={`sprite${spriteIndex}`}
                style={[
                  styles.tabButton,
                  activeTab === `sprite${spriteIndex}` && styles.selectedTab,
                ]}
                onPress={() => setActiveTab(`sprite${spriteIndex}`)}
              >
                <Text style={styles.tabButtonText}>Sprite {spriteIndex}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.actionList}>
          {actions[activeTab].length === 0 ? (
            <Text>No actions added for this sprite.</Text>
          ) : (
            <DraggableFlatList
              data={actions[activeTab]}
              renderItem={renderActionItem}
              keyExtractor={(item) => item.id.toString()}
              onDragEnd={({ data }) => {
                setActions((prevActions) => ({
                  ...prevActions,
                  [activeTab]: data,
                }));
              }}
            />
          )}
        </View>

        <TouchableOpacity style={styles.executeButton} onPress={navigateToMainScreen}>
          <Text style={styles.executeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    padding: 10,
  },
  codeSection: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
    zIndex: 10, // Ensures it appears above other sections
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20, // Increased gap below the header
  },
  codeOptionsContainer: {
    gap: 15, // Space between code options
  },
  actionSection: {
    flex: 2,
    backgroundColor: '#fff',
    padding: 20,
  },
  tabScrollContainer: {
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tabButton: {
    backgroundColor: '#f7f7f7',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTab: {
    backgroundColor: '#4CAF50',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#333',
  },
  actionList: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 5,
    minHeight: 100,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  actionText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 5,
    borderRadius: 5,
  },
  executeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  executeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});