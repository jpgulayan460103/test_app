import React, {useEffect, useState} from 'react';
import { StyleSheet, ToastAndroid, View, Dimensions, Modal, TouchableOpacity, RefreshControl } from 'react-native';
import { Layout, Text, List, Button, CheckBox, Card } from '@ui-kitten/components';
import RNFetchBlob from 'rn-fetch-blob'
import Share from 'react-native-share';
import { zip } from 'react-native-zip-archive'
import RNFS from 'react-native-fs';
import _debounce  from 'lodash/debounce'
import _cloneDeep  from 'lodash/cloneDeep'
import _isEmpty  from 'lodash/isEmpty'
import _forEach  from 'lodash/forEach'
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

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const ReportCashcardDaily = ({navigation, route, db, client, user, setUser, appConfig}) => {
    const { date_scanned, total_images, total_uploaded, count_updated, count_hhid } = route.params.report;
    const [scannedSummary, setScannedSummary] = useState([]);
    const [generatedReportPath, setGeneratedReportPath] = useState("");
    const [uploadedBarangay, setUploadedBarangay] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState({});
    const [uploadingProgess, setUploadingProgess] = useState("");
    const [userLoginError, setUserLoginError] = useState({
        error: "",
    });
    const [loginString, setLoginString] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [uploadFeedback, setUploadFeedback] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loadingPercentage, setLoadingPercentage] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [hasUploaded, setHasUploaded] = useState(false);
    const [uploadedSummary, setUploadedSummary] = useState({
        beneficiaries: 0,
        uploaded: 0,
        failed: 0,
    });

    useEffect(() => {
        navigation.setOptions({
          title: `Validated (${date_scanned})`,
        });
        if(appConfig.upload_url != null){
            client.defaults.baseURL = appConfig.upload_url;
            // client.defaults.baseURL = 'http://10.0.2.2:8000/';
        }
        getScannedSummary();
    }, []);

    const userLogin = async (data) => {
        try {
            console.log(client.defaults.baseURL);
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

    
    
    const getScannedSummary = () => {
        setScannedSummary([]);
        db.transaction((trans) => {
            let sql = "";
            sql += `sum(case when is_uploaded = 1 then 1 else 0 end) count_updated, `;
            sql += `count(hhid) as count_hhid, `;
            trans.executeSql(`select ${sql} city, barangay, province, date_scanned from cashcard where date_scanned = ? group by barangay, city, province order by barangay, city, province`, [date_scanned], (trans, results) => {
                let items = [];
                let rows = results.rows;
                // console.log(rows.length);
                for (let i = 0; i < rows.length; i++) {
                    var item = rows.item(i);
                    item.selected = false;
                    items.push(item);
                }
                setScannedSummary(items);
            },
            (error) => {
                console.log(error);
            });
        });
    }



    const generateReport = _debounce(async () => {
        setLoading(true);
        let d = new Date();
        let timeGenerated = `${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`;
        makeCsv(timeGenerated);
    }, 250);

    const getBeneficiaries = ({city, barangay, province, count_hhid}) => {
        return new Promise((resolve, reject) => db.transaction(tx => {
            db.transaction((trans) => {
                let sql = "select * from cashcard where city = ? and barangay = ? and province = ? and date_scanned = ? order by datetime_claimed desc";
                trans.executeSql(sql, [city,barangay,province,date_scanned], (trans, results) => {
                    let items = [];
                    let rows = results.rows;
                    for (let i = 0; i < rows.length; i++) {
                        var item = rows.item(i);
                        item.selected = false;
                        items.push(item);
                    }
                    // console.log(items);
                    resolve(items);
                },
                (error) => {
                    console.log(error);
                    reject(error);
                });
            });
        }))
    }

    const makeCsv = async (timeGenerated) => {
        let headerString = '';
        headerString += `hhid,`;
        headerString += `full_name,`;
        headerString += `city,`;
        headerString += `barangay,`;
        headerString += `province,`;
        headerString += `datetime_claimed,`;
        headerString += '\n';
        let scanned = scannedSummary.filter(item => item.selected == true);
        setLoading(false);
        
        let csvString = `${headerString}`;
        let dirDate = date_scanned.split("/").join("-");
        let pathToWrite = `${RNFS.ExternalStorageDirectoryPath}/UCT/Cashcard/uct-cash-card-${dirDate}.csv`;
        
        
        let i = 0;
        _forEach(scanned, async function(value, key) {
            let beneficiaries = await getBeneficiaries(value)
            let rowString = beneficiaries.map(item => {
                let string = "";
                string += `"${item.hhid}",`
                string += `"${item.full_name}",`
                string += `"${item.city}",`
                string += `"${item.barangay}",`
                string += `"${item.province}",`
                string += `"${item.datetime_claimed}",`
                string += '\n';
                return string;
            }).join('');
            csvString += `${rowString}`;
            i++;
            if(scanned.length == i){
                console.log(csvString);
                let fileExist = await RNFS.exists(pathToWrite);
                if(fileExist){
                    await RNFS.unlink(pathToWrite);
                }
                RNFetchBlob.fs.writeFile(pathToWrite, csvString, 'utf8')
                .then(() => {
                    console.log(`wrote file ${pathToWrite}`);
                    setGeneratedReportPath(pathToWrite);
                })
                .catch(error => console.error(error));
            }
        })
        return false;
    }

    const uploadScanned = async () => {
        setLoadingPercentage("");
        let scanned = scannedSummary.filter(item => item.selected == true);
        let scannedTotalBeneficiary = scannedSummary.reduce((sum, b) => {
            return sum += b.count_hhid;
        }, 0);
        setUploading(true);
        let i = 0;
        let uploadedCount = 0;
        for (let index = 0; index < scanned.length; index++) {
            let value = scanned[index];
            setUploadedBarangay(value.barangay);
            let beneficiaries = await getBeneficiaries(value);
            let hhids = beneficiaries.map(item => item.hhid);
            let formData = {
                hhids,
                date_scanned
            };
            let upload = await uploadToServer(formData, i);
            uploadedCount+=upload.response.hhids.length;
            if(upload.status == "ok"){
                let updateBeneficiary = await updateUploadedBeneficiaries(upload.response.hhids);
            }
        }
        setHasUploaded(true);
        setUploadedSummary({
            beneficiaries: scannedTotalBeneficiary,
            uploaded: uploadedCount,
            failed: (scannedTotalBeneficiary-uploadedCount)
        });
        setLoadingPercentage("");
        setUploading(false);
    }

    const uploadToServer = async (formData, count) => {
        return new Promise(async (resolve, reject) => {
            try {
                formData.token = user.token;
                let config = {
                    onUploadProgress: function(progressEvent) {
                        var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                        setLoadingPercentage(`${percentCompleted}%`);
                    }
                }
                let uploadImageApi = await client.post('/api/v1/cashcard-mobile-upload', formData, config);
                resolve({
                    status: "ok",
                    response: uploadImageApi.data,
                });
            } catch (error) {
                reject({
                    status: "error",
                    error
                });
            }
        });
    }

    const updateUploadedBeneficiaries = (hhids, count) => {
        return new Promise(async (resolve, reject) => {
            let mappedHhids = hhids.map(item => {
                return `"${item}"`;
            });
            let hhids_string = mappedHhids.join(",");
            db.transaction((trans) => {
                let sql = `update cashcard set is_uploaded = 1 where hhid in (${hhids_string})`;
                trans.executeSql(sql, [], (trans, results) => {
                    let items = [];
                    let rows = results.rows;
                    for (let i = 0; i < rows.length; i++) {
                        var item = rows.item(i);
                        item.selected = false;
                        items.push(item);
                    }
                    resolve(items);
                },
                (error) => {
                    console.log(error);
                    reject(error);
                });
            });
        })
    }

    const displayFeedback = (beneficiary) => {
        let feedback = uploadFeedback.filter(item => item.beneficiary.hhid == beneficiary.hhid);
        if(!_isEmpty(feedback)){
            if(feedback[0].status == "error"){
                return {color: "red"};
            }else{
                return {color: "green"};
            }
        }
        return {};
    }

    const displayErrors = (beneficiary) => {
        let filtered = uploadFeedback.filter(item => item.beneficiary.hhid == beneficiary.hhid);
        if(!_isEmpty(filtered)){
            let filteredBeneficiary = filtered[0];
            let errors = [];
            errors.push(<Text category="h6" key={`error_beneficiary_name`}>{filteredBeneficiary.beneficiary.fullname}</Text>);
            errors.push(<Text key={`error_status`}>Upload Status: {filteredBeneficiary.status}</Text>);
            _forEach(filteredBeneficiary.errors, function(value, key) {
                errors.push(
                    <Text key={`error_${key}`}> - {value[0]}</Text>
                );
            })
            return errors;
        }
        return null;
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
            
            <TouchableOpacity onPress={() => {
                // navigation.navigate("Beneficiary Information", {beneficiary: item});
            }}>
                <View style={{ width: (width * 0.55), paddingRight: 4}}>
                    <Text category='c1'>{`${item.barangay}, ${item.city}\n${item.province}`}</Text>
                </View>
            </TouchableOpacity>
            <View style={{ width: (width * 0.15), paddingRight: 4, alignContent: "center", justifyContent: "center"}}>
                <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>{`${item.count_hhid}`}</Text>
            </View>
            <TouchableOpacity onPress={() => {
                setSelectedBeneficiary(item);
                let filtered = uploadFeedback.filter(feedback => feedback.beneficiary.hhid == item.hhid);
                if(!_isEmpty(filtered)){
                    setShowErrors(true);
                }
            }} style={{alignContent: "center", justifyContent: "center"}}>
                <View style={{ width: (width * 0.15), paddingRight: 4}}>
                    <Text style={{color: "red"}}>
                        <Text category='c1' style={{fontWeight: "bold", fontSize: 14, textAlign: "center", ...displayFeedback(item) }}>{`${item.count_updated}`}</Text>
                    </Text>
                </View>
            </TouchableOpacity>
            <View style={{ width: (width * 0.10), paddingRight: 4, alignContent: "center", justifyContent: "center"}}>
                <CheckBox
                    checked={item.selected}
                    onChange={nextChecked => {
                        let clonedValidated = _cloneDeep(scannedSummary);
                        clonedValidated[index].selected = nextChecked;
                        if(!nextChecked){
                            setSelectAll(nextChecked);
                        }
                        setScannedSummary(clonedValidated);
                    }}>
                    
                </CheckBox>
                {/* <Text style={{textAlign: "center"}}></Text> */}
            </View>
        </View>
    );

    return (
        <Layout style={{flex: 1, padding: 10}}>
            <Text>Validation Date: {date_scanned}</Text>
            <Text>Validated Beneficiaries: {count_hhid}</Text>
            <Text>Uploaded Beneficiaries: {count_updated}</Text>
            { !_isEmpty(user) ? (<>
                <Text>User: {user.user.full_name} ({user.user.username})</Text>
            </>) : (<></>) }
            
            { uploading ? (
                <Text>Uploading {uploadedBarangay} Progress: {uploadingProgess} {loadingPercentage}</Text>
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
                    <Button status={_isEmpty(user) ? "danger" : "info"} onPress={() => {
                        if(_isEmpty(user)){
                            setVisible(true);
                        }else{
                            uploadScanned();
                        }
                    }} disabled={uploading}>{uploading ? `Uploading` :  (_isEmpty(user) ? "Login" : "Upload") } </Button>
                </View>
            </View>
            { generatedReportPath != "" ? (
                <View>
                    {/* <Text>Generated Report:</Text> */}
                    {/* <Text>{generatedReportPath}</Text> */}
                </View>
            ) : (<></>) }

            { hasUploaded ? <>
                <Text>Upload Summary:</Text>
                <Text>Submitted Beneficiaries: {uploadedSummary.beneficiaries}</Text>
                <Text>Updated: {uploadedSummary.uploaded}</Text>
                <Text>Failed to Update: {uploadedSummary.failed}</Text>
            </> : <></>}
            
            
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
                <View style={{ width: (width * 0.45), paddingRight: 4}}>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                        Beneficiary
                    </Text>
                </View>
                <View style={{ width: (width * 0.20), paddingRight: 4, alignContent: "center", justifyContent: "center"}}>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14, textAlign: "center"}}>
                        Claimed
                    </Text>
                </View>
                <View style={{ width: (width * 0.20), paddingRight: 4, alignContent: "center", justifyContent: "center"}}>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14, textAlign: "center"}}>
                        Uploaded
                    </Text>
                </View>
                <View style={{ width: (width * 0.17), paddingRight: 4, alignContent: "center", justifyContent: "center"}}>
                    <CheckBox
                        checked={selectAll}
                        onChange={nextChecked => {
                            let clonedValidated = _cloneDeep(scannedSummary);
                            clonedValidated.map(item => {
                                item.selected = nextChecked;
                                return item;
                            });
                            setScannedSummary(clonedValidated);
                            setSelectAll(nextChecked);
                        }}>
                    </CheckBox>
                </View>
            </View>
            <List
                data={scannedSummary}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => {
                        setRefreshing(true);
                        getScannedSummary();
                        setRefreshing(false);
                    }} />
                }
            />
            <Text style={{textAlign: "center"}}>Pull down to refresh</Text>

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

            <Modal
                animationType="slide"
                transparent={true}
                visible={showErrors}
                onRequestClose={() => {

                }}
            >
                <View style={styles.centeredView}>
                    <Card disabled={true} style={{width: width*0.8}}>
                        { displayErrors(selectedBeneficiary) }
                        <Button onPress={() => {
                            setShowErrors(false);
                        }} style={{marginTop: 10}}>
                            Close
                        </Button>
                    </Card>
                </View>
            </Modal>
        </Layout>
    );
}


export default ReportCashcardDaily;
