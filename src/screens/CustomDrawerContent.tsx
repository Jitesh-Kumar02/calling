// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// // import { Ionicons } from '@expo/vector-icons';

// interface CustomDrawerProps {
//   navigation: any; // Replace 'any' with appropriate navigation type
// }

// const CustomDrawerContent: React.FC<CustomDrawerProps> = (props) => {
//   return (
//     <View style={styles.container}>
//       <View style={styles.appIcon}>
//         {/* <Ionicons name="logo-react" size={50} color="gold" /> */}
//       </View>
//       <View style={styles.userInfo}>
//         <Text style={styles.userName}>John Doe</Text>
//         <Text style={styles.userNumber}>+1234567890</Text>
//       </View>
//       <DrawerContentScrollView {...props}>
//         <DrawerItemList {...props} />
//       </DrawerContentScrollView>
//       <View style={styles.horizontalLine} />
//       <TouchableOpacity style={styles.logoutButton}>
//         {/* <Ionicons n§ame="log-out" size={24} color="gold" /> */}
//         <Text style={styles.logoutText}>Logout</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'purple',
//   },
//   appIcon: {
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   userInfo: {
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   userName: {
//     color: 'white',
//     fontSize: 18,
//   },
//   userNumber: {
//     color: 'white',
//     fontSize: 14,
//   },
//   horizontalLine: {
//     height: 1,
//     backgroundColor: 'white',
//     marginVertical: 10,
//   },
//   logoutButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   logoutText: {
//     color: 'white',
//     fontSize: 18,
//     marginLeft: 10,
//   },
// });

// export default CustomDrawerContent;
