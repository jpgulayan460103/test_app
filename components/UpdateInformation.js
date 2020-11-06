import React, {useEffect, useState, useRef } from 'react';
import { StyleSheet, ToastAndroid, View, Dimensions, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Layout, Text, Icon, Button, Select, SelectItem, Divider, Input } from '@ui-kitten/components';
import _debounce from 'lodash/debounce'
import _forEach from 'lodash/forEach'

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
    const [status, setStatus] = useState(['ACTIVE','INACTIVE']);
    const [sexValue, setSexValue] = useState(null);
    const [validatedSexValue, setValidatedSexValue] = useState(null);
    const [beneficiaryStatus, setBeneficiaryStatus] = useState(null);
    const [relHh, setRelHH] = useState(null);
    const [statusReason, setStatusReason] = useState(null);
    const [loading, setLoading] = useState(false);
    const [relHhSelection, setRelHhSelection] = useState([
        'FATHER',
        'MOTHER',
        'SON',
        'DAUGHTER',
        'SPOUSE',
        'FATHER-IN-LAW',
        'MOTHER-IN-LAW',
        'SON-IN-LAW',
        'DAUGHTER-IN-LAW',
        'BROTHER',
        'SISTER',
        'GRANDFATHER',
        'GRANDMOTHER',
        'GRANDSON',
        'GRANDDAUGHTER',
        'BROTHER-IN-LAW',
        'SISTER-IN-LAW',
        'GRANDFATHER-IN-LAW',
        'GRANDMOTHER-IN-LAW',
        'GRANDSON-IN-LAW',
        'GRANDDAUTHER-IN-LAW',
    ]);

    const [statusReasonSelection, setstatusReasonSelection] = useState([
        'DECEASED',
        'WORKING OUTSIDE THE CITY/MUNICIPALITY',
        'OFW',
        'UNLOCATED',
        'IN PRISON',
        'PANTAWID BENEFICIARY',
        'SEPARATED',
        'TRANSFERRED',
        'REFUSED',
        'OTHERS',
    ]);

    const ref_updated_lastname = useRef();
    const ref_updated_firstname = useRef();
    const ref_updated_middlename = useRef();
    const ref_updated_extname = useRef();
    const ref_updated_birthday_m = useRef();
    const ref_updated_birthday_d = useRef();
    const ref_updated_birthday_y = useRef();
    const ref_updated_sex = useRef();
    const ref_validated_lastname = useRef();
    const ref_validated_firstname = useRef();
    const ref_validated_middlename = useRef();
    const ref_validated_extname = useRef();
    const ref_validated_birthday_m = useRef();
    const ref_validated_birthday_d = useRef();
    const ref_validated_birthday_y = useRef();
    const ref_validated_sex = useRef();

    

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
        validated_lastname: "",
        validated_firstname: "",
        validated_middlename: "",
        validated_extname: "",
        validated_birthday: "",
        validated_sex: "",
        validated_birthday_m: "",
        validated_birthday_d: "",
        validated_birthday_y: "",
        remarks: "",
        status_reason: "",
        status: "",
        rel_hh: "",
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
        validated_lastname: { isValid: true, message: "" },
        validated_firstname: { isValid: true, message: "" },
        validated_middlename: { isValid: true, message: "" },
        validated_extname: { isValid: true, message: "" },
        validated_birthday_m: { isValid: true, message: "" },
        validated_birthday_d: { isValid: true, message: "" },
        validated_birthday_y: { isValid: true, message: "" },
        validated_sex: { isValid: true, message: "" },
        status: { isValid: true, message: "" },
        rel_hh: { isValid: true, message: "" },
        status_reason: { isValid: true, message: "" },
        remarks: { isValid: true, message: "" },
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
        if(beneficiary.validated_sex){
            setValidatedSexValue(beneficiary.validated_sex);
        }
        if(beneficiary.status){
            setBeneficiaryStatus(beneficiary.status);
        }
        if(beneficiary.status_reason){
            setStatusReason(beneficiary.status_reason);
        }
        if(beneficiary.validated_sex){
            setValidatedSexValue(beneficiary.validated_sex);
        }
        if(beneficiary.rel_hh){
            setRelHH(beneficiary.rel_hh);
        }
        if(beneficiary.updated_birthday){
            let splitBirthday = beneficiary.updated_birthday.split('-');
            beneficiary.updated_birthday_y = splitBirthday[0];
            beneficiary.updated_birthday_m = splitBirthday[1];
            beneficiary.updated_birthday_d = splitBirthday[2];
        }
        if(beneficiary.validated_birthday){
            let splitBirthdayValidated = beneficiary.validated_birthday.split('-');
            beneficiary.validated_birthday_y = splitBirthdayValidated[0];
            beneficiary.validated_birthday_m = splitBirthdayValidated[1];
            beneficiary.validated_birthday_d = splitBirthdayValidated[2];
        }
        setFormData(prev => {
            return {...prev, ...beneficiary};
        });
    }, []);

    const validateBeneficiary = _debounce(() => {
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
            // setLoading(false);
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
                            message = "Not valid age.";
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
                case 'status':
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
                case 'validated_lastname':
                case 'validated_firstname':
                    if(beneficiaryStatus == "ACTIVE"){break;}
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
                case 'validated_middlename':
                case 'validated_extname':
                    if(beneficiaryStatus == "ACTIVE"){break;}
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
                case 'validated_birthday_m':
                case 'validated_birthday_d':
                    if(beneficiaryStatus == "ACTIVE"){break;}
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
                    if(formData.validated_birthday_m && formData.validated_birthday_d && formData.validated_birthday_y){
                        let validated_birthday_m = formData.validated_birthday_m < 10 ? `0${parseInt(formData.validated_birthday_m)}` : parseInt(formData.validated_birthday_m);
                        let validated_birthday_d = formData.validated_birthday_d < 10 ? `0${parseInt(formData.validated_birthday_d)}` : parseInt(formData.validated_birthday_d);
                        let validated_birthday_y = formData.validated_birthday_y;
                        let dateString = `${validated_birthday_y}-${validated_birthday_m}-${validated_birthday_d}`;
                        let parseDate = new Date(dateString);
                        if(parseDate instanceof Date && !isNaN(parseDate)){
                            
                        }else{
                            hasError = true;
                            keyError = true;
                            message = "Invalid Date";
                            formErrors.validated_birthday_m = { isValid: false, message: message };
                            formErrors.validated_birthday_d = { isValid: false, message: message };
                            formErrors.validated_birthday_y = { isValid: false, message: message };
                        }
                    }
                    break;
                case 'validated_birthday_y':
                    if(beneficiaryStatus == "ACTIVE"){break;}
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
                            message = "Not valid age.";
                        }
                    }
                    formErrors[key] = { isValid: !keyError, message: message };
                    if(formData.validated_birthday_m && formData.validated_birthday_d && formData.validated_birthday_y){
                        let validated_birthday_m = formData.validated_birthday_m < 10 ? `0${parseInt(formData.validated_birthday_m)}` : parseInt(formData.validated_birthday_m);
                        let validated_birthday_d = formData.validated_birthday_d < 10 ? `0${parseInt(formData.validated_birthday_d)}` : parseInt(formData.validated_birthday_d);
                        let validated_birthday_y = formData.validated_birthday_y;
                        let dateString = `${validated_birthday_y}-${validated_birthday_m}-${validated_birthday_d}`;
                        let parseDate = new Date(dateString);
                        if(parseDate instanceof Date && !isNaN(parseDate)){
                            
                        }else{
                            hasError = true;
                            keyError = true;
                            message = "Invalid Date";
                            formErrors.validated_birthday_m = { isValid: false, message: message };
                            formErrors.validated_birthday_d = { isValid: false, message: message };
                            formErrors.validated_birthday_y = { isValid: false, message: message };
                        }
                    }
                    
                    break;
                case 'validated_sex':
                case 'rel_hh':
                case 'status_reason':
                case 'remarks':
                    if(beneficiaryStatus == "ACTIVE"){break;}
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
                    formErrors[key] = { isValid: true, message: message };
                    break;
            }
            // console.log(`key: ${key} = ${hasError}`);
        })
        setFormError(formErrors);
        return hasError;
    }

    const getUpdatedPsgc = ({updated_province_name, updated_city_name, updated_barangay_name}) => {
        return new Promise((resolve, reject) => {
            db.transaction((trans) => {
                trans.executeSql("select psgc from potential_beneficiaries where province_name = ? and city_name = ? and barangay_name = ? limit 1", [updated_province_name, updated_city_name, updated_barangay_name], (trans, results) => {
                    let item;
                    let rows = results.rows;
                    item = rows.item(0);
                    resolve(item.psgc);
                },
                (error) => {
                    console.log(error);
                    reject(error);
                });
            });
        })
    }

    const updateBeneficiary = async (updatedBeneficiary, validatedDate) => {
        let updated_psgc = await getUpdatedPsgc(updatedBeneficiary);
        console.log(updated_psgc);
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
            status,
            status_reason,
            rel_hh,
            validated_firstname,
            validated_middlename,
            validated_lastname,
            validated_extname,
            validated_sex,
            validated_birthday_m,
            validated_birthday_d,
            validated_birthday_y,
            hhid,
        } = updatedBeneficiary;
        updated_birthday_m = parseInt(updated_birthday_m);
        updated_birthday_d = parseInt(updated_birthday_d);
        updated_birthday_y = parseInt(updated_birthday_y);
        let updated_birthday = `${updated_birthday_y}-${(updated_birthday_m < 10 ? `0${updated_birthday_m}` : updated_birthday_m )}-${(updated_birthday_d < 10 ? `0${updated_birthday_d}` : updated_birthday_d )}`;

        validated_birthday_m = parseInt(validated_birthday_m);
        validated_birthday_d = parseInt(validated_birthday_d);
        validated_birthday_y = parseInt(validated_birthday_y);
        let validated_birthday = `${validated_birthday_y}-${(validated_birthday_m < 10 ? `0${validated_birthday_m}` : validated_birthday_m )}-${(validated_birthday_d < 10 ? `0${validated_birthday_d}` : validated_birthday_d )}`;
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
        sql += ` status = ?,`;
        sql += ` status_reason = ?,`;
        sql += ` rel_hh = ?,`;
        sql += ` validated_firstname = ?,`;
        sql += ` validated_middlename = ?,`;
        sql += ` validated_lastname = ?,`;
        sql += ` validated_extname = ?,`;
        sql += ` validated_birthday = ?,`;
        sql += ` validated_sex = ?,`;
        sql += ` updated_psgc = ?,`;
        sql += ` validated_date = ?`;
        sql += ` where hhid = ?`;

        updated_lastname = updated_lastname ? updated_lastname.toUpperCase() : updated_lastname;
        updated_firstname = updated_firstname ? updated_firstname.toUpperCase() : updated_firstname;
        updated_middlename = updated_middlename ? updated_middlename.toUpperCase() : updated_middlename;
        updated_extname = updated_extname ? updated_extname.toUpperCase() : updated_extname;
        remarks = remarks ? remarks.toUpperCase() : remarks;
        status_reason = status_reason ? status_reason.toUpperCase() : status_reason;
        validated_firstname = validated_firstname ? validated_firstname.toUpperCase() : validated_firstname;
        validated_middlename = validated_middlename ? validated_middlename.toUpperCase() : validated_middlename;
        validated_lastname = validated_lastname ? validated_lastname.toUpperCase() : validated_lastname;
        validated_extname = validated_extname ? validated_extname.toUpperCase() : validated_extname;

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
            status,
            status_reason,
            rel_hh,
            validated_firstname,
            validated_middlename,
            validated_lastname,
            validated_extname,
            validated_birthday,
            validated_sex,
            updated_psgc,
            validatedDate,
            hhid,
        ];
        console.log(sql);
        console.log(params);
        db.transaction((trans) => {
            trans.executeSql(sql, params, (trans, results) => {
                ToastAndroid.show("Validated.", ToastAndroid.SHORT)
                navigation.goBack();
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
            

            <Select
                label='Beneficiary Status'
                placeholder="Select Beneficiary Status"
                ref={ref_validated_sex}
                status={formError.status.isValid ? "basic": "danger"}
                caption={formError.status.message ? formError.status.message: ""}
                onSelect={(item) => {
                    setBeneficiaryStatus(status[item.row]);
                    setFormData(prev => {
                        let data = {status: status[item.row]};
                        return {...prev, ...data};
                    });
                }}
                value={beneficiaryStatus}>
                {
                    status.map((item, index) => {
                        return (<SelectItem title={item} key={`status_${index}`}/>)
                    })
                }
            </Select>

            { beneficiaryStatus == "ACTIVE" || beneficiaryStatus == null ? (<></>) : (
                <>
                <Text style={{textAlign: "center"}}>Inactive Validation Form</Text>
                <Select
                    label='Inactive Reason'
                    placeholder="Select Reason"
                    caption={formError.status_reason.message ? formError.status_reason.message: ""}
                    status={formError.status_reason.isValid ? "basic": "danger"}
                    onSelect={(item) => {
                        setStatusReason(statusReasonSelection[item.row]);
                        setFormData(prev => {
                            let data = {status_reason: statusReasonSelection[item.row]};
                            return {...prev, ...data};
                        });
                    }}
                    value={statusReason}>
                    {
                        statusReasonSelection.map((item, index) => {
                            return (<SelectItem title={item} key={`rel_hh_${index}`}/>)
                        })
                    }
                </Select>
                <Divider />

                <Input
                    label="Remarks"
                    placeholder="Add Remarks"
                    status={formError.remarks.isValid ? "basic": "danger"}
                    caption={formError.remarks.message ? formError.remarks.message: ""}
                    value={formData.remarks}
                    autoCompleteType="off"
                    onChangeText={(val) => {
                        setFormData(prev => {
                            let data = {remarks: val};
                            return {...prev, ...data};
                        });
                    }}
                />
                <Divider />

                <Select
                    label='Relationship to HH'
                    placeholder="Select Relationship"
                    status={formError.rel_hh.isValid ? "basic": "danger"}
                    caption={formError.rel_hh.message ? formError.rel_hh.message: ""}
                    onSelect={(item) => {
                        setRelHH(relHhSelection[item.row]);
                        setFormData(prev => {
                            let data = {rel_hh: relHhSelection[item.row]};
                            return {...prev, ...data};
                        });
                    }}
                    value={relHh}>
                    {
                        relHhSelection.map((item, index) => {
                            return (<SelectItem title={item} key={`rel_hh_${index}`}/>)
                        })
                    }
                </Select>
                <Divider />

                <Input
                    label={relHh ? `${relHh}'s Last Name` : `Last Name`}
                    placeholder="Enter Last Name"
                    value={formData.validated_lastname}
                    ref={ref_validated_lastname}
                    status={formError.validated_lastname.isValid ? "basic": "danger"}
                    caption={formError.validated_lastname.message ? formError.validated_lastname.message: ""}
                    autoCompleteType="off"
                    onSubmitEditing={() => ref_validated_firstname.current.focus()}
                    onChangeText={(val) => {
                        setFormData(prev => {
                            let data = {validated_lastname: val};
                            return {...prev, ...data};
                        });
                    }}
                />
                <Divider />
                <Input
                    label={relHh ? `${relHh}'s First Name` : `First Name`}
                    placeholder="Enter First Name"
                    value={formData.validated_firstname}
                    status={formError.validated_firstname.isValid ? "basic": "danger"}
                    caption={formError.validated_firstname.message ? formError.validated_firstname.message: ""}
                    onSubmitEditing={() => ref_validated_middlename.current.focus()}
                    ref={ref_validated_firstname}
                    autoCompleteType="off"
                    onChangeText={(val) => {
                        setFormData(prev => {
                            let data = {validated_firstname: val};
                            return {...prev, ...data};
                        });
                    }}
                />
                <Divider />
    
                <Input
                    label={relHh ? `${relHh}'s Middle Name` : `Middle Name`}
                    placeholder="Enter Middle Name"
                    value={formData.validated_middlename}
                    status={formError.validated_middlename.isValid ? "basic": "danger"}
                    caption={formError.validated_middlename.message ? formError.validated_middlename.message: ""}
                    onSubmitEditing={() => ref_validated_extname.current.focus()}
                    ref={ref_validated_middlename}
                    autoCompleteType="off"
                    onChangeText={(val) => {
                        setFormData(prev => {
                            let data = {validated_middlename: val};
                            return {...prev, ...data};
                        });
                    }}
                />
                <Divider />
    
                <Input
                    label={relHh ? `${relHh}'s Ext Name` : `Ext Name`}
                    placeholder="Enter Ext Name"
                    value={formData.validated_extname}
                    status={formError.validated_extname.isValid ? "basic": "danger"}
                    caption={formError.validated_extname.message ? formError.validated_extname.message: ""}
                    onSubmitEditing={() => ref_validated_birthday_m.current.focus()}
                    ref={ref_validated_extname}
                    autoCompleteType="off"
                    onChangeText={(val) => {
                        setFormData(prev => {
                            let data = {validated_extname: val};
                            return {...prev, ...data};
                        });
                    }}
                />
                <Divider />
    
                
    
                <Layout style={{flexDirection: "row", justifyContent: "space-evenly"}}>
                    <Layout style={{width: "32%"}}>
                        <Input
                            label={relHh ? `${relHh}'s Birthday` : `Birthday`}
                            placeholder="MM"
                            maxLength={2}
                            keyboardType="numeric"
                            caption="01-12"
                            value={formData.validated_birthday_m}
                            status={formError.validated_birthday_m.isValid ? "basic": "danger"}
                            onSubmitEditing={() => ref_validated_birthday_d.current.focus()}
                            ref={ref_validated_birthday_m}
                            autoCompleteType="off"
                            onChangeText={(val) => {
                                if(isNaN(val)){
    
                                }else{
                                    setFormData(prev => {
                                        let data = {validated_birthday_m: val};
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
                            caption="01-31"
                            maxLength={2}
                            value={formData.validated_birthday_d}
                            status={formError.validated_birthday_d.isValid ? "basic": "danger"}
                            onSubmitEditing={() => ref_validated_birthday_y.current.focus()}
                            ref={ref_validated_birthday_d}
                            autoCompleteType="off"
                            onChangeText={(val) => {
                                if(isNaN(val)){
    
                                }else{
                                    setFormData(prev => {
                                        let data = {validated_birthday_d: val};
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
                            caption="1920-2002"
                            keyboardType="numeric"
                            maxLength={4}
                            value={formData.validated_birthday_y}
                            status={formError.validated_birthday_y.isValid ? "basic": "danger"}
                            onSubmitEditing={() => ref_validated_sex.current.focus()}
                            autoCompleteType="off"
                            ref={ref_validated_birthday_y}
                            onChangeText={(val) => {
                                setFormData(prev => {
                                    let data = {validated_birthday_y: val};
                                    return {...prev, ...data};
                                });
                            }}
                        />
                    </Layout>
                </Layout>
                <Divider />
                <Select
                    label={relHh ? `${relHh}'s Sex` : `Sex`}
                    placeholder="Select Sex"
                    ref={ref_validated_sex}
                    status={formError.validated_sex.isValid ? "basic": "danger"}
                    caption={formError.validated_sex.message ? formError.validated_sex.message: ""}
                    onSelect={(item) => {
                        setValidatedSexValue(genders[item.row]);
                        setFormData(prev => {
                            let data = {validated_sex: genders[item.row]};
                            return {...prev, ...data};
                        });
                    }}
                    value={validatedSexValue}>
                    {
                        genders.map((item, index) => {
                            return (<SelectItem title={item} key={`validated_sex_${index}`}/>)
                        })
                    }
                </Select>
                
                <Divider />
                </>
            ) }
            <Text style={{textAlign: "center", marginTop: 10}}>Beneficiary Update Information</Text>
            <Input
                label="Last Name"
                placeholder="Enter Last Name"
                value={formData.updated_lastname}
                ref={ref_updated_lastname}
                status={formError.updated_lastname.isValid ? "basic": "danger"}
                caption={formError.updated_lastname.message ? formError.updated_lastname.message: ""}
                autoCompleteType="off"
                onSubmitEditing={() => ref_updated_firstname.current.focus()}
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_lastname: val};
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
                caption={formError.updated_firstname.message ? formError.updated_firstname.message: ""}
                onSubmitEditing={() => ref_updated_middlename.current.focus()}
                ref={ref_updated_firstname}
                autoCompleteType="off"
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_firstname: val};
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
                caption={formError.updated_middlename.message ? formError.updated_middlename.message: ""}
                onSubmitEditing={() => ref_updated_extname.current.focus()}
                ref={ref_updated_middlename}
                autoCompleteType="off"
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_middlename: val};
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
                caption={formError.updated_extname.message ? formError.updated_extname.message: ""}
                onSubmitEditing={() => ref_updated_birthday_m.current.focus()}
                ref={ref_updated_extname}
                autoCompleteType="off"
                onChangeText={(val) => {
                    setFormData(prev => {
                        let data = {updated_extname: val};
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
                        caption="01-12"
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
                        caption="01-31"
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
                        caption="1920-2002"
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
                caption={formError.updated_sex.message ? formError.updated_sex.message: ""}
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
                caption={formError.updated_province_name.message ? formError.updated_province_name.message: ""}
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
                label='City/Municipality/Subdistrict'
                placeholder="Select City/Municipality/Subdistrict"
                status={formError.updated_city_name.isValid ? "basic": "danger"}
                caption={formError.updated_city_name.message ? formError.updated_city_name.message: ""}
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
                caption={formError.updated_barangay_name.message ? formError.updated_barangay_name.message: ""}
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

            <Button style={{marginTop: 10}} disabled={loading} onPress={() => {
                setLoading(true);
                validateBeneficiary()
            }}>
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
