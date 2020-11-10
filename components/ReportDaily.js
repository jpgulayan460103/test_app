import React, {useEffect, useState} from 'react';
import { StyleSheet, ToastAndroid, View, Dimensions, Modal } from 'react-native';
import { Layout, Text, List, Button } from '@ui-kitten/components';
import RNFetchBlob from 'rn-fetch-blob'
import Share from 'react-native-share';
import { zip } from 'react-native-zip-archive'
import RNFS from 'react-native-fs';
import _debounce  from 'lodash/debounce'
import _cloneDeep  from 'lodash/cloneDeep'
import _isEmpty  from 'lodash/isEmpty'
import Login from './Login'
import ImgToBase64 from 'react-native-image-base64';

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
    }
  });

const listWidth = Dimensions.get('window').width;
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const ReportDaily = ({navigation, route, db, client, user, setUser}) => {
    const { validated_date, total_images, total_uploaded } = route.params.report;
    const [validatedBeneficiaries, setValidatedBeneficiaries] = useState([]);
    const [generatedReportPath, setGeneratedReportPath] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [visible, setVisible] = React.useState(false);
    const [uploadingProgess, setUploadingProgess] = useState("");
    const [userLoginError, setUserLoginError] = useState({
        error: "",
    });
    const [loginString, setLoginString] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [notUploadedBeneficiaries, setNotUploadedBeneficiaries] = useState([]);

    useEffect(() => {
        navigation.setOptions({
          title: `Validated (${validated_date})`,
        });
        getValidatedBeneficiaries();
    }, []);

    const userLogin = async (data) => {
        try {
            setLoginLoading(true);
            let userLogin = await client.post('/api/login', data);
            console.log(userLogin);
            setUser(userLogin.data);
            setLoginLoading(false);
            setUserLoginError({
                error: "",
            });
            ToastAndroid.show("Login Successful.", ToastAndroid.SHORT);
            setVisible(false);
        } catch (error) {
            console.log(error);
            setLoginString(JSON.stringify(error));
            setUserLoginError(error.response.data);
            setLoginLoading(false);
            ToastAndroid.show("Login Failed.", ToastAndroid.SHORT)
        }
    }

    const uploadBeneficiaryImages = async (beneficiary) => {
        let image_photo = null;
        let image_valid_id = null;
        let image_house = null;
        let image_birth = null;
        let image_others = null;
        let uploadImageApi = null;
        let fileExist = false;
        let formData = {};
        return new Promise(async (resolve, reject) => {
            fileExist = await RNFS.exists(`file://${beneficiary.images_path}/${beneficiary.image_photo}`);
            if(fileExist){
                image_photo = await ImgToBase64.getBase64String(`file://${beneficiary.images_path}/${beneficiary.image_photo}`);
            }
            fileExist = await RNFS.exists(`file://${beneficiary.images_path}/${beneficiary.image_valid_id}`);
            if(fileExist){
                image_valid_id = await ImgToBase64.getBase64String(`file://${beneficiary.images_path}/${beneficiary.image_valid_id}`);
            }
            fileExist = await RNFS.exists(`file://${beneficiary.images_path}/${beneficiary.image_house}`);
            if(fileExist){
                image_house = await ImgToBase64.getBase64String(`file://${beneficiary.images_path}/${beneficiary.image_house}`);
            }
            fileExist = await RNFS.exists(`file://${beneficiary.images_path}/${beneficiary.image_birth}`);
            if(fileExist){
                image_birth = await ImgToBase64.getBase64String(`file://${beneficiary.images_path}/${beneficiary.image_birth}`);
            }
            fileExist = await RNFS.exists(`file://${beneficiary.images_path}/${beneficiary.image_others}`);
            if(fileExist){
                image_others = await ImgToBase64.getBase64String(`file://${beneficiary.images_path}/${beneficiary.image_others}`);
            }
            formData = {
                image_photo: image_photo,
                image_valid_id: image_valid_id,
                image_house: image_house,
                image_birth: image_birth,
                image_others: image_others,
            };
            
            try {
                formData.token = user.token;
                formData.beneficiary = beneficiary
                uploadImageApi = await client.post('/api/v1/mobilereports/upload', formData);
                resolve({
                    status: "ok",
                    response: uploadImageApi.data,
                });
            } catch (error) {
                if(error && error.response){
                    if(error.response.status == "401"){
                        ToastAndroid.show("Session Expired. Please login again.", ToastAndroid.LONG)
                        setUser({});
                    }
                    if(error.response.status == "422"){
                        resolve({
                            status: "error",
                            errors: error.response.data.errors
                        });
                    }
                }
                console.log(error.response.data);
                reject(error);
            }
        }) 
    }

    const uploadImages = async () => {
        let uploaded;
        let updated;
        let updatedBeneficiary;
        setUploading(true);
        let uploadedCount = 0;
        let notUploaded = [];
        let validated = _cloneDeep(validatedBeneficiaries);
        for (let index = 0; index < validated.length; index++) {
            setUploadingProgess(`${uploadedCount}/${validated.length}`);
            uploaded = await uploadBeneficiaryImages(validated[index]);
            if(uploaded.status == "error"){
                console.log(uploaded);
                notUploaded.push({
                    beneficiary: validated[index],
                    errors: uploaded.errors
                });
                validated[index].errors = uploaded.errors;
            }else{
                updated = await updateBeneficiary(uploaded.response);
                uploadedCount++;
                setUploadingProgess(`${uploadedCount}/${validated.length}`);
            }
        }
        // console.log(validated);
        setNotUploadedBeneficiaries(notUploaded);
        setUploadingProgess(`${uploadedCount}/${validated.length}`);
        getValidatedBeneficiaries();
        ToastAndroid.show(`Uploaded ${uploadedCount} of ${validated.length} Beneficiaries`, ToastAndroid.LONG)
        setUploading(false);
    }

    const updateBeneficiary = (beneficiary) => {
        return new Promise((resolve, reject) => {
            db.transaction((trans) => {
                let image_photo_status = beneficiary.image_photo != null ? "uploaded" : null;
                let image_valid_id_status = beneficiary.image_valid_id != null ? "uploaded" : null;
                let image_house_status = beneficiary.image_house != null ? "uploaded" : null;
                let image_birth_status = beneficiary.image_birth != null ? "uploaded" : null;
                let image_others_status = beneficiary.image_others != null ? "uploaded" : null;
                let params = [
                    image_photo_status,
                    image_valid_id_status,
                    image_house_status,
                    image_birth_status,
                    image_others_status,
                    beneficiary.hhid,
                ];
                let query = "image_photo_status = ?, image_valid_id_status = ?, image_house_status = ?, image_birth_status = ?, image_others_status = ?";
                trans.executeSql(`update potential_beneficiaries set ${query} where hhid = ?; select * from potential_beneficiaries where hhid = '${beneficiary.hhid}'`, params, (trans, results) => {
                    let items = [];
                    let rows = results.rows;
                    for (let i = 0; i < rows.length; i++) {
                        var item = rows.item(i);
                        items.push(item);
                    }
                    resolve(item);
                },
                (error) => {
                    reject(error);
                    // console.log(error);
                });
            });
        });
    }
    
    const getValidatedBeneficiaries = () => {
        setValidatedBeneficiaries([]);
        db.transaction((trans) => {
            let sql = "";
            sql += `(count(image_photo) + count(image_valid_id) + count(image_house) + count(image_birth)) as total_required_images, `;
            sql += `(count(image_others)) as total_other_images, `;
            sql += `(count(image_photo_status) + count(image_valid_id_status) + count(image_house_status) + count(image_birth_status)) as total_required_uploaded, `;
            sql += `(count(image_others_status)) as total_other_update, `;
            trans.executeSql(`select ${sql} * from potential_beneficiaries where validated_date = ? group by hhid`, [validated_date], (trans, results) => {
                let items = [];
                let rows = results.rows;
                // console.log(rows.length);
                for (let i = 0; i < rows.length; i++) {
                    var item = rows.item(i);
                    items.push(item);
                }
                setValidatedBeneficiaries(items);
            },
            (error) => {
                console.log(error);
            });
        });
    }

    const shareFile = async () => {
        const shareOptions = {
            title: 'Share file',
            failOnCancel: false,
            url: `file://${generatedReportPath}`,
          };
          try {
            const ShareResponse = await Share.open(shareOptions);
            console.log(JSON.stringify(ShareResponse, null, 2));
          } catch (error) {
            console.log('Error =>', error);
            console.log('error: '.concat(getErrorString(error)));
          }
    }

    const generateReport = _debounce(async () => {
        setLoading(true);
        let dirExist = await RNFS.exists(`${RNFS.ExternalStorageDirectoryPath}/UCT/Images/${validated_date}`);
        let fileExist = await RNFS.exists(`${RNFS.ExternalStorageDirectoryPath}/UCT/Images/${validated_date}/uct-validation-${validated_date}.zip`);
        if(fileExist){
            await RNFS.unlink(`${RNFS.ExternalStorageDirectoryPath}/UCT/Images/${validated_date}/uct-validation-${validated_date}.zip`);
        }
        if(dirExist){
            makeCsv();
        }
    }, 250);

    const makeZip = () => {
        const targetPath = `${RNFS.ExternalStorageDirectoryPath}/UCT/Images/${validated_date}/uct-validation-${validated_date}.zip`;
        const sourcePath = `${RNFS.ExternalStorageDirectoryPath}/UCT/Images/${validated_date}`;

        zip(sourcePath, targetPath)
        .then((path) => {
            console.log(`zip completed at ${path}`)
            setGeneratedReportPath(path);
            setLoading(false);
            ToastAndroid.show(`Report generated`, ToastAndroid.SHORT);
        })
        .catch((error) => {
        console.error(error)
        })
    }

    const makeCsv = () => {
        let headerString = '';
        headerString += `region,`;
        headerString += `province_name,`;
        headerString += `city_name,`;
        headerString += `barangay_name,`;
        headerString += `fullname,`;
        headerString += `lastname,`;
        headerString += `firstname,`;
        headerString += `middlename,`;
        headerString += `extname,`;
        headerString += `birthday,`;
        headerString += `hhid,`;
        headerString += `psgc,`;
        headerString += `sex,`;
        headerString += `remarks,`;
        headerString += `updated_province_name,`;
        headerString += `updated_city_name,`;
        headerString += `updated_barangay_name,`;
        headerString += `updated_lastname,`;
        headerString += `updated_firstname,`;
        headerString += `updated_middlename,`;
        headerString += `updated_extname,`;
        headerString += `updated_birthday,`;
        headerString += `updated_sex,`;
        headerString += `updated_psgc,`;
        headerString += `status,`;
        headerString += `status_reason,`;
        headerString += `rel_hh,`;
        headerString += `validated_firstname,`;
        headerString += `validated_middlename,`;
        headerString += `validated_lastname,`;
        headerString += `validated_extname,`;
        headerString += `validated_birthday,`;
        headerString += `validated_sex,`;
        headerString += `validated_date`;
        headerString += '\n';
        let rowString = validatedBeneficiaries.map(item => {
            let string = "";
            string += `"${item.region}",`
            string += `"${item.province_name}",`
            string += `"${item.city_name}",`
            string += `"${item.barangay_name}",`
            string += `"${item.fullname}",`
            string += `"${item.lastname}",`
            string += `"${item.firstname}",`
            string += `"${item.middlename}",`
            string += `"${item.extname}",`
            string += `"${item.birthday}",`
            string += `"${item.hhid}",`
            string += `"${item.psgc}",`
            string += `"${item.sex}",`
            string += `"${item.remarks}",`
            string += `"${item.updated_province_name}",`
            string += `"${item.updated_city_name}",`
            string += `"${item.updated_barangay_name}",`
            string += `"${item.updated_lastname}",`
            string += `"${item.updated_firstname}",`
            string += `"${item.updated_middlename}",`
            string += `"${item.updated_extname}",`
            string += `"${item.updated_birthday}",`
            string += `"${item.updated_sex}",`
            string += `"${item.updated_psgc}",`
            string += `"${item.status}",`
            string += `"${item.status_reason}",`
            string += `"${item.rel_hh}",`
            string += `"${item.validated_firstname}",`
            string += `"${item.validated_middlename}",`
            string += `"${item.validated_lastname}",`
            string += `"${item.validated_extname}",`
            string += `"${item.validated_birthday}",`
            string += `"${item.validated_sex}",`
            string += `"${item.validated_date}",`
            string += '\n';
            return string;
        }).join('');
        const csvString = `${headerString}${rowString}`;

        const pathToWrite = `${RNFS.ExternalStorageDirectoryPath}/UCT/Images/${validated_date}/uct-validation-${validated_date}.csv`;
        RNFetchBlob.fs.writeFile(pathToWrite, csvString, 'utf8')
        .then(() => {
            console.log(`wrote file ${pathToWrite}`);
            makeZip();
        })
        .catch(error => console.error(error));
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
            
            <View style={{ width: (listWidth * 0.55), paddingRight: 4}}>
                <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                    {`${item.lastname ? item.lastname : ""}, ${item.firstname ? item.firstname : ""} ${item.middlename ? item.middlename : ""} ${item.extname ? item.extname : ""}`}
                </Text>
                <Text category='c1'>{`${item.barangay_name}, ${item.city_name}\n${item.province_name}, ${item.region}`}</Text>
            </View>
            <View style={{ width: (listWidth * 0.20), paddingRight: 4, alignContent: "center", justifyContent: "center"}}>
                <Text category='c1' style={{fontWeight: "bold", fontSize: 14, textAlign: "center"}}>{`${item.total_required_images} (${item.total_other_images})`}</Text>
            </View>
            <View style={{ width: (listWidth * 0.20), paddingRight: 4, alignContent: "center", justifyContent: "center"}}>
                <Text category='c1' style={{fontWeight: "bold", fontSize: 14, textAlign: "center"}}>{`${item.total_required_uploaded} (${item.total_other_update})`}</Text>
            </View>
        </View>
    );

    return (
        <Layout style={{flex: 1, padding: 10}}>
            <Text>Validation Date: {validated_date}</Text>
            <Text>Total Images: {total_images}</Text>
            <Text>Uploaded Images: {total_uploaded}</Text>
            { uploading ? (
                <Text>Uploading Progress: {uploadingProgess}</Text>
            ) : <></> }
            <View style={{flexDirection: "row"}}>
                <View style={{flex: 1}}>
                    { generatedReportPath == "" ? (
                        <Button onPress={() => {generateReport()}} disabled={loading}>{loading ? "Generating Report" : "Generate Report"} </Button>
                    ) : (
                        <Button onPress={() => {shareFile()}}>Share File</Button>
                    ) }
                </View>
                <View style={{flex: 1}}>
                    <Button status="info" onPress={() => {
                        if(_isEmpty(user)){
                            setVisible(true);
                        }else{
                            console.log("upload");
                            uploadImages();
                        }
                    }} disabled={uploading}>{uploading ? `Uploading Images` : "Upload Images"} </Button>
                </View>
            </View>
            { generatedReportPath != "" ? (
                <View>
                    <Text>Generated Report:</Text>
                    <Text>{generatedReportPath}</Text>
                </View>
            ) : (<></>) }
            
            
            <View style={
                {
                    width:"100%",
                    backgroundColor: "#222b44",
                    padding: 5,
                    paddingLeft: 0,
                    borderColor: "black",
                    borderBottomWidth: 1,
                    flexDirection: "row",
                    marginTop: 10
                }
            }>
                <View style={{ width: (listWidth * 0.55), paddingRight: 4}}>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                        Beneficiary
                    </Text>
                </View>
                <View style={{ width: (listWidth * 0.20), paddingRight: 4, alignContent: "center", justifyContent: "center"}}>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14, textAlign: "center"}}>
                        Images
                    </Text>
                </View>
                <View style={{ width: (listWidth * 0.20), paddingRight: 4, alignContent: "center", justifyContent: "center"}}>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14, textAlign: "center"}}>
                        Uploaded
                    </Text>
                </View>
            </View>
            <List
                data={validatedBeneficiaries}
                renderItem={renderItem}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={() => {

                }}
            >
                <View style={styles.centeredView}>
                    <Login setVisible={setVisible} userLogin={userLogin} userLoginError={userLoginError} loginLoading={loginLoading} loginString={loginString} />
                </View>
            </Modal>
        </Layout>
    );
}


export default ReportDaily;
