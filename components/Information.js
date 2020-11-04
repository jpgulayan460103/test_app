import React, {useEffect, useState} from 'react';
import { ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity, View, ToastAndroid  } from 'react-native';
import { Layout, Text, Divider, Button, Icon } from '@ui-kitten/components';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;


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


const Information = ({navigation, setBeneficiary, route, beneficiary, db, updateBeneficiaries}) => {
  const [images, setImages] = useState([]);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if(route.params.beneficiary){
      setBeneficiary(route.params.beneficiary);
    }
    setImages({

    });
  }, []);

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
          <View>
            <Button onPress={() => navigation.navigate("Validate Information")}>Validate Information</Button>
          </View>
        </View>
        <Divider />
        <ScrollView>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          <View style={{paddingLeft: 10}}>
          <Text>ADD PHOTO</Text>
          <TouchableOpacity
            onPress={async () => {
              if(beneficiary.validated_date == null || beneficiary.validated_date == ""){
                ToastAndroid.show("Validate first before adding photo.", ToastAndroid.SHORT)
              }else{
                navigation.navigate("Camera", {beneficiary: beneficiary});
              }
          }}>
            <Icon
              style={styles.tinyLogo}
              fill='#8F9BB3'
              name='image-outline'
            />
          </TouchableOpacity>
        </View>
          {beneficiary.image_photo ? (<ImagePreview desc="PHOTO" image={`${beneficiary.images_path}/${beneficiary.image_photo}`} />) : (<></>)}
        </Layout>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          {beneficiary.image_valid_id ? (<ImagePreview desc="VALID ID" image={`${beneficiary.images_path}/${beneficiary.image_valid_id}`} />) : (<></>)}
          {beneficiary.image_house ? (<ImagePreview desc="HOUSE" image={`${beneficiary.images_path}/${beneficiary.image_house}`} />) : (<></>)}
        </Layout>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          {beneficiary.image_birth ? (<ImagePreview desc="BIRTH CERTIFICATE" image={`${beneficiary.images_path}/${beneficiary.image_birth}`} />) : (<></>)}
          {beneficiary.image_others ? (<ImagePreview desc="OTHERS" image={`${beneficiary.images_path}/${beneficiary.image_others}`} />) : (<></>)}
        </Layout>
    </ScrollView>
    </Layout>
  );
}

export default Information;
