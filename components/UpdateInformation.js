import React, {useEffect, useState} from 'react';
import { StyleSheet, ToastAndroid, View, Dimensions, ScrollView } from 'react-native';
import { Layout, Text, Icon, Datepicker, Button, IndexPath, Select, SelectItem, Divider, Input } from '@ui-kitten/components';
import _debounce from 'lodash/debounce'

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
});

const listWidth = Dimensions.get('window').width;

const UpdateInformation = ({navigation, beneficiary, db, updateBeneficiaries, currentDate}) => {
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [provinceValue, setProvinceValue] = useState(null);
    const [cityValue, setCityValue] = useState(null);
    const [barangayValue, setBarangayValue] = useState(null);
    const [genders, setGenders] = useState(['1 - MALE','2 - FEMALE']);
    const [sexValue, setSexValue] = useState(null);

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

    useEffect(() => {
        getProvinces();
        setFormData(beneficiary);
    }, []);

    const validateBeneficiary = _debounce(() => {
        let updatedBeneficiary = { ...beneficiary, ...formData }
        updateBeneficiaries(updatedBeneficiary);
        updateBeneficiary(updatedBeneficiary, currentDate());
    }, 250);

    const updateBeneficiary = (updatedBeneficiary, validatedDate) => {
        let {
            updated_province_name,
            updated_city_name,
            updated_barangay_name,
            updated_lastname,
            updated_firstname,
            updated_middlename,
            updated_extname,
            updated_birthday,
            updated_sex,
            hhid,
        } = updatedBeneficiary;
        let sql = "";
        sql += `UPDATE potential_beneficiaries set`;
        sql += ` updated_province_name= ?,`;
        sql += ` updated_city_name = ?,`;
        sql += ` updated_barangay_name = ?,`;
        sql += ` updated_lastname = ?,`;
        sql += ` updated_firstname = ?,`;
        sql += ` updated_middlename = ?,`;
        sql += ` updated_extname = ?,`;
        sql += ` updated_birthday = ?,`;
        sql += ` updated_sex = ?,`;
        sql += ` validated_date = ?`;
        sql += ` where hhid = ?`;

        let params = [
            updated_province_name,
            updated_city_name,
            updated_barangay_name,
            updated_lastname,
            updated_firstname,
            updated_middlename,
            updated_extname,
            updated_birthday,
            updated_sex,
            validatedDate,
            hhid,
        ];
        db.transaction((trans) => {
            trans.executeSql(sql, params, (trans, results) => {
                ToastAndroid.show("Validated.", ToastAndroid.SHORT)
                navigation.goBack();
                // console.log("asdaskjdnkasdnjasd");
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

    
    
    return (
        <ScrollView>
        <Layout style={{flex: 1, padding: 10}}>
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
            <Button style={{marginTop: 10}} onPress={() => validateBeneficiary()}>
            VALIDATE BENEFICIARY
            </Button>
        </Layout>
        </ScrollView>
    );
}


export default UpdateInformation;
