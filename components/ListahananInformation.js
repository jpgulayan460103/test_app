import React, {useEffect, useState} from 'react';
import { StyleSheet, ToastAndroid, View, Dimensions, Modal, TouchableHighlight, RefreshControl, Image, ScrollView } from 'react-native';
import { Layout, Text, List, Button, Divider, Card, Select, SelectItem, Input, Icon } from '@ui-kitten/components';
import ImageViewer from 'react-native-image-zoom-viewer';
import _cloneDeep  from 'lodash/cloneDeep'

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
    tinyLogo: {
        width: width * 0.45,
        height: width * 0.45,
    },
});

const ListahananInformation = ({navigation, route, setBeneficiary, client, user}) => {
    const { beneficiary } = route.params;
    var rand = Math.random();
    useEffect(() => {
        setBeneficiary(beneficiary);
        setBeneficiaryData(beneficiary);
        rand = Math.random();
        setrandString(rand)
    }, []);
    const [viewFull, setViewFull] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [beneficiaryData, setBeneficiaryData] = useState({});
    const [randString, setrandString] = useState(rand);
    const image_signature = beneficiaryData.information && beneficiaryData.information.scanned_attachments ? `http://encoding.uct11.com/images/signatures${beneficiaryData.information.scanned_attachments}?v=${randString}` : "https://www.bengi.nl/wp-content/uploads/2014/10/no-image-available1.png";
    const image_photo = beneficiaryData.information && beneficiaryData.information.scanned_file ? `http://encoding.uct11.com/images/beneficiaries${beneficiaryData.information.scanned_file}?v=${randString}` : "https://www.bengi.nl/wp-content/uploads/2014/10/no-image-available1.png";
    const images = [
        {
            url: image_photo,
        },
        {
            url: image_signature,
        }
    ]
    const onRefresh = async () => {
        setRefreshing(true);
        let options = {
            token: user.token
        }
        let result = await client.get(`/api/v1/beneficiary/${beneficiary.id}`,{params: options});
        let clonedBeneficiary = _cloneDeep(beneficiary);
        clonedBeneficiary.information.scanned_attachments = result.data.beneficiary.information.scanned_attachments;
        clonedBeneficiary.information.scanned_file = result.data.beneficiary.information.scanned_file;
        // console.log(clonedBeneficiary.information.scanned_attachments);
        console.log(clonedBeneficiary.information.scanned_file);
        setBeneficiaryData(clonedBeneficiary);
        setRefreshing(false);
        rand = Math.random();
        setrandString(rand)
    }
    return (
        <Layout style={{flex: 1, padding: 10}}>


        <ScrollView
            contentContainerStyle={styles.scrollView}
            refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={{ flexDirection: "row", justifyContent: 'space-evenly', marginBottom: 10 }}>
                    <View>
                        <Text style={{textAlign: "center"}}>Photo</Text>
                        <TouchableHighlight
        
                            onPress={() => {
                            setViewFull(true);
                            }}>
                        <Image
                            style={styles.tinyLogo}
                            source={{
                            uri: image_photo,
                        }}
                        />
                        </TouchableHighlight>
                    </View>
                    <View>
                    <Text style={{textAlign: "center"}}>Signature</Text>
                    <TouchableHighlight
        
                            onPress={() => {
                            setViewFull(true);
                            }}>
                    <Image
                        style={styles.tinyLogo}
                        source={{
                        uri: image_signature,
                    }}
                    />
                    </TouchableHighlight>
                    </View>
                </View>
                <Text>HHID: {beneficiaryData.uct_id}</Text>
                <Text>Name: {beneficiaryData.full_name}</Text>
                <Text>Province: {beneficiaryData.province_name}</Text>
                <Text>City: {beneficiaryData.city_name}</Text>
                <Text>Barangay: {beneficiaryData.brgy_name}</Text>
                <Text>Birthday: {beneficiaryData.birth_date}</Text>
                {/* <Text>Picture: {image_photo}</Text> */}
                {/* <Text>Signature: {image_signature}</Text> */}
                { beneficiaryData.information && beneficiaryData.information.has_gis ? 
                    <Button onPress={() => {
                        navigation.navigate("Listahanan Camera", {beneficiary});
                    }}>ADD IMAGES</Button>
                : <></> }
        </ScrollView>
                

                <Modal visible={viewFull} transparent={true} onRequestClose={() => setViewFull(false)}>
                    <ImageViewer saveToLocalByLongPress={false} imageUrls={images}/>
                </Modal>
        </Layout>
    );
}


export default ListahananInformation;
