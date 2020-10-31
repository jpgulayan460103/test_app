import React, {useEffect, useState} from 'react';
import { StyleSheet, TouchableHighlight, View, Dimensions } from 'react-native';
import { Layout, Text, Icon, List, ListItem, Button, IndexPath, Select, SelectItem, Divider, Input } from '@ui-kitten/components';
import RNFetchBlob from 'rn-fetch-blob'
import Share from 'react-native-share';

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
});

const listWidth = Dimensions.get('window').width;

const ReportDaily = ({navigation, route, db}) => {
    const { validated_date, total_images, total_uploaded } = route.params.report;
    const [validatedBeneficiaries, setValidatedBeneficiaries] = useState([]);
    useEffect(() => {
        navigation.setOptions({
          title: `Validated (${validated_date})`,
        });
        getValidatedBeneficiaries();
    }, []);    
    const getValidatedBeneficiaries = () => {
        setValidatedBeneficiaries([]);
        db.transaction((trans) => {
            let sql = "";
            sql += `(count(image_photo) + count(image_valid_id) + count(image_house) + count(image_birth) + count(image_others)) as total_images, `;
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
        // /storage/emulated/0/Download/data.csv
        let url = 'https://awesome.contents.com/';
        let title = 'Awesome Contents';
        let message = 'Please check this out.';

        const shareOptions = {
            title: 'Share file',
            failOnCancel: false,
            url: "file:///storage/emulated/0/Download/data.csv",
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
                <Text category='c1' style={{fontWeight: "bold", fontSize: 14, textAlign: "center"}}>{`${item.total_images}`}</Text>
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
            <Button onPress={() => {shareFile()}}>Share</Button>
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
        </Layout>
    );
}


export default ReportDaily;
