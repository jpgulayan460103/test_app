import React, {useState, useEffect} from 'react';
import { View, PermissionsAndroid, StyleSheet, Alert, ToastAndroid, Dimensions, SafeAreaView, Image, TouchableWithoutFeedback, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CamSample from './components/CamSample';
import * as eva from '@eva-design/eva';
import { openDatabase } from 'react-native-sqlite-storage';
import { ApplicationProvider, Text, Button, Divider, IconRegistry, Layout, Icon } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import Beneficiaries from './components/Beneficiaries'
import Information from './components/Information'
import UpdateInformation from './components/UpdateInformation'
import ImageView from './components/ImageView'
import ActivationForm from './components/ActivationForm'
import Reports from './components/Reports'
import Listahanan from './components/Listahanan'
import ReportDaily from './components/ReportDaily'
import _forEach from 'lodash/forEach'
import RNFS from 'react-native-fs';
import VersionInfo from 'react-native-version-info';
import axios from 'axios';
import RNExitApp from 'react-native-exit-app';

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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
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

function HomeScreen({ navigation, validPermissions, appConfig, setActivationAppVisible }) {
  return (
    <Layout style={{ flex: 1 }}>
      <Divider />
      <Layout style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* <Button onPress={() => navigation.navigate('Camera')}>Go to Details</Button> */}
        <Image
          style={styles.tinyLogo}
          source={require('./assets/images/logo.png')}
          />
        
      </Layout>
      <Text category="h2" style={{textAlign: "center"}}>For Validation Activity</Text>
      <Divider />
      {validPermissions && appConfig.is_activated == 1 ? (
      // {validPermissions ? (
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
            <Button onPress={() => {
                RNExitApp.exitApp();
            } }>Exit Application</Button>
          </Layout>
      )}
      <Text category="h3" style={{textAlign: "right", marginTop: -30, paddingBottom: 10, paddingRight: 20}} onLongPress={() => { setActivationAppVisible(true) }}>Field Office {appConfig.region}</Text>
      <Text style={{textAlign: "right", padding: 5}}>v{VersionInfo.appVersion}</Text>
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

const client = axios.create({
  // baseURL: 'http://encoding.uct11.com/',
  baseURL: 'http://10.0.2.2:8000/',
});



function App() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [beneficiary, setBeneficiary] = useState({});
  const [capturedImage, setCapturedImage] = useState('./assets/images/no-image.png');
  const [capturedImageType, setCapturedImageType] = useState('');
  const [beneficiaryFormData, setBeneficiaryFormData] = useState({searchString: ""});
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [validPermissions, setValidPermissions] = useState(false);
  const [reportDates, setReportDates] = useState([]);
  const [appConfig, setAppConfig] = useState({});
  const [user, setUser] = useState({});
  const [activationAppVisible, setActivationAppVisible] = useState(false);
  const [typeOptions, setTypeOptions] = useState([]);
  const [appMainVersion, setAppMainVersion] = useState(false);
  

  useEffect(() => {
    getProvinces();
    getTypes();
    dbUptader();
    requestPermissions().then(res => {
      setValidPermissions(res);
      if(!res){
        ToastAndroid.show("Insufficient Permissions", ToastAndroid.SHORT)
      }
    });
    let appVersionSplit = VersionInfo.appVersion.split('.');
    let mainVersion = appVersionSplit[0];
    setAppMainVersion(mainVersion)
    return () => {
      
    };
  }, []);

  const appActivation = (configs) => {
    // console.log(configs);
    let appVersionSplit = VersionInfo.appVersion.split('.');
    let mainVersion = appVersionSplit[0];
    // console.log(mainVersion);
    if(configs.is_activated == 0 && mainVersion != 2){
      setActivationAppVisible(true);
    }
  }

  const date_diff_indays = function(date1, date2) {
    dt1 = new Date(date1);
    dt2 = new Date(date2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
  }
  const dbUptader = () => {
    db.transaction((trans) => {
      trans.executeSql("select * from app_configs limit 1", [], (trans, results) => {
        let items = [];
        let rows = results.rows;
        for (let i = 0; i < rows.length; i++) {
          var item = rows.item(i);
          items.push(item);
        }
        if(VersionInfo.appVersion != item.version){
          let dbVersion = item.version == null ? -1 : item.version;
          dbVersionUpdate(dbVersion, VersionInfo.appVersion);
        }
        let date1 = new Date();
        let datediffs = date_diff_indays(date1, item.expiration_date);
        if(datediffs < 0){
          item.is_activated = 0;
        }
        setAppConfig(item);
        appActivation(item)
      },
      (error) => {
        console.log(error);
      });
    });
  }

  const dbVersionUpdate = async (dbVersion, appVersion) => {
    let appVersionSplit = appVersion.split('.');
    let latestVersion = appVersionSplit[1];
    console.log(`dbversion: ${dbVersion}`);
    console.log(`appversion: ${latestVersion}`);
    while (dbVersion <= latestVersion) {
      switch (dbVersion) {
        case 0:
          console.log(`update to ver ${0}`);
          await db.transaction((trans) => {
            trans.executeSql("update app_configs set version = ?", [0], (trans, results) => {},
            (error) => {
              console.log(error);
            });
          });
          break;
        case 1:
          console.log(`update to ver ${1}`);
          await db.transaction((trans) => {
            trans.executeSql("update app_configs set version = ?", [1], (trans, results) => {}, (error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN updated_purok text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN has_updated text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN status text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN status_reason text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN rel_hh text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN validated_firstname text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN validated_middlename text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN validated_lastname text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN validated_extname text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN validated_birthday text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN validated_sex text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE app_configs ADD COLUMN expiration_date text", [], (trans, results) => {},(error) => console.log(error));
          });
          break;
        case 2:
          console.log(`update to ver ${2}`);
          await db.transaction((trans) => {
            trans.executeSql("update app_configs set version = ?", [2], (trans, results) => {}, (error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN image_valid_id_back text", [], (trans, results) => {},(error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN image_valid_id_back_status text", [], (trans, results) => {},(error) => console.log(error));
          });
          await db.transaction((trans) => {
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN type text", [], (trans, results) => {},(error) => console.log(error));
          });
          break;
        case 3:
          console.log(`update to ver ${3}`);
          await db.transaction((trans) => {
            trans.executeSql("update app_configs set version = ?", [3], (trans, results) => {}, (error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN contact_number text", [], (trans, results) => {},(error) => console.log(error));
          });
          break;
        case 4:
          console.log(`update to ver ${4}`);
          await db.transaction((trans) => {
            trans.executeSql("update app_configs set version = ?", [4], (trans, results) => {}, (error) => console.log(error));
            trans.executeSql("ALTER TABLE potential_beneficiaries ADD COLUMN mothers_name text", [], (trans, results) => {},(error) => console.log(error));
          });
          break;
      
        default:
          break;
      }
      dbVersion++;
    }
  }

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
          value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          let keywords = value.split(" ");
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
      sql += ` and region = '${appConfig.region}' order by fullname limit 30`;
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
  const getTypes = () => {
    setTypeOptions([]);
    db.transaction((trans) => {
      trans.executeSql("select distinct type from potential_beneficiaries order by type", [], (trans, results) => {
        let items = [];
        let rows = results.rows;
        for (let i = 0; i < rows.length; i++) {
          var item = rows.item(i);
          items.push(item.type);
        }
        // console.log(items);
        setTypeOptions(items);
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
      trans.executeSql(`UPDATE potential_beneficiaries set ${field} = ?, images_path = ? where hhid = ?`, [imgPath, dir, beneficiary.hhid], () => {
        
      },
      () => {
        
      });
    });
  }

  const deleteImage = (field) => {
    console.log(`UPDATE potential_beneficiaries set ${field} = null where hhid = ?`);
    db.transaction((trans) => {
      trans.executeSql(`UPDATE potential_beneficiaries set ${field} = null where hhid = ?`, [beneficiary.hhid], () => {
        
      },
      (err) => {
        console.log(err);
      });
    });
  }
  
  const getReportDates = () => {
    setReportDates([]);
    db.transaction((trans) => {
      let sql = "";
      sql += `(count(image_photo) + count(image_valid_id) + count(image_valid_id_back) + count(image_house) + count(image_birth) + count(image_others)) as total_images, `;
      sql += `(count(image_photo_status) + count(image_valid_id_status) + count(image_valid_id_back_status) + count(image_house_status) + count(image_birth_status) + count(image_others_status)) as total_uploaded, `;
      sql += `count(has_updated) as count_updated, `;
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
    let imageTypeFileName = "";
    switch (capturedImageType) {
      case 'image_photo':
        imageTypeFileName = "Bene";
        break;
      case 'image_valid_id':
        imageTypeFileName = "ID";
        break;
      case 'image_valid_id_back':
        imageTypeFileName = "ID_back";
        break;
      case 'image_house':
        imageTypeFileName = "house";
        break;
      case 'image_birth':
        imageTypeFileName = "BirthCert";
        break;
      case 'image_others':
        imageTypeFileName = "Others";
        break;
      default:
        break;
    }
    let datenow = currentDate();
    let filename = `${beneficiary.hhid}_${imageTypeFileName}.jpg`
    let dir;
    let validatedDate;
    if(beneficiary.validated_date){
      validatedDate = beneficiary.validated_date;
      dir = `${RNFS.ExternalStorageDirectoryPath}/UCT/Images/${beneficiary.validated_date}/${beneficiary.hhid}`;
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
    updateBeneficiaries(updatedBeneficiary);
  }

  const updateBeneficiaries = (updatedBeneficiary) => {
    setBeneficiary(updatedBeneficiary);
    let selectedBeneficiaryIndex = beneficiaries.findIndex(item => item.hhid === updatedBeneficiary.hhid);
    let updatedBeneficiaries = beneficiaries;
    updatedBeneficiaries[selectedBeneficiaryIndex] = updatedBeneficiary;
    setBeneficiaries(updatedBeneficiaries);
  }

  const removeValidationData = () => {

  }

  const deletePicture = async (data, isViewOnly, capturedImageType = null) => {
    if(!isViewOnly){
      let fileExists = await RNFS.exists(data);
      if(fileExists){
        RNFS.unlink(data);
        ToastAndroid.show("Image deleted.", ToastAndroid.SHORT)
      }
    }else{
      let fileExists = await RNFS.exists(data);
      if(fileExists){
        RNFS.unlink(data);
        ToastAndroid.show("Image deleted.", ToastAndroid.SHORT)
      }
      let updatedBeneficiary = { ...beneficiary, ...{ [capturedImageType]: null } }
      setBeneficiary(updatedBeneficiary);
      updateBeneficiaries(updatedBeneficiary);
      deleteImage(capturedImageType);
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
        setBarangays([]);
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
      case 'type':
        setBeneficiaryFormData(prev => {
          return {...prev, ...newValue}
        });
        setSelectedType(value);
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
            {
              appMainVersion == 2 ? 
              <Stack.Screen name="Home" options={{headerShown: false}} >
                {props => <Listahanan client={client}  />}
              </Stack.Screen>
              :
              <Stack.Screen name="Home" options={{headerShown: false}} >
                {props => <HomeScreen {...props} validPermissions={validPermissions} appConfig={appConfig} setActivationAppVisible={setActivationAppVisible} />}
              </Stack.Screen>
            }
            <Stack.Screen name="Camera" options={{headerShown: false}}>
              {props => <CamSample {...props} setBeneficiary={setBeneficiary} />}
            </Stack.Screen>
            <Stack.Screen name="Beneficiary Information">
              {props => <Information {...props} changePicture={changePicture} setBeneficiary={setBeneficiary} beneficiary={beneficiary} appConfig={appConfig} updateBeneficiaries={updateBeneficiaries} db={db} />}
            </Stack.Screen>
            <Stack.Screen name="Validate Information">
              {props => <UpdateInformation {...props} db={db} currentDate={currentDate} beneficiary={beneficiary} updateBeneficiaries={updateBeneficiaries} appConfig={appConfig} />}
            </Stack.Screen>
            <Stack.Screen name="Potential Beneficiaries" options={{headerShown: false}}>
              {props => <Beneficiaries
                {...props}
                beneficiaries={beneficiaries}
                addresses={{provinces, cities, barangays}}
                selectedAddresses={{selectedProvince, selectedCity, selectedBarangay, selectedType}}
                selectBeneficiary={selectBeneficiary}
                updateAddressFilter={updateAddressFilter}
                beneficiaryFormData={beneficiaryFormData}
                getBeneficiaries={getBeneficiaries}
                setBeneficiary={setBeneficiary}
                getCities={getCities}
                getBarangays={getBarangays}
                appConfig={appConfig}
                typeOptions={typeOptions}
                />}
            </Stack.Screen>
            <Stack.Screen name="Image Preview" initialParams={{ isViewOnly: true }} options={{headerShown: false}}>
              {props => <ImageView {...props} pictureTaken={pictureTaken} savePicture={savePicture} deletePicture={deletePicture} />}
            </Stack.Screen>
            <Stack.Screen name="Reports">
              {props => <Reports {...props} reportDates={reportDates} getReportDates={getReportDates} />}
            </Stack.Screen>
            <Stack.Screen name="Daily Report"  options={{headerShown: false}}>
              {props => <ReportDaily {...props} db={db} client={client} setUser={setUser} user={user} db={db} appConfig={appConfig} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
        <Modal
            animationType="slide"
            transparent={true}
            visible={activationAppVisible}
            onRequestClose={() => {

            }}
        >
            <View style={styles.centeredView}>
                <ActivationForm setActivationAppVisible={setActivationAppVisible} db={db} />
            </View>
        </Modal>
    </ApplicationProvider>
    </SafeAreaView>
  );
}

export default App;

// gradlew assembleRelease