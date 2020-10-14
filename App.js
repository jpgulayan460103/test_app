import React, {useState, useEffect, PermissionsAndroid} from 'react';
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CamSample from './components/CamSample';
function DetailsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
    </View>
  );
}

function HomeScreen({ navigation, extraData }) {
  const [varTest, setVarTest] = useState("adasdasdas123123d");
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
        />
        <Text>{varTest}</Text>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;