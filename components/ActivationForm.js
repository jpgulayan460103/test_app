import React, {useEffect, useState} from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Dimensions } from 'react-native';
import { Layout, Text, Icon, List, ListItem, Button, SelectItem, Select, Card, Divider, Input } from '@ui-kitten/components';
import RNExitApp from 'react-native-exit-app';
import _isEmpty from 'lodash/isEmpty'
import {Picker} from '@react-native-picker/picker';

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
});
const randomActivator = [
    {region: "CAR", code: 'XPEE3H'},
    {region: "I", code: '48YZRM'},
    {region: "II", code: 'DG617R'},
    {region: "III", code: 'SWWSB5'},
    {region: "IV-A", code: 'BAVUSN'},
    {region: "NCR", code: '5O5LMT'},
    {region: "IV-B", code: 'BJXDXK'},
    {region: "V", code: 'ZCSBMF'},
    {region: "VI", code: 'HIK5OI'},
    {region: "VII", code: 'YSPUEN'},
    {region: "VIII", code: '4R5NOY'},
    {region: "IX", code: 'L5LZFV'},
    {region: "X", code: '44IANG'},
    {region: "XI", code: 'KTQ96H'},
    {region: "XII", code: '6OS860'},
    {region: "CARAGA", code: '6OEMZK'},
    {region: "BARMM", code: 'T6BZ37'},
];
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const getDates = () => {

    var activated_date = new Date();
    var expiration_date = new Date();
    var numberOfDaysToAdd = 30;
    let dd
    let mm
    let y
    activated_date.setDate(activated_date.getDate()); 
    dd = activated_date.getDate();
    mm = activated_date.getMonth() + 1;
    y = activated_date.getFullYear();
    dd = (dd < 10 ? `0${dd}` : dd);
    mm = (mm < 10 ? `0${mm}` : mm);

    activated_date =  `${y}-${mm}-${dd}`;

    expiration_date.setDate(expiration_date.getDate() + numberOfDaysToAdd); 
    dd = expiration_date.getDate();
    mm = expiration_date.getMonth() + 1;
    y = expiration_date.getFullYear();
    dd = (dd < 10 ? `0${dd}` : dd);
    mm = (mm < 10 ? `0${mm}` : mm);
    
    expiration_date =  `${y}-${mm}-${dd}`;
    return {
        activated_date,
        expiration_date,
    };
}
const ActivationForm = ({setVisible, userLogin, setActivationAppVisible, db}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [isActivated, setIsActivated] = useState(false);
    const [region, setRegion] = useState(null);
    const [isSetUpComplete, setisSetUpComplete] = useState(false);

    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [provinceValue, setProvinceValue] = useState(null);
    const [cityValue, setCityValue] = useState(null);
    const [barangayValue, setBarangayValue] = useState(null);

    const updateAppConfigs = () => {
        let dates = getDates();
        // console.log(dates);
        db.transaction((trans) => {

            let sql = "";
            sql += `region = ?,`;
            sql += `province_name = ?,`;
            sql += `city_name = ?,`;
            sql += `barangay_name = ?,`;
            sql += `date_activated = ?,`;
            sql += `expiration_date = ?,`;
            sql += `is_activated = ?`;
            let params = [
                region,
                provinceValue,
                cityValue,
                barangayValue,
                dates.activated_date,
                dates.expiration_date,
                1
            ];
            trans.executeSql(`update app_configs set ${sql}`, params, (trans, results) => {
                setisSetUpComplete(true);
            },
            (error) => {
              console.log(error);
            });
          });
    }

    const getProvinces = (selectedRegion) => {
        setProvinces([]);
        db.transaction((trans) => {
          trans.executeSql("select distinct province_name from potential_beneficiaries where region = ? order by province_name", [selectedRegion], (trans, results) => {
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

    const toggleSecureEntry = () => {
      setSecureTextEntry(!secureTextEntry);
    };
  
    const renderIcon = (props) => (
      <TouchableWithoutFeedback onPress={toggleSecureEntry}>
        <Icon {...props} name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}/>
      </TouchableWithoutFeedback>
    );
    const renderIconUser = (props) => (
        <Icon {...props} name="person-outline"/>
    );
    return (
        <Card disabled={true} style={{width: width*0.8}}>
            {/* <Text category="h5" style={{textAlign: "center", paddingBottom: 10}}>{isActivated ? "SET UP" : "ACTIVATION"}</Text> */}
            <Text category="h5" style={{textAlign: "center", paddingBottom: 10}}>CONFIGURE APPLICATION</Text>
            {!isActivated ? (
            <View>
                <Input
                    value={password}
                    placeholder='Activation Code'
                    accessoryRight={renderIcon}
                    secureTextEntry={secureTextEntry}
                    onChangeText={nextValue => setPassword(nextValue) }
                    />
            </View>
            ) : (
                <View>
                    <Text category="c2">Province</Text>
                    <Picker
                        style={{height: 50 ,color: '#fff', placeholderTextColor: '#fff', backgroundColor: "#1c2238", marginBottom: 5}}
                        selectedValue={provinceValue}
                        onValueChange={(itemValue, itemIndex) => {
                            setProvinceValue(itemValue);
                            setCityValue(null);
                            setBarangayValue(null);
                            setBarangays([]);
                            setCities([]);
                            getCities(itemValue);
                        }}>
                            <Picker.Item label="Select Province" value=""/>
                        {
                            provinces.map((item, index) => {
                                return (<Picker.Item label={item} value={item} key={`prov_${index}`}/>)
                            })
                        }
                    </Picker>
                    <Divider />
                    <Text category="c2">City/Municipality/Subdistrict</Text>
                    <Picker
                        style={{height: 50 ,color: '#fff', placeholderTextColor: '#fff', backgroundColor: "#1c2238", marginBottom: 5}}
                        selectedValue={cityValue}
                        onValueChange={(itemValue, itemIndex) => {
                            setCityValue(itemValue);
                            setBarangayValue(null);
                            getBarangays(provinceValue,itemValue);
                        }}>
                            <Picker.Item label="Select City/Municipality/Subdistrict" value=""/>
                        {
                            cities.map((item, index) => {
                                return (<Picker.Item label={item} value={item} key={`city_${index}`}/>)
                            })
                        }
                    </Picker>
                    <Divider />
                    <Text category="c2">Province</Text>
                    <Picker
                        style={{height: 50 ,color: '#fff', placeholderTextColor: '#fff', backgroundColor: "#1c2238", marginBottom: 5}}
                        selectedValue={barangayValue}
                        onValueChange={(itemValue, itemIndex) => {
                            setBarangayValue(itemValue);
                        }}>
                            <Picker.Item label="Select Barangay" value=""/>
                        {
                            barangays.map((item, index) => {
                                return (<Picker.Item label={item} value={item} key={`city_${index}`}/>)
                            })
                        }
                    </Picker>
                    <Text>{isSetUpComplete ? "Setup Complete! \nRestart the app to complete setup." : ""}</Text>
                </View>
            )}
            <View style={{flexDirection: "row", marginTop: 20}}>
                <View style={{flex: 1}}>
                    <Button onPress={() => {
                        if(isActivated){
                            updateAppConfigs();
                        }else{
                            let regionActivated = randomActivator.filter(txt => txt.code == password);
                            if(!_isEmpty(regionActivated)){
                                regionActivated = regionActivated[0];
                                setIsActivated(true);
                                setRegion(regionActivated.region);
                                getProvinces(regionActivated.region);
                            }
                        }
                    } }>Activate</Button>
                    </View>
                <View style={{flex: 1}}>
                    <Button status="danger" onPress={() => {
                        RNExitApp.exitApp();
                        // setActivationAppVisible(false);
                    } }>Exit</Button>
                </View>
            </View>
            {/* <Text>{loginString}</Text> */}
        </Card>
    );
}


export default ActivationForm;
