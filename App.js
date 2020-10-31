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
import Reports from './components/Reports'
import _forEach from 'lodash/forEach'
import RNFS from 'react-native-fs';


const width = Dimensions.get('window').width; 

const requestPermissions = async () => {
  let validPermissions = true;
  try {
    const granted = await PermissionsAndroid.requestMultiple(
      [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ]
    );
    _forEach(granted, function(value) {
      if(PermissionsAndroid.RESULTS.GRANTED != value){
        validPermissions = false;
      }
    })
  } catch (err) {
    console.warn(err);
  }
  return validPermissions;
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

function HomeScreen({ navigation, validPermissions }) {
  return (
    <Layout style={{ flex: 1 }}>
      {/* <Header /> */}
      <Divider />
      <Layout style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* <Button onPress={() => navigation.navigate('Camera')}>Go to Details</Button> */}
        <Image
          style={styles.tinyLogo}
          source={require('./assets/images/logo.png')}
          />
        
      </Layout>
      <Divider />
      {validPermissions ? (
        <Layout style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', flexDirection: "row" }}>
        <TouchableWithoutFeedback  onPress={() => {
          navigation.navigate('Reports')
        }}>
        <View style={{
                borderColor: "rgba(255,255,255,0.4)",
                borderStyle: "dotted",
                borderRadius: 40,
                borderWidth: 3,
                padding: 10,
          }}>
            <Text style={{textAlignVertical:"center", textAlign: "center"}}>Reports</Text>
            <Icon
            style={styles.icon}
            fill='#8F9BB3'
            name='calendar-outline'
          />
          </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback  onPress={() => navigation.navigate('Potential Beneficiaries')}>
            <View style={{
                  borderColor: "rgba(255,255,255,0.4)",
                  borderStyle: "dotted",
                  borderRadius: 40,
                  borderWidth: 3,
                  padding: 10,
            }}>
              <Text style={{textAlignVertical:"center", textAlign: "center"}}>Beneficiaries</Text>
              <Icon
              style={styles.icon}
              fill='#8F9BB3'
              name='people'
            />
            </View>
          </TouchableWithoutFeedback >
        </Layout>
      ) : (
        <Layout style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
            <Button onPress={() => requestPermissions() }>Exit Application</Button>
            {/* <Text>Insufficient permission.</Text> */}
          </Layout>
      )}
    </Layout>
  );
}

const Stack = createStackNavigator();
const errorCB = (err)=>  {
  console.log(err);
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
  const [] = useState(false);
  const [beneficiaryFormData, setBeneficiaryFormData] = useState({searchString: ""});
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [validPermissions, setValidPermissions] = useState(false);
  const [reportDates, setReportDates] = useState([]);

  useEffect(() => {
    getProvinces();
    // console.log(VersionInfo.appVersion);
    requestPermissions().then(res => {
      setValidPermissions(res);
      if(!res){
        ToastAndroid.show("Insufficient Permissions", ToastAndroid.SHORT)
      }
    });
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
          sql += ` where`;
        }else{
          sql += ` and `;
        }
        if(key == "searchString"){
          
          // sql += `fullname like '%${value}%'`;
          value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          let keywords = value.split(",");
          let mappedKeywords = keywords.map(item => {
            return `fullname like '%${item.trim()}%'`;
          });
          let keywordQuery = mappedKeywords.join(" and ");
          sql += ` ${keywordQuery}`;
        }else{
          sql += ` ${key} = '${value}'`;
        }
        iter++;
      })
      sql += ` order by fullname limit 30`;
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
  const insertImage = (field, imgPath, dir, validatedDate) => {
    db.transaction((trans) => {
      trans.executeSql(`UPDATE potential_beneficiaries set ${field} = ?, images_path = ?, validated_date = ? where hhid = ?`, [imgPath, dir, validatedDate, beneficiary.hhid], () => {
        
      },
      () => {
        
      });
    });
  }
  
  const getReportDates = () => {
    setReportDates([]);
    db.transaction((trans) => {
      let sql = "";
      sql += `(count(image_photo) + count(image_valid_id) + count(image_house) + count(image_birth) + count(image_others)) as total_images, `;
      sql += `(count(image_photo_status) + count(image_valid_id_status) + count(image_house_status) + count(image_birth_status) + count(image_others_status)) as total_uploaded, `;
      sql += `count(hhid) as count_hhid, `;
      trans.executeSql(`select ${sql} validated_date from potential_beneficiaries where validated_date is not null group by validated_date order by validated_date`, [], (trans, results) => {
        let items = [];
        let rows = results.rows;
        for (let i = 0; i < rows.length; i++) {
          var item = rows.item(i);
          items.push(item);
        }
        setReportDates(items);
        // console.log(items);
      },
      (error) => {
        console.log(error);
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
    let datenow = currentDate();
    let filename = `${beneficiary.hhid}_${capturedImageType}.jpg`
    let dir;
    let validatedDate;
    if(beneficiary.images_path){
      dir = beneficiary.images_path;
      validatedDate = beneficiary.validated_date;
    }else{
      dir = `${RNFS.ExternalStorageDirectoryPath}/UCT/Images/${datenow}/${beneficiary.hhid}`;
      validatedDate = datenow;
    }
    RNFS.mkdir(`${dir}`);
    let imagePath = `${dir}/${filename}`;
    RNFS.moveFile(capturedImage,imagePath).then( () => {
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
    insertImage(capturedImageType,filename, dir, validatedDate);
    let updatedBeneficiary = { ...beneficiary, ...{ [capturedImageType]: filename, images_path: dir, validated_date: validatedDate} }
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
        setSelectedBarangay(value);
        break;
      default:
        setBeneficiaryFormData(prev => {
          return {...prev, ...newValue}
        });
        break;
    }
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider {...eva} theme={eva.dark}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" options={{headerShown: false}} >
              {props => <HomeScreen {...props} validPermissions={validPermissions} />}
            </Stack.Screen>
            <Stack.Screen name="Camera" options={{headerShown: false}}>
              {props => <CamSample {...props} setBeneficiary={setBeneficiary} />}
            </Stack.Screen>
            <Stack.Screen name="Beneficiary Information">
              {props => <Information {...props} changePicture={changePicture} setBeneficiary={setBeneficiary} beneficiary={beneficiary} db={db} />}
            </Stack.Screen>
            <Stack.Screen name="Potential Beneficiaries">
              {props => <Beneficiaries
                {...props}
                beneficiaries={beneficiaries}
                addresses={{provinces, cities, barangays}}
                selectedAddresses={{selectedProvince, selectedCity, selectedBarangay}}
                selectBeneficiary={selectBeneficiary}
                updateAddressFilter={updateAddressFilter}
                beneficiaryFormData={beneficiaryFormData}
                getBeneficiaries={getBeneficiaries}
                setBeneficiary={setBeneficiary}
                />}
            </Stack.Screen>
            <Stack.Screen name="Image Preview" initialParams={{ isViewOnly: true }} options={{headerShown: false}}>
              {props => <ImageView {...props} pictureTaken={pictureTaken} savePicture={savePicture} deletePicture={deletePicture} />}
            </Stack.Screen>
            <Stack.Screen name="Reports">
              {props => <Reports
                {...props}
                reportDates={reportDates}
                addresses={{provinces, cities, barangays}}
                selectBeneficiary={selectBeneficiary}
                updateAddressFilter={updateAddressFilter}
                beneficiaryFormData={beneficiaryFormData}
                getReportDates={getReportDates}
                />}
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