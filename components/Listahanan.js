import React, {useEffect, useState} from 'react';
import { StyleSheet, ToastAndroid, View, Dimensions, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Layout, Text, List, Button, Divider, Select, SelectItem, Input, Icon } from '@ui-kitten/components';
import _debounce  from 'lodash/debounce'
import _cloneDeep  from 'lodash/cloneDeep'
import _isEmpty  from 'lodash/isEmpty'
import _forEach  from 'lodash/forEach'
import Login from './Login'
import ClearCache from 'react-native-clear-cache';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    },
    openButton: {
      backgroundColor: "#F194FF",
      borderRadius: 20,
      padding: 10,
      elevation: 2
    },
    textStyle: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center"
    },
    activityIndicator: {
        position: "absolute",
        right: 10,
        top: 10
     }
});


const Listahanan = ({navigation, client, setUser, user, route}) => {
    const { search } = route.params;
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [visible, setVisible] = useState(true);
    const [showErrors, setShowErrors] = useState(false);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState({});
    const [uploadingProgess, setUploadingProgess] = useState("");
    const [userLoginError, setUserLoginError] = useState({
        error: "",
    });
    const [loginString, setLoginString] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [uploadFeedback, setUploadFeedback] = useState([]);
    const [loadingPercentage, setLoadingPercentage] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [provinceValue, setProvinceValue] = useState(null);
    const [cityValue, setCityValue] = useState(null);
    const [barangayValue, setBarangayValue] = useState(null);
    const [searchString, setSearchString] = useState("");

    useEffect(() => {
        console.log(route.params);
        setSearchString(search)
        ClearCache.clearAppCache(data => {
            console.log(data);
        });
        if(!_isEmpty(user)){
            setVisible(false);
        }
        return () => {
            
        };
    }, []);

    const getProvinces = async () => {
        setLoading(true);
        let result = await client.get('/api/uct/provinces');
        setProvinces(result.data.provinces);
        setLoading(false);
    }
    const getCities = async (province) => {
        setLoading(true);
        let options = {province};
        let result = await client.get('/api/uct/cities',{params: options});
        setCities(result.data.provinces);
        setLoading(false);
    }
    const getBarangays = async (province, city) => {
        setLoading(true);
        let options = {province, city};
        let result = await client.get('/api/uct/barangays',{params: options});
        setBarangays(result.data.provinces);
        console.log(result.data.provinces);
        setLoading(false);
    }

    const renderIcon = (props) => (
        <TouchableOpacity disabled={loading} onPress={() => {
            // setHasSearched(true);
            getBeneficiaries();
        }}>
          <Icon {...props} name="search"/>
        </TouchableOpacity>
      );
    const getBeneficiaries = async () => {
        setLoading(true);
        setBeneficiaries([]);
        let options = {
            searchString,
            city: cityValue,
            province: provinceValue,
            barangay: barangayValue,
            nameOrder: "",
            uctTypes: [2],
            page: 1,
            isMobile: true,
            token: user.token,
            payrollyears: 2018
        }
        // console.log(options);
        let config = {
            headers: {'Content-Type': 'application/json','X-Requested-With': 'XMLHttpRequest'}
        };
        client.get('/api/v1/beneficiary',{params: options}, config)
        .then(res => {
            console.log(res.data);
            let result = res.data.beneficiaries.data;
            result.map(item => {
                let payroll_data = item.payrolls.data.filter(bene => bene.payroll_year == 2018);
                item.last_name = payroll_data[0].last_name;
                item.first_name = payroll_data[0].first_name;
                item.middle_name = payroll_data[0].middle_name;
                item.ext_name = payroll_data[0].ext_name;
                return item;
            });
            setBeneficiaries(result)
            setLoading(false);
        })
        .catch(err => {
            setLoading(false);
            if(err.response && err.response.status == "401"){
                ToastAndroid.show("Session Expired.", ToastAndroid.SHORT);
                setUser({});
                setVisible(true);
            }
        })
        .then(res => {
            setLoading(false);
        });
    }

    const userLogin = async (data) => {
        try {
            console.log(client.defaults.baseURL);
            setLoginLoading(true);
            let userLogin = await client.post('/api/login', data);
            // console.log(userLogin);
            setUser(userLogin.data);
            setLoginLoading(false);
            setUserLoginError({
                error: "",
            });
            ToastAndroid.show("Login Successful.", ToastAndroid.SHORT);
            getProvinces();
            setVisible(false);
        } catch (error) {
            console.log(error);
            setLoginString(JSON.stringify(error));
            setUserLoginError(error.response.data);
            setLoginLoading(false);
            ToastAndroid.show("Login Failed.", ToastAndroid.SHORT)
        }
    }

    const renderItem = ({ item, index }) => (
        <View style={
            {
                width:"100%",
                backgroundColor: "#222b44",
                padding: 5,
                paddingLeft: 0,
                borderColor: "black",
                borderBottomWidth: 1,
                flexDirection: "row"
            }
        }>
            <View style={{ width: (width - 140), paddingRight: 4}}>
                <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                    {`${item.last_name ? item.last_name : ""}, ${item.first_name ? item.first_name : ""} ${item.middle_name ? item.middle_name : ""} ${item.ext_name ? item.ext_name : ""}`}
                </Text>
                <Text category='c1'>{`${item.uct_id}`}</Text>
                <Text category='c1'>{`${item.brgy_name}, ${item.city_name}\n${item.province_name}`}</Text>
            </View>
            <View style={{ width: 120, justifyContent: 'center', alignItems: 'center'}}>
                { item.information && item.information.has_gis ? 
                <Button
                    size='tiny'
                    onPress={() => {
                        navigation.navigate("Listahanan Information", {beneficiary: item});
                        // setBeneficiary(item);
                    }
                }>View Information</Button> : 
                <Button
                        size='tiny'
                        status="danger"
                        onPress={() => {
                            navigation.navigate("Listahanan Information", {beneficiary: item});
                            // setBeneficiary(item);
                        }
                    }>Unencoded</Button> }
            </View>
        </View>
    );

    return (
        <Layout style={{flex: 1, padding: 10}}>

            <ActivityIndicator size="large" color="#00ff00" animating={loading} textContent={'Loading...'}  style = {styles.activityIndicator} />
            <Text>Username: {!_isEmpty(user) ? user.user.username : ""}</Text>
            <Text>Fullname: {!_isEmpty(user) ? user.user.full_name : ""}</Text>

            <Select
                label='Province'
                placeholder="Select Province"
                onSelect={(item) => {
                    setProvinceValue(provinces[item.row].province_name);
                    setCityValue(null);
                    setBarangayValue(null);
                    getCities(provinces[item.row].province_name);
                    // updateAddressFilter('province_name', provinces[item.row]);
                }}
                value={provinceValue}>
                {
                    provinces.map((item, index) => {
                        return (<SelectItem title={item.province_name} key={`prov_${index}`}/>)
                    })
                }
            </Select>

            <Select
                label='City/Municipality'
                placeholder="Select City/Municipality"
                onSelect={(item) => {
                    setCityValue(cities[item.row].city_name);
                    setBarangayValue(null);
                    getBarangays(provinceValue, cities[item.row].city_name);
                }}
                value={cityValue}>
                {
                    cities.map((item, index) => {
                        return (<SelectItem title={item.city_name} key={`city_${index}`}/>)
                    })
                }
            </Select>

            <Select
                label='Barangay'
                placeholder="Select Barangay"
                onSelect={(item) => {
                    setBarangayValue(barangays[item.row].brgy_name);
                }}
                value={barangayValue}>
                {
                    barangays.map((item, index) => {
                        return (<SelectItem title={item.brgy_name} key={`brgy_${index}`}/>)
                    })
                }
            </Select>

            <Input
                value={searchString}
                label='Search'
                placeholder='Enter Name'
                accessoryRight={renderIcon}
                onChangeText={nextValue => {
                    setSearchString(nextValue);
                }}
            />
            <Divider style={{marginTop: 20}} />
            {/* <Button onPress={() => { getBeneficiaries() }}>Get Beneficiaries</Button> */}


            <List
                data={beneficiaries}
                renderItem={renderItem}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={() => {
                    setVisible(false)
                }}
            >
                <View style={styles.centeredView}>
                    <Login setVisible={setVisible} userLogin={userLogin} userLoginError={userLoginError} loginLoading={loginLoading} loginString={loginString} />
                </View>
            </Modal>
        </Layout>
    );
}


export default Listahanan;
