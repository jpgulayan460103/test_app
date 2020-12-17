import React, {useEffect, useState} from 'react';
import { StyleSheet, ToastAndroid, View, Dimensions, Modal, TouchableHighlight, RefreshControl, Image } from 'react-native';
import { Layout, Text, List, Button, Divider, Card, Select, SelectItem, Input, Icon } from '@ui-kitten/components';
import ImageViewer from 'react-native-image-zoom-viewer';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
    tinyLogo: {
        width: width * 0.45,
        height: width * 0.45,
    },
});


const ListahananInformation = ({navigation, route}) => {
    const { beneficiary } = route.params;
    const [viewFull, setViewFull] = useState(false);
    const image_photo = beneficiary.information && beneficiary.information.scanned_attachments ? `http://encoding.uct11.com/images/beneficiaries${beneficiary.information.scanned_attachments}` : "https://www.bengi.nl/wp-content/uploads/2014/10/no-image-available1.png";
    const image_signature = beneficiary.information && beneficiary.information.scanned_file ? `http://encoding.uct11.com/images/signatures${beneficiary.information.scanned_file}` : "https://www.bengi.nl/wp-content/uploads/2014/10/no-image-available1.png";
    const images = [
        {
            url: image_photo,
        },
        {
            url: image_signature,
        }
    ]
    return (
        <Layout style={{flex: 1, padding: 10}}>
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
                <Text>HHID: {beneficiary.uct_id}</Text>
                <Text>Name: {beneficiary.full_name}</Text>
                <Text>Province: {beneficiary.province_name}</Text>
                <Text>City: {beneficiary.city_name}</Text>
                <Text>Barangay: {beneficiary.brgy_name}</Text>

                <Modal visible={viewFull} transparent={true} onRequestClose={() => setViewFull(false)}>
                    <ImageViewer saveToLocalByLongPress={false} imageUrls={images}/>
                </Modal>
        </Layout>
    );
}


export default ListahananInformation;
