import React, {useState, useEffect} from 'react';
import { View, Text, Button, PermissionsAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CamSample from './components/CamSample';

const requestCameraPermission = async () => {
  try {
    PermissionsAndroid.requestMultiple(
      [PermissionsAndroid.PERMISSIONS.CAMERA, 
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]
      ).then((result) => {
        if (result['android.permission.CAMERA']
        && result['android.permission.READ_EXTERNAL_STORAGE']
        && result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted') {
          console.log("You can use the camera");
        } else if (
         result['android.permission.CAMERA']
        || result['android.permission.READ_EXTERNAL_STORAGE']
        || result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'never_ask_again') {
          console.log("Camera permission denied");
        }
      });
  } catch (err) {
    console.warn(err);
  }
};

function DetailsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
    </View>
  );
}

function HomeScreen({ navigation, extraData }) {
  useEffect(() => {
    requestCameraPermission();
    return () => {
      
    };
  }, []);
  const [varTest, setVarTest] = useState("adasdasdas123123d");
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
        />
        <Text>{varTest}</Text>
        <Button title="request permissions" onPress={requestCameraPermission} />
    </View>
  );
}

const Stack = createStackNavigator();




function App() {
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home">
          {props => <HomeScreen {...props} extraData="asdasdanskd" />}
        </Stack.Screen>
        <Stack.Screen name="Details">
          {props => <CamSample {...props} />}
        </Stack.Screen>
        <Stack.Screen name="ImageView">
          {props => <DetailsScreen {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;