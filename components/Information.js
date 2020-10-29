import React, {useEffect} from 'react';
import { ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity, View  } from 'react-native';
import { Layout, Text, Divider } from '@ui-kitten/components';
import axios from 'axios';
import FormData from 'form-data';


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
  useEffect(() => {
    setBeneficiary(beneficiary);
  }, []);
  const viewFullImage = (image) => {
    navigation.navigate("Image Preview", {isViewOnly: true, capturedImage: image, capturedImageType: "image_photo"});
  }
  const ImagePreview = ({image, desc}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          // viewFullImage(image);
          let data = {
            test: "sadasdasd",
          };
          const formData = new FormData();
          formData.append('test', data.test);
          let images = [
            {uri: `file://${beneficiary.image_photo}`},
            {uri: `file://${beneficiary.image_valid_id}`},
            {uri: `file://${beneficiary.image_house}`},
            {uri: `file://${beneficiary.image_birth}`},
            {uri: `file://${beneficiary.image_others}`},
          ];
          images.forEach((image, i) => {
            formData.append('images', {
              ...image,
              uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
              name: `image-${i}`,
              type: 'image/jpeg', // it may be necessary in Android. 
            });
          });
          console.log(formData);
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
          // client.post('/api/test-upload', formData, headers);
        }}>
      <View style={{paddingLeft: 10}}>
        <Text>{desc}</Text>
        <Image
          style={styles.tinyLogo}
          source={{uri:`file://${image}`}}
        />
      </View>
      </TouchableOpacity>
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
        </View>
        <Divider />
        <ScrollView>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          {beneficiary.image_photo ? (<ImagePreview desc="PHOTO" image={beneficiary.image_photo} />) : (<></>)}
          {beneficiary.image_valid_id ? (<ImagePreview desc="VALID ID" image={beneficiary.image_valid_id} />) : (<></>)}
        </Layout>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          {beneficiary.image_house ? (<ImagePreview desc="HOUSE" image={beneficiary.image_house} />) : (<></>)}
          {beneficiary.image_birth ? (<ImagePreview desc="BIRTH CERTIFICATE" image={beneficiary.image_birth} />) : (<></>)}
        </Layout>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          {beneficiary.image_others ? (<ImagePreview desc="OTHERS" image={beneficiary.image_others} />) : (<></>)}
        </Layout>
    </ScrollView>
    </Layout>
  );
}

export default Information;
