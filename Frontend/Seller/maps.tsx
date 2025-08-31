// import Geolocation from '@react-native-community/geolocation';
// import React from 'react';
// import { Text, View } from 'react-native';
// import Geocoder from 'react-native-geocoding'; // Add this library for reverse geocoding
// import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

// interface Location {
//   latitude: number;
//   longitude: number;
// }
// Geocoder.init('AIzaSyCxMFAnW9XaOiB_xRoULmvJMzGjCQ0x3fg'); // Replace with your API key

// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFillObject,
//     height: '100%',
//     width: '100%',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   autoCompleteContainer: {
//     position: 'absolute',
//     top: 50,
//     left: 10,
//     right: 10,
//     zIndex: 100,
//     backgroundColor: 'white',
//     borderRadius: 8,
//     elevation: 5, // For Android shadow
//     shadowColor: '#000', // For iOS shadow
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
// });

// export default function maps() {
//   const [selectedLocation, setSelectedLocation] = useState<Location | null>(
//     null,
//   );

//   const [region, setRegion] = useState<Region>({
//     latitude: 37.78825,
//     longitude: -122.4324,
//     latitudeDelta: 0.015,
//     longitudeDelta: 0.0121,
//   });

//   const requestLocationPermission = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           {
//             title: 'Location Permission',
//             message: 'This app needs access to your location.',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           getCurrentLocation();
//         } else {
//           console.log('Location permission denied');
//         }
//       } catch (err) {
//         console.warn(err);
//       }
//     } else {
//       getCurrentLocation();
//     }
//   };

//   useEffect(() => {
//     requestLocationPermission();
//   }, []);

//   const getCurrentLocation = () => {
//     Geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setRegion({
//           latitude,
//           longitude,
//           latitudeDelta: 0.015,
//           longitudeDelta: 0.0121,
//         });
//       },
//       (error) => {
//         console.log(error.code, error.message);
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
//     );
//   };

//   const handleSelectLocation = () => {
//     if (!selectedLocation) {
//       toast.error('Please select a location on the map.');
//       return;
//     }
//     toggleModal();
//     console.log('Selected Location:', selectedLocation);
//   };

//   const handleMapPress = async (e: any) => {
//     const { latitude, longitude } = e.nativeEvent.coordinate;

//     // Update the selected location and region
//     setSelectedLocation({ latitude, longitude });
//     setRegion({
//       latitude,
//       longitude,
//       latitudeDelta: 0.015,
//       longitudeDelta: 0.0121,
//     });

//     // Reverse geocode the coordinates to get the address
//     try {
//       const response = await Geocoder.from(latitude, longitude);
//       const address = response.results[0]?.formatted_address;

//       if (address && googlePlacesRef.current) {
//         // Update the GooglePlacesAutocomplete input field
//         // @ts-ignore
//         googlePlacesRef.current.setAddressText(address);
//       }
//     } catch (error) {
//       console.error('Error reverse geocoding:', error);
//     }
//   };

//   return (
//     <View>
//       <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
//         <View style={{ flex: 1 }}>
//           {/* Google Places Autocomplete */}
//           <View style={styles.autoCompleteContainer}>
//             <GooglePlacesAutocomplete
//               ref={googlePlacesRef} // Attach the ref here
//               placeholder="Search for location"
//               fetchDetails={true}
//               query={{
//                 key: 'AIzaSyCxMFAnW9XaOiB_xRoULmvJMzGjCQ0x3fg', // Replace with your API key
//                 language: 'en',
//               }}
//               onPress={(data, details = null) => {
//                 if (details?.geometry?.location) {
//                   const { lat, lng } = details.geometry.location;
//                   setSelectedLocation({ latitude: lat, longitude: lng });
//                   setRegion({
//                     latitude: lat,
//                     longitude: lng,
//                     latitudeDelta: 0.015,
//                     longitudeDelta: 0.0121,
//                   });
//                 }
//               }}
//               styles={{
//                 textInputContainer: {
//                   backgroundColor: 'white',
//                   borderTopWidth: 0,
//                   borderBottomWidth: 0,
//                 },
//                 textInput: {
//                   height: 40,
//                   color: '#5d5d5d',
//                   fontSize: 16,
//                 },
//                 predefinedPlacesDescription: {
//                   color: '#1faadb',
//                 },
//               }}
//             />
//           </View>

//           {/* MapView */}
//           <MapView
//             provider={PROVIDER_GOOGLE}
//             style={styles.map}
//             region={region}
//             // onRegionChange={setRegion}
//             onPress={handleMapPress} // Handle map press events
//           >
//             {selectedLocation && (
//               <Marker
//                 coordinate={{
//                   latitude: selectedLocation.latitude,
//                   longitude: selectedLocation.longitude,
//                 }}
//               />
//             )}
//           </MapView>

//           {/* Confirm Button */}
//           <RNBounceable
//             onPress={() => {
//               if (selectedLocation) {
//                 setValue('location', {
//                   xAxis: selectedLocation.latitude.toString(),
//                   yAxis: selectedLocation.longitude.toString(),
//                 });
//                 handleSelectLocation();
//               } else {
//                 toast.error('Please select a location.');
//               }
//             }}
//             style={[
//               borders.rounded_16,
//               {
//                 backgroundColor: 'blue',
//                 padding: 10,
//                 bottom: 50,
//                 position: 'absolute',
//                 alignSelf: 'center',
//                 width: 100,
//                 alignItems: 'center',
//               },
//             ]}
//           >
//             <Text style={{ color: 'white' }}>OK</Text>
//           </RNBounceable>
//         </View>
//       </Modal>
//     </View>
//   );
// }
