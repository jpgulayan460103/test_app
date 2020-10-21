import React, {useState, useEffect} from 'react';
import { View, Text, Button, PermissionsAndroid, StyleSheet, Image  } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CamSample from './components/CamSample';
import * as eva from '@eva-design/eva';
import { openDatabase } from 'react-native-sqlite-storage';
import { ApplicationProvider, Icon, List, ListItem, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import Beneficiaries from './components/Beneficiaries'
import Information from './components/Information'
import ImageView from './components/ImageView'

const requestCameraPermission = async () => {
  try {
    PermissionsAndroid.requestMultiple(
      [PermissionsAndroid.PERMISSIONS.CAMERA, 
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]
      ).then((result) => {
        if (result['android.permission.CAMERA']
        && result['android.permission.RECORD_AUDIO']
        && result['android.permission.READ_EXTERNAL_STORAGE']
        && result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted') {
          console.log("You can use the camera");
        } else if (
         result['android.permission.CAMERA']
        || result['android.permission.RECORD_AUDIO']
        || result['android.permission.READ_EXTERNAL_STORAGE']
        || result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'never_ask_again') {
          console.log("Camera permission denied");
        }
      });
  } catch (err) {
    console.warn(err);
  }
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
});

function HomeScreen({ navigation, extraData, getData }) {
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
        onPress={() => navigation.navigate('Camera')}
        />
        <Text>{varTest}</Text>
        <Button title="request permissions" onPress={() => {
          getData();
          navigation.navigate('Beneficiaries');
          }} />
    </View>
  );
}

const Stack = createStackNavigator();
const errorCB = (err)=>  {
  console.log(err);
}

const successCB = () => {
  console.log("SQL executed fine");
}

const openCB = () => {
  console.log("Database OPENED");
}



var db = openDatabase({
  name: 'SQLite',
  location: 'default',
  createFromLocation: '~data.db',
},  openCB, errorCB);



function App() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [beneficiary, setBeneficiary] = useState({});
  const [capturedImage, setCapturedImage] = useState('./assets/images/no-image.png');
  const getData = () => {
    db.transaction((trans) => {
      trans.executeSql("select * from potential_beneficiaries limit 20", [], (trans, results) => {
        let items = [];
        let rows = results.rows;
        for (let i = 0; i < rows.length; i++) {
          var item = rows.item(i);
          items.push(item);
        }
        setBeneficiaries(items);
      },
      (error) => {
        console.log(error);
      });
    });
  }
  const insertImage = async (field, imgPath) => {
    db.transaction((trans) => {
      trans.executeSql(`UPDATE potential_beneficiaries set ${field} = ? where hhid = ?`, [imgPath, beneficiary.hhid], (trans, results) => {
        console.log("success");
      },
      (error) => {
        console.log(error);
      });
    });
  }
  const selectBeneficiary = (data) => {
    setBeneficiary(data);
    console.log(data);
  }
  const pictureTaken = (data, type) => {
    setCapturedImage(`file://${data}`);
    // insertImage('image_photo',data)
  }
  // https://medium.com/infinitbility/react-native-sqlite-storage-422503634dd2
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home">
          {props => <HomeScreen {...props} extraData="asdasdanskd"  getData={getData} />}
        </Stack.Screen>
        <Stack.Screen name="Camera" options={{headerShown: false}}>
          {props => <CamSample {...props} pictureTaken={pictureTaken} beneficiary={beneficiary} />}
        </Stack.Screen>
        <Stack.Screen name="Beneficiary Information">
          {props => <Information {...props} capturedImage={capturedImage} beneficiary={beneficiary} />}
        </Stack.Screen>
        <Stack.Screen name="Beneficiaries">
          {props => <Beneficiaries {...props} beneficiaries={beneficiaries} selectBeneficiary={selectBeneficiary} />}
        </Stack.Screen>
        <Stack.Screen name="Image Preview">
          {props => <ImageView {...props} capturedImage={capturedImage} beneficiary={beneficiary} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;