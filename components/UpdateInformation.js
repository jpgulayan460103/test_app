import React, {useEffect, useState, useRef } from 'react';
import { StyleSheet, ToastAndroid, View, Dimensions, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Layout, Text, Icon, Datepicker, Button, IndexPath, Select, SelectItem, Divider, Input } from '@ui-kitten/components';
import _debounce from 'lodash/debounce'
import _forEach from 'lodash/forEach'

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
});

const listWidth = Dimensions.get('window').width;

const AlertIcon = (props) => (
    <Icon {...props} name='alert-circle-outline'/>
);

const UpdateInformation = ({navigation, beneficiary, db, updateBeneficiaries, currentDate}) => {
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [provinceValue, setProvinceValue] = useState(null);
    const [cityValue, setCityValue] = useState(null);
    const [barangayValue, setBarangayValue] = useState(null);
    const [genders, setGenders] = useState(['1 - MALE','2 - FEMALE']);
    const [sexValue, setSexValue] = useState(null);
    const [loading, setLoading] = useState(false);

    const ref_updated_lastname = useRef();
    const ref_updated_firstname = useRef();
    const ref_updated_middlename = useRef();
    const ref_updated_extname = useRef();
    const ref_updated_birthday_m = useRef();
    const ref_updated_birthday_d = useRef();
    const ref_updated_birthday_y = useRef();
    const ref_updated_sex = useRef();

    

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
        updated_birthday_m: "",
        updated_birthday_d: "",
        updated_birthday_y: "",
        remarks: "",
    });
    const [formError, setFormError] = useState({
        updated_lastname: { isValid: true, message: "" },
        updated_firstname: { isValid: true, message: "" },
        updated_middlename: { isValid: true, message: "" },
        updated_extname: { isValid: true, message: "" },
        updated_birthday_m: { isValid: true, message: "" },
        updated_birthday_d: { isValid: true, message: "" },
        updated_birthday_y: { isValid: true, message: "" },
        updated_sex: { isValid: true, message: "" },
        updated_province_name: { isValid: true, message: "" },
        updated_city_name: { isValid: true, message: "" },
        updated_barangay_name: { isValid: true, message: "" },
    });

    useEffect(() => {
        getProvinces();
        if(beneficiary.updated_province_name){
            setProvinceValue(beneficiary.updated_province_name);
        }
        if(beneficiary.updated_city_name){
            setCityValue(beneficiary.updated_city_name);
        }
        if(beneficiary.updated_barangay_name){
            setBarangayValue(beneficiary.updated_barangay_name);
        }
        if(beneficiary.updated_sex){
            setSexValue(beneficiary.updated_sex);
        }
        if(beneficiary.updated_birthday){
            let splitBirthday = beneficiary.updated_birthday.split('-');
            beneficiary.updated_birthday_y = splitBirthday[0];
            beneficiary.updated_birthday_m = splitBirthday[1];
            beneficiary.updated_birthday_d = splitBirthday[2];
        }
        setFormData(prev => {
            return {...prev, ...beneficiary};
        });
    }, []);

    const validateBeneficiary = _debounce(() => {
        setLoading(true);
        if(!validateForm()){
            let valDate = currentDate();
            if(beneficiary.validated_date){
                valDate = beneficiary.validated_date;
            }
            let newData = formData;
            newData.validated_date = valDate;
            let updatedBeneficiary = { ...beneficiary, ...formData }
            updateBeneficiaries(updatedBeneficiary);
            updateBeneficiary(updatedBeneficiary, valDate);
            setLoading(false);
        }else{
            ToastAndroid.show("Validation Failed. Review the form.", ToastAndroid.SHORT)
            setLoading(false);
        }
    }, 150);

    const validateForm = () => {
        let validateName = /^[a-zA-Z Ññ-]+$/; 
        let validateNumber = /^[0-9]+$/; 
        let hasError = false;
        let message = "";
        let formErrors = {};
        let keyError = false;
        _forEach(formData, (value, key)  => {
            switch (key) {
                case 'updated_lastname':
                case 'updated_firstname':
                    keyError = false;
                    message = "";
                    if(!validateName.test(value)){
                        hasError = true;
                        keyError = true;
                        message = "Should contain alphabets.";
                    }
                    if(value == null || (value && value.trim() == "")){
                        hasError = true;
                        keyError = true;
                        message = "Required";
                    }
                    formErrors[key] = { isValid: !keyError, message: message };
                    break;
                case 'updated_middlename':
                case 'updated_extname':
                    keyError = false;
                    message = "";
                    if(value == null || (value && value.trim() == "")){
                        formErrors[key] = { isValid: true, message: message };
                    }else{
                        if(!validateName.test(value)){
                            hasError = true;
                            keyError = true;
                            message = "Should contain alphabets.";
                        }
                        formErrors[key] = { isValid: !keyError, message: message };
                    }
                    break;
                case 'updated_birthday_m':
                case 'updated_birthday_d':
                    keyError = false;
                    message = "";
                    if(!validateNumber.test(value)){
                        hasError = true;
                        keyError = true;
                        message = "Should contain numbers.";
                    }
                    if(value == null || (value && value.trim() == "")){
                        hasError = true;
                        keyError = true;
                        message = "Required";
                    }
                    formErrors[key] = { isValid: !keyError, message: message };
                    if(formData.updated_birthday_m && formData.updated_birthday_d && formData.updated_birthday_y){
                        let updated_birthday_m = formData.updated_birthday_m < 10 ? `0${parseInt(formData.updated_birthday_m)}` : parseInt(formData.updated_birthday_m);
                        let updated_birthday_d = formData.updated_birthday_d < 10 ? `0${parseInt(formData.updated_birthday_d)}` : parseInt(formData.updated_birthday_d);
                        let updated_birthday_y = formData.updated_birthday_y;
                        let dateString = `${updated_birthday_y}-${updated_birthday_m}-${updated_birthday_d}`;
                        let parseDate = new Date(dateString);
                        if(parseDate instanceof Date && !isNaN(parseDate)){
                            
                        }else{
                            hasError = true;
                            keyError = true;
                            message = "Invalid Date";
                            formErrors.updated_birthday_m = { isValid: false, message: message };
                            formErrors.updated_birthday_d = { isValid: false, message: message };
                            formErrors.updated_birthday_y = { isValid: false, message: message };
                        }
                    }
                    break;
                case 'updated_birthday_y':
                    keyError = false;
                    message = "";
                    if(!validateNumber.test(value)){
                        hasError = true;
                        keyError = true;
                        message = "Should contain numbers.";
                    }
                    if(value == null || (value && value.trim() == "")){
                        hasError = true;
                        keyError = true;
                        message = "Required";
                    }
                    if(value && value.length != 4){
                        hasError = true;
                        keyError = true;
                        message = "Must have 4 digits";
                    }else{
                        if(value && (value >= 2003 || value < 1920)){
                            hasError = true;
                            keyError = true;
                            message = "Age Error";
                        }
                    }
                    formErrors[key] = { isValid: !keyError, message: message };
                    if(formData.updated_birthday_m && formData.updated_birthday_d && formData.updated_birthday_y){
                        let updated_birthday_m = formData.updated_birthday_m < 10 ? `0${parseInt(formData.updated_birthday_m)}` : parseInt(formData.updated_birthday_m);
                        let updated_birthday_d = formData.updated_birthday_d < 10 ? `0${parseInt(formData.updated_birthday_d)}` : parseInt(formData.updated_birthday_d);
                        let updated_birthday_y = formData.updated_birthday_y;
                        let dateString = `${updated_birthday_y}-${updated_birthday_m}-${updated_birthday_d}`;
                        let parseDate = new Date(dateString);
                        if(parseDate instanceof Date && !isNaN(parseDate)){
                            
                        }else{
                            hasError = true;
                            keyError = true;
                            message = "Invalid Date";
                            formErrors.updated_birthday_m = { isValid: false, message: message };
                            formErrors.updated_birthday_d = { isValid: false, message: message };
                            formErrors.updated_birthday_y = { isValid: false, message: message };
                        }
                    }
                    
                    break;
                case 'updated_sex':
                case 'updated_province_name':
                case 'updated_city_name':
                case 'updated_barangay_name':
                    keyError = false;
                    message = "";
                    if(value == null || (value && value.trim() == "")){
                        hasError = true;
                        keyError = true;
                        message = "Required";
                    }
                    formErrors[key] = { isValid: !keyError, message: message };
                    break;
                default:
                    break;
            }
            // console.log(`key: ${key} = ${hasError}`);
        })
        setFormError(formErrors);
        return hasError;
    }

    const updateBeneficiary = (updatedBeneficiary, validatedDate) => {
        let {
            updated_province_name,
            updated_city_name,
            updated_barangay_name,
            updated_lastname,
            updated_firstname,
            updated_middlename,
            updated_extname,
            updated_birthday_m,
            updated_birthday_d,
            updated_birthday_y,
            updated_sex,
            remarks,
            hhid,
        } = updatedBeneficiary;
        let updated_birthday = `${updated_birthday_y}-${(updated_birthday_m < 10 ? `0${updated_birthday_m}` : updated_birthday_m )}-${(updated_birthday_d < 10 ? `0${updated_birthday_d}` : updated_birthday_d )}`;
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
        sql += ` remarks = ?,`;
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
            remarks,
            validatedDate,
            hhid,
        ];
        // console.log(sql);
        // console.log(params);
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

    const pad = (num, size) => {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }

    
    
    return (
        <Layout style={{flex: 1, padding: 20}}>
            <KeyboardAvoidingView
                behavior={Platform.OS == "ios" ? "padding" : "height"}
                style={{flex: 1}}
            >
            <ScrollView>
            <Input
                label="Last Name"
                placeholder="Enter Last Name"
                value={formData.updated_lastname}
                ref={ref_updated_lastname}
                status={formError.updated_lastname.isValid ? "basic": "danger"}
                autoCompleteType="off"
                onSubmitEditing={() => ref_updated_firstname.current.focus()}
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_lastname: val.toLocaleUpperCase()};
                        return {...prev, ...data};
                    });
                }}
            />
            <Divider />

            <Input
                label="First Name"
                placeholder="Enter First Name"
                value={formData.updated_firstname}
                status={formError.updated_firstname.isValid ? "basic": "danger"}
                onSubmitEditing={() => ref_updated_middlename.current.focus()}
                ref={ref_updated_firstname}
                autoCompleteType="off"
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_firstname: val.toLocaleUpperCase()};
                        return {...prev, ...data};
                    });
                }}
            />
            <Divider />

            <Input
                label="Middle Name"
                placeholder="Enter Middle Name"
                value={formData.updated_middlename}
                status={formError.updated_middlename.isValid ? "basic": "danger"}
                onSubmitEditing={() => ref_updated_extname.current.focus()}
                ref={ref_updated_middlename}
                autoCompleteType="off"
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_middlename: val.toLocaleUpperCase()};
                        return {...prev, ...data};
                    });
                }}
            />
            <Divider />

            <Input
                label="Ext Name"
                placeholder="Enter Ext Name"
                value={formData.updated_extname}
                status={formError.updated_extname.isValid ? "basic": "danger"}
                onSubmitEditing={() => ref_updated_birthday_m.current.focus()}
                ref={ref_updated_extname}
                autoCompleteType="off"
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_extname: val.toLocaleUpperCase()};
                        return {...prev, ...data};
                    });
                }}
            />
            <Divider />

            <Layout style={{flexDirection: "row", justifyContent: "space-evenly"}}>
                <Layout style={{width: "32%"}}>
                    <Input
                        label="Birthday"
                        placeholder="MM"
                        maxLength={2}
                        keyboardType="numeric"
                        value={formData.updated_birthday_m}
                        status={formError.updated_birthday_m.isValid ? "basic": "danger"}
                        onSubmitEditing={() => ref_updated_birthday_d.current.focus()}
                        ref={ref_updated_birthday_m}
                        autoCompleteType="off"
                        onChangeText={(val) => {
                            if(isNaN(val)){

                            }else{
                                setFormData(prev => {
                                    let data = {updated_birthday_m: val};
                                    return {...prev, ...data};
                                });
                            }
                        }}
                    />
                </Layout>
                <Layout style={{width: "32%"}}>
                    <Input
                        label=" "
                        placeholder="DD"
                        keyboardType="numeric"
                        maxLength={2}
                        value={formData.updated_birthday_d}
                        status={formError.updated_birthday_d.isValid ? "basic": "danger"}
                        onSubmitEditing={() => ref_updated_birthday_y.current.focus()}
                        ref={ref_updated_birthday_d}
                        autoCompleteType="off"
                        onChangeText={(val) => {
                            if(isNaN(val)){

                            }else{
                                setFormData(prev => {
                                    let data = {updated_birthday_d: val};
                                    return {...prev, ...data};
                                });
                            }
                        }}
                    />
                </Layout>
                <Layout style={{width: "32%"}}>
                    <Input
                        label=" "
                        placeholder="YYYY"
                        keyboardType="numeric"
                        maxLength={4}
                        value={formData.updated_birthday_y}
                        status={formError.updated_birthday_y.isValid ? "basic": "danger"}
                        onSubmitEditing={() => ref_updated_sex.current.focus()}
                        autoCompleteType="off"
                        ref={ref_updated_birthday_y}
                        onChangeText={(val) => {
                            setFormData(prev => {
                                let data = {updated_birthday_y: val};
                                return {...prev, ...data};
                            });
                        }}
                    />
                </Layout>
            </Layout>
            <Divider />

            <Select
                label='Sex'
                placeholder="Select Sex"
                ref={ref_updated_sex}
                status={formError.updated_sex.isValid ? "basic": "danger"}
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
            <Divider />
            <Select
                label='Province'
                placeholder="Select Province"
                status={formError.updated_province_name.isValid ? "basic": "danger"}
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
            <Divider />
            <Select
                label='City/Municipality'
                placeholder="Select City/Municipality"
                status={formError.updated_city_name.isValid ? "basic": "danger"}
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
            <Divider />

            <Select
                label='Barangay'
                placeholder="Select Barangay"
                status={formError.updated_barangay_name.isValid ? "basic": "danger"}
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
            <Divider />

            <Input
                label="Remarks"
                placeholder="Add Remarks"
                value={formData.remarks}
                autoCompleteType="off"
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {remarks: val.toLocaleUpperCase()};
                        return {...prev, ...data};
                    });
                }}
            />
            <Divider />

            <Button style={{marginTop: 10}} disabled={loading} onPress={() => validateBeneficiary()}>
            { loading ? "VALIDATING" : "VALIDATE BENEFICIARY" }
            </Button>
            <Text> </Text>
            <Text> </Text>
            </ScrollView>
            </KeyboardAvoidingView>
        </Layout>
    );
}


export default UpdateInformation;
