import React, {useState, useEffect} from 'react';
import { View, PermissionsAndroid, StyleSheet, Alert, ToastAndroid, Dimensions, SafeAreaView, Image, TouchableWithoutFeedback   } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CamSample from './components/CamSample';
import * as eva from '@eva-design/eva';
import { openDatabase } from 'react-native-sqlite-storage';
import { ApplicationProvider, Text, Button, Divider, IconRegistry, Layout, Icon } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import Beneficiaries from './components/Beneficiaries'
import Information from './components/Information'
import ImageView from './components/ImageView'
import Header from './components/Header'
import _forEach from 'lodash/forEach'
var RNFS = require('react-native-fs');

const height = Dimensions.get('window').height; 
const width = Dimensions.get('window').width; 

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

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
  tinyLogo: {
    width: width,
    aspectRatio: 0.3,
    resizeMode: "contain"
    // height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
  icon: {
    width: width * 0.4,
    height: width * 0.4,
  },
});

function HomeScreen({ navigation }) {
  return (
    <Layout style={{ flex: 1 }}>
      {/* <Header /> */}
      <Divider />
      <Layout style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* <Button onPress={() => navigation.navigate('Camera')}>Go to Details</Button> */}
        {/* <Image
          style={styles.tinyLogo}
          source={require('./assets/images/logo.png')}
          /> */}
        
      </Layout>
      <Divider />
      <Layout style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', flexDirection: "row" }}>
      <View style={{
              borderColor: "rgba(255,255,255,0.4)",
              borderStyle: "dotted",
              borderRadius: 50,
              borderWidth: 3,
              padding: 10,
        }}>
          <Text style={{textAlignVertical:"center", textAlign: "center"}}>Reports</Text>
          <Icon
          style={styles.icon}
          fill='#8F9BB3'
          name='calendar'
        />
        </View>
        <TouchableWithoutFeedback  onPress={() => navigation.navigate('Beneficiaries')}>
          <View style={{
                borderColor: "rgba(255,255,255,0.4)",
                borderStyle: "dotted",
                borderRadius: 50,
                borderWidth: 3,
                padding: 10,
          }}>
            <Text style={{textAlignVertical:"center", textAlign: "center"}}>Take Photo</Text>
            <Icon
            style={styles.icon}
            fill='#8F9BB3'
            name='camera-outline'
          />
          </View>
        </TouchableWithoutFeedback >
        {/* <Button onPress={() => navigation.navigate('Beneficiaries') }>request permissions</Button> */}
      </Layout>
    </Layout>
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
  const [capturedImageType, setCapturedImageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [beneficiaryFormData, setBeneficiaryFormData] = useState({searchString: ""});
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);

  useEffect(() => {
    getProvinces();
    // getBeneficiaries();
    requestCameraPermission();
    return () => {
      
    };
  }, []);

  const getBeneficiaries = () => {
    // setLoading(true);
    setBeneficiaries([]);
    db.transaction((trans) => {
      let sql = "select * from potential_beneficiaries";
      let params = [];
      let iter = 0;
      _forEach(beneficiaryFormData, function(value, key) {
        if(iter == 0){
          sql = `${sql} where`;
        }else{
          sql = `${sql} and `;
        }
        if(key == "searchString"){
          
          sql = `${sql} fullname like '%${value}%'`;
        }else{
          sql = `${sql} ${key} = '${value}'`;
        }
        iter++;
      })
      sql = `${sql} order by fullname limit 20`;
      // console.log(sql);
      trans.executeSql(sql, params, (trans, results) => {
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
  const getProvinces = () => {
    setProvinces([]);
    db.transaction((trans) => {
      trans.executeSql("select distinct province_name from potential_beneficiaries order by province_name", [], (trans, results) => {
        let items = [];
        let rows = results.rows;
        for (let i = 0; i < rows.length; i++) {
          var item = rows.item(i);
          items.push(item.province_name);
        }
        setProvinces(items);
      },
      (error) => {
        console.log(error);
      });
    });
  }
  const getCities = (prov) => {
    setCities([]);
    db.transaction((trans) => {
      trans.executeSql("select distinct city_name from potential_beneficiaries where province_name = ? order by city_name", [prov], (trans, results) => {
        let items = [];
        let rows = results.rows;
        for (let i = 0; i < rows.length; i++) {
          var item = rows.item(i);
          items.push(item.city_name);
        }
        setCities(items);
      },
      (error) => {
        console.log(error);
      });
    });
  }
  const getBarangays = (prov, cit) => {
    setBarangays([]);
    db.transaction((trans) => {
      trans.executeSql("select distinct barangay_name from potential_beneficiaries where province_name = ? and city_name = ? order by barangay_name", [prov, cit], (trans, results) => {
        let items = [];
        let rows = results.rows;
        for (let i = 0; i < rows.length; i++) {
          var item = rows.item(i);
          items.push(item.barangay_name);
        }
        setBarangays(items);
      },
      (error) => {
        console.log(error);
      });
    });
  }
  const insertImage = (field, imgPath) => {
    db.transaction((trans) => {
      trans.executeSql(`UPDATE potential_beneficiaries set ${field} = ? where hhid = ?`, [imgPath, beneficiary.hhid], (trans, results) => {
        
      },
      (error) => {
        
      });
    });
  }
  const selectBeneficiary = (data) => {
    setBeneficiary(data);
  }
  const pictureTaken = (data, type) => {
    setCapturedImageType(type);
    setCapturedImage(`${data}`);
  }

  const currentDate = () => {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let dt = date.getDate();
    
    if (dt < 10) {
      dt = '0' + dt;
    }
    if (month < 10) {
      month = '0' + month;
    }
    let dir = `${year}-${month}-${dt}`
    return dir;
  }
  const savePicture = () => {
    let dir = currentDate();
    let filename = `${beneficiary.hhid}_${capturedImageType}`
    RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}/Pictures/uct/${dir}/${beneficiary.hhid}`);
    let imagePath = `${RNFS.ExternalStorageDirectoryPath}/Pictures/uct/${dir}/${beneficiary.hhid}/${filename}.jpg`;
    RNFS.moveFile(capturedImage,imagePath).then( res => {
      ToastAndroid.show("Image saved.", ToastAndroid.SHORT)
    }).catch( err => {
      Alert.alert("Error!", err, [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { text: "YES", onPress: () => {} }
      ]);
    });
    insertImage(capturedImageType,imagePath);
    let updatedBeneficiary = { ...beneficiary, ...{ [capturedImageType]: imagePath } }
    setBeneficiary(updatedBeneficiary);
    let selectedBeneficiaryIndex = beneficiaries.findIndex(item => item.hhid === updatedBeneficiary.hhid);
    let updatedBeneficiaries = beneficiaries;
    updatedBeneficiaries[selectedBeneficiaryIndex] = updatedBeneficiary;
    setBeneficiaries(updatedBeneficiaries);
  }
  const deletePicture = (data, isViewOnly) => {
    if(!isViewOnly){
      RNFS.unlink(data);
      ToastAndroid.show("Image deleted.", ToastAndroid.SHORT)
    }
  }

  const changePicture = (img) => {
    setCapturedImage(img);
  }
  const updateAddressFilter = (filter, value) => {
    let newValue = {[filter]: value};
    switch (filter) {
      case 'province_name':
        setBeneficiaryFormData(prev => {
          delete prev.city_name;
          delete prev.barangay_name;
          return {...prev, ...newValue}
        });
        getCities(value);
        setSelectedProvince(value);
        break;
      case 'city_name':
        setBeneficiaryFormData(prev => {
          delete prev.barangay_name;
          return {...prev, ...newValue}
        });
        setSelectedCity(value);
        getBarangays(selectedProvince,value);
        break;
      case 'barangay_name':
        setBeneficiaryFormData(prev => {
          return {...prev, ...newValue}
        });
        break;
      default:
        setBeneficiaryFormData(prev => {
          return {...prev, ...newValue}
        });
        break;
    }
  }
  // https://medium.com/infinitbility/react-native-sqlite-storage-422503634dd2
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider {...eva} theme={eva.dark}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" options={{headerShown: false}}>
              {props => <HomeScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name="Camera" options={{headerShown: false}}>
              {props => <CamSample {...props} pictureTaken={pictureTaken} beneficiary={beneficiary} />}
            </Stack.Screen>
            <Stack.Screen name="Beneficiary Information">
              {props => <Information {...props} changePicture={changePicture} beneficiary={beneficiary} />}
            </Stack.Screen>
            <Stack.Screen name="Beneficiaries">
              {props => <Beneficiaries
                {...props}
                beneficiaries={beneficiaries}
                addresses={{provinces, cities, barangays}}
                selectBeneficiary={selectBeneficiary}
                updateAddressFilter={updateAddressFilter}
                beneficiaryFormData={beneficiaryFormData}
                getBeneficiaries={getBeneficiaries}
                />}
            </Stack.Screen>
            <Stack.Screen name="Image Preview" initialParams={{ isViewOnly: true }} options={{headerShown: false}}>
              {props => <ImageView {...props} capturedImage={capturedImage} beneficiary={beneficiary} savePicture={savePicture} deletePicture={deletePicture} />}
            </Stack.Screen>
          </Stack.Navigator>
          {/* <View style={{position:"absolute"}}>
            <ActivityIndicator size="large" color="#0000ff" animating={loading} />
          </View> */}
        </NavigationContainer>
    </ApplicationProvider>
    </SafeAreaView>
  );
}

export default App;