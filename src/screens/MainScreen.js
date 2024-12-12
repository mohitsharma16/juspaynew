import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, ScrollView, Dimensions, Modal, FlatList, PanResponder } from 'react-native';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MainScreen({ navigation, route }) {
  const { sprite1Actions = [], sprite2Actions = [] } = route.params || {};
  const canvasWidth = screenWidth * 0.95;
  const canvasHeight = screenHeight * 0.6;
  const spriteSize = 50;

  const [sprites, setSprites] = useState([]);
  const [spritePositions, setSpritePositions] = useState({});
  const [selectedSprite, setSelectedSprite] = useState(null);
  const [spriteSelectionVisible, setSpriteSelectionVisible] = useState(false);

  const availableSprites = [
    { id: 'cat', name: 'Cat', image: require('../../assets/scratch_cat1.png') },
    { id: 'dragon', name: 'Dragon', image: require('../../assets/scratch_dragon1.png') },
    { id: 'beetle', name: 'Beetle', image: require('../../assets/scratch_beetle1.png') },
    { id: 'crab', name: 'Crab', image: require('../../assets/scratch_crab1.png') },
    { id: 'dog', name: 'Dog', image: require('../../assets/scratch_dog1.png') },
  ];

  useEffect(() => {
    if (route.params?.spriteActions) {
      const spriteActions = route.params.spriteActions;
  
      // Update sprite actions dynamically for all sprites
      setSprites((prevSprites) =>
        prevSprites.map((sprite, index) => {
          const spriteKey = `sprite${index + 1}`;
          if (spriteActions[spriteKey]) {
            return { ...sprite, actions: spriteActions[spriteKey] };
          }
          return sprite;
        })
      );
    }
  }, [route.params?.spriteActions]);

  const handleAddSprite = (sprite) => {
    if (sprites.length < 5) { // Increase limit to 5 sprites
      const newId = Date.now();

      const spriteActions = sprite.name === 'Cat' ? sprite1Actions : sprite.name === 'Dragon' ? sprite2Actions : [];

      const newSprite = {
        id: newId,
        name: sprite.name,
        image: sprite.image,
        position: new Animated.ValueXY({ x: 0, y: 0 }),
        rotation: new Animated.Value(0),
        actions: spriteActions,
      };

      console.log("Adding sprite with actions:", newSprite.actions);

      setSprites([...sprites, newSprite]);
      setSpritePositions((prevPositions) => ({
        ...prevPositions,
        [newSprite.id]: { x: 0, y: 0 },
      }));
      setSelectedSprite(newSprite);
      setSpriteSelectionVisible(false);
    }
  };

  const isColliding = () => {
    if (sprites.length > 1) {
      for (let i = 0; i < sprites.length; i++) {
        for (let j = i + 1; j < sprites.length; j++) {
          const sprite1 = sprites[i];
          const sprite2 = sprites[j];
          const sprite1Pos = spritePositions[sprite1.id] || { x: 0, y: 0 };
          const sprite2Pos = spritePositions[sprite2.id] || { x: 0, y: 0 };

          const distance = Math.sqrt(
            Math.pow(sprite1Pos.x - sprite2Pos.x, 2) + Math.pow(sprite1Pos.y - sprite2Pos.y, 2)
          );

          if (distance < spriteSize) {
            console.log("Collision detected!");
            return true;
          }
        }
      }
    }
    return false;
  };

  const swapAnimations = () => {
    if (isColliding()) {
      console.log("Swapping animations due to collision...");

      const tempSprites = [...sprites];
      for (let i = 0; i < tempSprites.length - 1; i++) {
        const tempActions = tempSprites[i].actions;
        tempSprites[i].actions = tempSprites[i + 1].actions;
        tempSprites[i + 1].actions = tempActions;
      }

      setSprites(tempSprites);
    }
  };

  const panResponder = (sprite) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        sprite.position.setOffset({
          x: sprite.position.x._value,
          y: sprite.position.y._value,
        });
        sprite.position.setValue({ x: 0, y: 0 });
        setSelectedSprite(sprite);
      },
      onPanResponderMove: (event, gestureState) => {
        const newX = Math.min(canvasWidth / 2 - spriteSize, Math.max(-canvasWidth / 2 + spriteSize, gestureState.dx));
        const newY = Math.min(canvasHeight / 2 - spriteSize, Math.max(-canvasHeight / 2 + spriteSize, gestureState.dy));

        sprite.position.setValue({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {
        sprite.position.flattenOffset();
        setSpritePositions((prevPositions) => ({
          ...prevPositions,
          [sprite.id]: { x: sprite.position.x._value, y: sprite.position.y._value },
        }));
        swapAnimations();
      },
    });

    const performActions = () => {
      sprites.forEach((sprite) => {
        const actions = sprite.actions || [];
        console.log(`Executing actions for sprite ${sprite.name}:`, actions);
    
        const animations = actions.map((action) => {
          console.log(`Running action: ${action.name}`);
          switch (action.name) {
            case "Move X by 50":
              return Animated.timing(sprite.position, {
                toValue: { x: sprite.position.x._value + 50, y: sprite.position.y._value },
                duration: 1000,
                useNativeDriver: false,
              });
            case "Move X by -50":
              return Animated.timing(sprite.position, {
                toValue: { x: sprite.position.x._value - 50, y: sprite.position.y._value },
                duration: 1000,
                useNativeDriver: false,
              });
            case "Rotate 30":
              return Animated.timing(sprite.rotation, {
                toValue: sprite.rotation._value + 30,
                duration: 1000,
                useNativeDriver: false,
              });
            case "Go to (0,0)":
              return Animated.timing(sprite.position, {
                toValue: { x: 0, y: 0 },
                duration: 1000,
                useNativeDriver: false,
              });
            case "Move X=50, Y=50":
              return Animated.timing(sprite.position, {
                toValue: { x: sprite.position.x._value + 50, y: sprite.position.y._value + 50 },
                duration: 1000,
                useNativeDriver: false,
              });
            case "Go to random position":
              const randomX = Math.floor(Math.random() * canvasWidth) - canvasWidth / 2;
              const randomY = Math.floor(Math.random() * canvasHeight) - canvasHeight / 2;
              return Animated.timing(sprite.position, {
                toValue: { x: randomX, y: randomY },
                duration: 1000,
                useNativeDriver: false,
              });
            case "Repeat":
              return Animated.loop(
                Animated.timing(sprite.position, {
                  toValue: { x: sprite.position.x._value + 50, y: sprite.position.y._value },
                  duration: 500,
                  useNativeDriver: false,
                }),
                { iterations: 3 }
              );
            default:
              return null;
          }
        });
    
        // Start the animations in sequence
        Animated.sequence(animations.filter(Boolean)).start();
      });
    };

  const handleDeleteSprite = (spriteId) => {
    setSprites(sprites.filter((sprite) => sprite.id !== spriteId));
    setSpritePositions((prevPositions) => {
      const updatedPositions = { ...prevPositions };
      delete updatedPositions[spriteId];
      return updatedPositions;
    });
    if (selectedSprite?.id === spriteId) {
      setSelectedSprite(null);
    }
  };

  const handleReset = () => {
    sprites.forEach((sprite) => {
      Animated.timing(sprite.position, {
        toValue: { x: 0, y: 0 },
        duration: 500,
        useNativeDriver: false,
      }).start();
    });
    setSpritePositions({});
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Header />

        <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleReset}>
            <Ionicons name="refresh" size={30} color="#fff" />
          </TouchableOpacity>

          {sprites.map((sprite) => (
            <Animated.View
              key={sprite.id}
              {...panResponder(sprite).panHandlers}
              style={[
                styles.sprite,
                {
                  width: spriteSize,
                  height: spriteSize,
                  transform: [{ translateX: sprite.position.x }, { translateY: sprite.position.y }],
                },
              ]}
            >
              <Image source={sprite.image} style={styles.spriteIcon} />
            </Animated.View>
          ))}
        </View>

        {selectedSprite && (
          <View style={styles.spriteDetails}>
            <Text style={styles.spriteText}>Name: {selectedSprite.name}</Text>
            <Text style={styles.spriteText}>X: {spritePositions[selectedSprite.id]?.x?.toFixed(2)}</Text>
            <Text style={styles.spriteText}>Y: {spritePositions[selectedSprite.id]?.y?.toFixed(2)}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.playButton} onPress={performActions}>
          <Ionicons name="play" size={30} color="#fff" />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
          {sprites.map((sprite) => (
            <View key={sprite.id} style={styles.spriteBox}>
              <Image source={sprite.image} style={styles.spriteIcon} />
              <TouchableOpacity
                style={styles.addActionButton}
                onPress={() => navigation.navigate('ActionPanel', { spriteCount: sprites.length })} // Navigate to ActionPanel
              >
                <Text style={styles.addActionText}>Add Action</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSprite(sprite.id)}>
                <Ionicons name="trash" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}

          {sprites.length < 5 && (
            <TouchableOpacity style={styles.addSpriteBox} onPress={() => setSpriteSelectionVisible(true)}>
              <Ionicons name="add-circle-outline" size={50} color="#007AFF" />
            </TouchableOpacity>
          )}
        </ScrollView>

        <Modal visible={spriteSelectionVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select a Sprite</Text>
              <FlatList
                data={availableSprites}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.spriteOption}
                    onPress={() => handleAddSprite(item)} // Add the selected sprite
                  >
                    <Image source={item.image} style={styles.modalSpriteImage} />
                    <Text style={styles.modalSpriteText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setSpriteSelectionVisible(false)} // Close the modal
              >
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  canvas: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 10,
    marginBottom: 10,
    position: 'relative',
  },
  sprite: {
    position: 'absolute',
  },
  spriteIcon: {
    width: 50,
    height: 50,
  },
  playButton: {
    position: 'absolute',
    bottom: 200,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spriteDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  spriteText: {
    fontSize: 16,
    marginHorizontal: 15,
  },
  deleteButton: {
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  spriteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  modalSpriteImage: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  modalSpriteText: {
    fontSize: 16,
  },
  closeModalButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  closeModalText: {
    color: '#fff',
    fontSize: 16,
  },
  addActionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  addActionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  addSpriteBox: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 10,
  },
});