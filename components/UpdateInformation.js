import React, {useEffect, useState} from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { Layout, Text, Icon, Datepicker, Button, IndexPath, Select, SelectItem, Divider, Input } from '@ui-kitten/components';

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
});

const listWidth = Dimensions.get('window').width;

const UpdateInformation = ({navigation, beneficiary, setVisible, db}) => {
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [provinceValue, setProvinceValue] = useState(null);
    const [cityValue, setCityValue] = useState(null);
    const [barangayValue, setBarangayValue] = useState(null);
    const [genders, setGenders] = useState(['1 - MALE','2 - FEMALE']);
    const [sexValue, setSexValue] = useState(null);

    useEffect(() => {
        getProvinces();
        console.log(beneficiary);
    }, []);

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

    
    const [formData, setFormData] = useState({
        updated_province_name: "",
        updated_city_name: "",
        updated_barangay_name: "",
        updated_lastname: "",
        updated_firstname: "",
        updated_middlename: "",
        updated_extname: "",
        updated_birthday: "",
        updated_sex: "",
      });
    return (
        <View>
            <Input
                label="Last Name"
                placeholder="Enter Last Name"
                value={formData.updated_lastname}
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_lastname: val};
                        return {...prev, ...data};
                    });
                }}
            />

            <Input
                label="First Name"
                placeholder="Enter First Name"
                value={formData.updated_firstname}
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_firstname: val};
                        return {...prev, ...data};
                    });
                }}
            />

            <Input
                label="Middle Name"
                placeholder="Enter Middle Name"
                value={formData.updated_middlename}
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_middlename: val};
                        return {...prev, ...data};
                    });
                }}
            />

            <Input
                label="Ext Name"
                placeholder="Enter Ext Name"
                value={formData.updated_extname}
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_extname: val};
                        return {...prev, ...data};
                    });
                }}
            />

            <Layout style={{flexDirection: "row", justifyContent: "space-evenly"}}>
                <Layout style={{width: "32%"}}>
                    <Input
                        label="Birthday"
                        placeholder="MM"
                        value={formData.updated_extname}
                        onChangeText={(val) => {
                            setFormData(prev => {
                                let data = {updated_extname: val};
                                return {...prev, ...data};
                            });
                        }}
                    />
                </Layout>
                <Layout style={{width: "32%"}}>
                    <Input
                        label=" "
                        placeholder="DD"
                        value={formData.updated_extname}
                        onChangeText={(val) => {
                            setFormData(prev => {
                                let data = {updated_extname: val};
                                return {...prev, ...data};
                            });
                        }}
                    />
                </Layout>
                <Layout style={{width: "32%"}}>
                    <Input
                        label=" "
                        placeholder="YYYY"
                        value={formData.updated_extname}
                        onChangeText={(val) => {
                            setFormData(prev => {
                                let data = {updated_extname: val};
                                return {...prev, ...data};
                            });
                        }}
                    />
                </Layout>
            </Layout>

            <Select
                label='Sex'
                placeholder="Select Sex"
                onSelect={(item) => {
                    setSexValue(genders[item.row]);
                    setFormData(prev => {
                        let data = {updated_sex: genders[item.row]};
                        return {...prev, ...data};
                    });
                }}
                value={sexValue}>
                {
                    genders.map((item, index) => {
                        return (<SelectItem title={item} key={`sex_${index}`}/>)
                    })
                }
            </Select>
            <Select
                label='Province'
                placeholder="Select Province"
                onSelect={(item) => {
                    setProvinceValue(provinces[item.row]);
                    setCityValue(null);
                    setBarangayValue(null);
                    getCities(provinces[item.row]);
                    setProvinceValue(provinces[item.row]);
                    setFormData(prev => {
                        let data = {updated_province_name: provinces[item.row]};
                        return {...prev, ...data};
                    });
                }}
                value={provinceValue}>
                {
                    provinces.map((item, index) => {
                        return (<SelectItem title={item} key={`prov_${index}`}/>)
                    })
                }
            </Select>
            <Select
                label='City/Municipality'
                placeholder="Select City/Municipality"
                onSelect={(item) => {
                    setCityValue(cities[item.row]);
                    setBarangayValue(null);
                    getBarangays(provinceValue,cities[item.row]);
                    setCityValue(cities[item.row]);
                    setFormData(prev => {
                        let data = {updated_city_name: cities[item.row]};
                        return {...prev, ...data};
                    });
                }}
                value={cityValue}>
                {
                    cities.map((item, index) => {
                        return (<SelectItem title={item} key={`city_${index}`}/>)
                    })
                }
            </Select>

            <Select
                label='Barangay'
                placeholder="Select Barangay"
                onSelect={(item) => {
                    setBarangayValue(barangays[item.row]);
                    setFormData(prev => {
                        let data = {updated_barangay_name: barangays[item.row]};
                        return {...prev, ...data};
                    });
                }}
                value={barangayValue}>
                {
                    barangays.map((item, index) => {
                        return (<SelectItem title={item} key={`brgy_${index}`}/>)
                    })
                }
            </Select>
            <Button style={{marginTop: 10}} onPress={() => {
                console.log(formData);
                setVisible(false)
            }}>
            DISMISS
            </Button>
        </View>
    );
}


export default UpdateInformation;
