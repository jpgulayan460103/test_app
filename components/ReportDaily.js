import React, {useEffect, useState} from 'react';
import { StyleSheet, ToastAndroid, View, Dimensions } from 'react-native';
import { Layout, Text, Icon, List, Button, Card, Modal, Divider } from '@ui-kitten/components';
import RNFetchBlob from 'rn-fetch-blob'
import Share from 'react-native-share';
import { zip, unzip, unzipAssets, subscribe } from 'react-native-zip-archive'
import RNFS from 'react-native-fs';
import _debounce  from 'lodash/debounce'
import _isEmpty  from 'lodash/isEmpty'
import Login from './Login'
import ImgToBase64 from 'react-native-image-base64';
import axios from 'axios';

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
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
    const [loginLoading, setLoginLoading] = useState(false);

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
            setUser(userLogin.data);
            setLoginLoading(false);
            setUserLoginError({
                error: "",
            });
            ToastAndroid.show("Login Successful.", ToastAndroid.SHORT);
            setVisible(false);
        } catch (error) {
            console.log(error);
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
                // console.log(formData);
                formData.token = user.token;
                formData.beneficiary = beneficiary
                uploadImageApi = await client.post('/api/v1/mobilereports/upload', formData);
                // console.log(uploadImageApi);
                resolve(uploadImageApi.data);
            } catch (error) {
                if(error && error.response){
                    if(error.response.status == "401"){
                        ToastAndroid.show("Session Expired. Please login again.", ToastAndroid.LONG)
                        setUser({});
                    }
                }
                console.log(error.response.data);
                reject(error);
            }
        }) 
    }

    const uploadImages = async () => {
        let uploaded;
        setUploading(true);
        for (let index = 0; index < validatedBeneficiaries.length; index++) {
            setUploadingProgess(`${index}/${validatedBeneficiaries.length}`);
            uploaded = await uploadBeneficiaryImages(validatedBeneficiaries[index]); 
            setUploadingProgess(`${index+1}/${validatedBeneficiaries.length}`);
        }
        setUploadingProgess(`${validatedBeneficiaries.length}/${validatedBeneficiaries.length}`);
        setUploading(false);
    }
    
    const getValidatedBeneficiaries = () => {
        setValidatedBeneficiaries([]);
        db.transaction((trans) => {
            let sql = "";
            sql += `(count(image_photo) + count(image_valid_id) + count(image_house) + count(image_birth)) as total_required_images, `;
            sql += `(count(image_others)) as total_other_images, `;
            sql += `(count(image_photo_status) + count(image_valid_id_status) + count(image_house_status) + count(image_birth_status) + count(image_others_status)) as total_uploaded, `;
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
      
          // If you want, you can use a try catch, to parse
          // the share response. If the user cancels, etc.
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
        let headerString = 'region,province_name,city_name,barangay_name,fullname,lastname,firstname,middlename,extname,birthday,hhid,psgc,sex,validated_date,remarks,updated_province_name,updated_city_name,updated_barangay_name,updated_lastname,updated_firstname,updated_middlename,updated_extname,updated_birthday,updated_sex\n';
        let rowString = validatedBeneficiaries.map(item => {
            return `"${item.region}","${item.province_name}","${item.city_name}","${item.barangay_name}","${item.fullname}","${item.lastname}","${item.firstname}","${item.middlename}","${item.extname}","${item.birthday}","${item.hhid}","${item.psgc}","${item.sex}","${item.validated_date}","${item.remarks}","${item.updated_province_name}","${item.updated_city_name}","${item.updated_barangay_name}","${item.updated_lastname}","${item.updated_firstname}","${item.updated_middlename}","${item.updated_extname}","${item.updated_birthday}","${item.updated_sex}",\n`;
        }).join('');
        console.log(`${headerString}${rowString}`);
        const csvString = `${headerString}${rowString}`;

        // write the current list of answers to a local csv file
        const pathToWrite = `${RNFS.ExternalStorageDirectoryPath}/UCT/Images/${validated_date}/uct-validation-${validated_date}.csv`;
        // console.log('pathToWrite', pathToWrite);
        // pathToWrite /storage/emulated/0/Download/data.csv
        RNFetchBlob.fs.writeFile(pathToWrite, csvString, 'utf8')
        .then(() => {
            console.log(`wrote file ${pathToWrite}`);
            makeZip();
            // wrote file /storage/emulated/0/Download/data.csv
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
            <View style={{ width: (listWidth * 0.15), paddingRight: 4, alignContent: "center", justifyContent: "center"}}>
                <Text category='c1' style={{fontWeight: "bold", fontSize: 14, textAlign: "center"}}>{`${item.total_required_images} (${item.total_other_images})`}</Text>
            </View>
            <View style={{ width: (listWidth * 0.15), paddingRight: 4, alignContent: "center", justifyContent: "center"}}>
                <Text category='c1' style={{fontWeight: "bold", fontSize: 14, textAlign: "center"}}>{`${item.total_uploaded}`}</Text>
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
                        // uploadImages();
                        if(_isEmpty(user)){
                            setVisible(true);
                        }else{
                            // console.log(user.token);
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

        <Modal visible={visible} backdropStyle={styles.backdrop}>
            <Login setVisible={setVisible} userLogin={userLogin} userLoginError={userLoginError} loginLoading={loginLoading} />
        </Modal>
        </Layout>
    );
}


export default ReportDaily;
