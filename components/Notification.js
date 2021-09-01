import React, {useEffect, useState} from 'react';
import { StyleSheet, TouchableHighlight, View, ToastAndroid, TouchableOpacity } from 'react-native';
import { Layout, Text, Icon, List, ListItem, Button, IndexPath, Select, SelectItem, Divider, Input } from '@ui-kitten/components';
import Qrscanner from './Qrscanner'
import { isEmpty } from 'lodash';


const Notification = ({navigation, reportDates, db, route}) => {

    const { beneficiary } = route.params;
    const [showCam, setShowCam] = useState(true);
    const [scannedValue, setScannedValue] = useState("");
    const [scannedBeneficiary, setScannedBeneficiary] = useState({});

    useEffect(() => {
      if(!isEmpty(beneficiary)){
        setScannedBeneficiary(beneficiary);
        setShowCam(false);
      }
    }, []);

    //actions
    const getScannedValue = (value) => {
        setScannedValue(value);
        setShowCam(!showCam)
        getBeneficiaryData(value);
    }

    const toggleCamera = () => {
        if(!showCam){
            setScannedValue("");
            setScannedBeneficiary({});
        }
        setShowCam(!showCam)
    }

    const tagBeneficiary = () => {
      let d = new Date;
      let datetime_claimed = d.getTime();
      let date_scanned = d.toLocaleDateString();
      db.transaction((trans) => {
        trans.executeSql("update cashcard set is_claimed = 1, date_scanned = ?, datetime_claimed = ? where hhid = ?", [date_scanned, datetime_claimed, scannedBeneficiary.hhid], (trans, results) => {
          toggleCamera();
          ToastAndroid.show("Successfully tagged as claimed", ToastAndroid.SHORT);
        },
        (error) => {
          console.log(error);
        });
      });
    }

    const getBeneficiaryData = (hhid) => {
        setScannedBeneficiary({});
        db.transaction((trans) => {
          trans.executeSql("select * from cashcard where hhid = ?", [hhid], (trans, results) => {
            let items = [];
            let rows = results.rows;
            if(rows.length != 0){
              for (let i = 0; i < rows.length; i++) {
                var item = rows.item(i);
                items.push(item);
              }
              setScannedBeneficiary(items[0])
            }else{
            //   ToastAndroid.show("No beneficiaries found.", ToastAndroid.SHORT)
            }
            // setProvinces(items);
          },
          (error) => {
            console.log(error);
          });
        });
      }
    return (
        <Layout style={{ flex: 1, padding: 10}}>
            <View style={{ padding: 20, flex: 0.5, flexDirection: "row", alignItems: 'center' }}>
                <View style={{flex: 1, alignItems: "center" }}>
                
                { showCam ? <Qrscanner getScannedValue={getScannedValue} /> : <></> }

                
                
                </View>
            </View>
            <View style={{flex: 1}}>
                <Text><Text style={{fontWeight: "bold"}}>QR CODE:</Text> {scannedValue}</Text>
                { !isEmpty(scannedBeneficiary) ? (
                <>
                <Text><Text style={{fontWeight: "bold"}}>HHID:</Text> {scannedBeneficiary.hhid}</Text>
                <Text><Text style={{fontWeight: "bold"}}>Last Name:</Text> {scannedBeneficiary.last_name}</Text>
                <Text><Text style={{fontWeight: "bold"}}>First Name:</Text> {scannedBeneficiary.first_name}</Text>
                <Text><Text style={{fontWeight: "bold"}}>Middle Name:</Text> {scannedBeneficiary.middle_name}</Text>
                <Text><Text style={{fontWeight: "bold"}}>Birth Date:</Text> {scannedBeneficiary.birthday}</Text>
                <Text><Text style={{fontWeight: "bold"}}>Mothers Name:</Text> {scannedBeneficiary.last_name}</Text>
                <Text><Text style={{fontWeight: "bold"}}>Mobile Number:</Text> {scannedBeneficiary.mobile}</Text>
                <Text><Text style={{fontWeight: "bold"}}>Province:</Text> {scannedBeneficiary.province}</Text>
                <Text><Text style={{fontWeight: "bold"}}>City:</Text> {scannedBeneficiary.city}</Text>
                <Text><Text style={{fontWeight: "bold"}}>Barangay:</Text> {scannedBeneficiary.barangay}</Text>
                <Text><Text style={{fontWeight: "bold"}}>Branch:</Text> {scannedBeneficiary.branch_name}</Text>
                {/* <Text><Text style={{fontWeight: "bold"}}>Card Number:</Text> {scannedBeneficiary.card_number}</Text> */}
                { scannedBeneficiary.is_claimed == 1 ? <Text><Text style={{fontWeight: "bold"}}>Date Scanned:</Text> {scannedBeneficiary.date_scanned}</Text> : <></> }

                </>
                ) : <></> }
                
            </View>
            { !isEmpty(scannedBeneficiary) ? (
            <View style={{flex: 0.2, alignItems: 'center', justifyContent: 'space-evenly', flexDirection: "row", marginTop: 10}}>
              <Button status="danger" disabled={scannedBeneficiary?.is_claimed == 1} onPress={() => tagBeneficiary()} style={{width: 140}}>
                { scannedBeneficiary?.is_claimed == 1 ? "Claimed" : "Tag as Claimed"}
              </Button>
              <Button status="info" onPress={() => navigation.navigate('Listahanan Home', {search: scannedBeneficiary.hhid})}  style={{width: 180}}>
                View Listahanan Data
              </Button>
            </View>
            ) : <></> }

            <View style={{flex: 0.2, alignItems: 'center', justifyContent: 'space-evenly', flexDirection: "row", marginTop: 10}}>
              { !showCam ? <Button onPress={() => toggleCamera()}  style={{width: 140}}>
                  Scan QRCode
                </Button>: <></> }
              <Button status="info" onPress={() => navigation.navigate('Cashcardclaimed', {typeView: "claimed"})}  style={{width: 180}}>
                Claimed Cashcard
              </Button>
            </View>
            
        </Layout>
    );
}


export default Notification;
