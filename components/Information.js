import React, {useEffect, useState} from 'react';
import { ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity, View  } from 'react-native';
import { Layout, Text, Divider } from '@ui-kitten/components';
import axios from 'axios';
import FormData from 'form-data';
import ImgToBase64 from 'react-native-image-base64';
var RNFS = require('react-native-fs');


const styles = StyleSheet.create({
    container: {
      paddingTop: 50,
    },
    tinyLogo: {
      width: Dimensions.get('window').width * 0.45,
      height: Dimensions.get('window').width * 0.45,
      margin: 2
    },
    logo: {
      width: 66,
      height: 58,
    },
  });
const Information = ({navigation, setBeneficiary, route}) => {
  const { beneficiary, capturedImage, capturedImageType } = route.params;
  const [images, setImages] = useState([]);
  useEffect(() => {
    setBeneficiary(beneficiary);
    navigation.setOptions({
      title: `Your Updated Title`,
    })
    setImages({

    });
  }, []);
  const testedUpload = async () => {
    let image_photo = await ImgToBase64.getBase64String(`file://${beneficiary.image_photo}`);
    let image_valid_id = await ImgToBase64.getBase64String(`file://${beneficiary.image_valid_id}`);
    let image_house = await ImgToBase64.getBase64String(`file://${beneficiary.image_house}`);
    let image_birth = await ImgToBase64.getBase64String(`file://${beneficiary.image_birth}`);
    let image_others = await ImgToBase64.getBase64String(`file://${beneficiary.image_others}`);

    const formData = new FormData();
    formData.append('beneficiary', beneficiary);
    formData.append('image_photo', image_photo);
    formData.append('image_valid_id', image_valid_id);
    formData.append('image_house', image_house);
    formData.append('image_birth', image_birth);
    formData.append('image_others', image_others);
    const client = axios.create({
        baseURL: 'http://10.0.2.2:8000/',
    });
    const headers = {
        // Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
    }
    client.post('/api/test-upload', formData, headers)
    .then(res => {
        console.log(res.data);
    })
    .catch(err => {
        console.log(err);
    });
  }
  const viewFullImage = (image) => {
    navigation.navigate("Image Preview", {isViewOnly: true, capturedImage: image, capturedImageType: "image_photo"});
  }
  const ImagePreview = ({image, desc}) => {
    return (
      <View style={{paddingLeft: 10}}>
        <Text>{desc}</Text>
        <TouchableOpacity
          onPress={async () => {
            viewFullImage(image);
          // client.post('/api/test-upload', formData, headers);
        }}>
        <Image
          style={styles.tinyLogo}
          source={{uri:`file://${image}`}}
        />

        </TouchableOpacity>
      </View>
    )
  }
  return (
  <Layout style={{flex: 1}}>
        <View style={{padding: 10}}>
          <Text>HHID: {beneficiary.hhid}</Text>
          <Text>Name: {beneficiary.fullname}</Text>
          <Text>Birthdate: {beneficiary.birthday}</Text>
          <Text>Barangay: {beneficiary.barangay_name}</Text>
          <Text>City/Municipality: {beneficiary.city_name}</Text>
          <Text>Province: {beneficiary.province_name}</Text>
          <Text>Date Validated: {beneficiary.validated_date}</Text>
        </View>
        <Divider />
        <ScrollView>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          {beneficiary.image_photo ? (<ImagePreview desc="PHOTO" image={`${beneficiary.images_path}/${beneficiary.image_photo}`} />) : (<></>)}
          {beneficiary.image_valid_id ? (<ImagePreview desc="VALID ID" image={`${beneficiary.images_path}/${beneficiary.image_valid_id}`} />) : (<></>)}
        </Layout>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          {beneficiary.image_house ? (<ImagePreview desc="HOUSE" image={`${beneficiary.images_path}/${beneficiary.image_house}`} />) : (<></>)}
          {beneficiary.image_birth ? (<ImagePreview desc="BIRTH CERTIFICATE" image={`${beneficiary.images_path}/${beneficiary.image_birth}`} />) : (<></>)}
        </Layout>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          {beneficiary.image_others ? (<ImagePreview desc="OTHERS" image={`${beneficiary.images_path}/${beneficiary.image_others}`} />) : (<></>)}
        </Layout>
    </ScrollView>
    </Layout>
  );
}

export default Information;
