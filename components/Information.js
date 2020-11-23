import React, {useEffect, useState} from 'react';
import { ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity, View, ToastAndroid  } from 'react-native';
import { Layout, Text, Divider, Button, Icon } from '@ui-kitten/components';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob'
import RNFS from 'react-native-fs';

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


const Information = ({navigation, setBeneficiary, route, beneficiary, appConfig}) => {
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
  const addPhotoButton = (hasImage, type) => {
    if(!hasImage){
      if(beneficiary.validated_date == null || beneficiary.validated_date == ""){
        ToastAndroid.show("Validate first before adding photo.", ToastAndroid.SHORT)
      }else{
        ImagePicker.launchImageLibrary({mediaType: 'photo'}, (response) => {
          console.log(response.fileName);
          let dir = `${RNFS.ExternalStorageDirectoryPath}/UCT/temp/`;
          RNFS.mkdir(`${dir}`);
          RNFS.copyFile(response.path,`${dir}/${response.fileName}`);
          let createdImage = `${dir}/${response.fileName}`;
          navigation.navigate("Image Preview", {isViewOnly: false, capturedImage: createdImage, capturedImageType: type});
        })
      }
    }
  }
  const ImagePreview = ({image, desc, hasImage, type, addPhotoButton}) => {
    let rand = Math.random();
    return (
      <View style={{paddingLeft: 10}}>
        <Text>{desc}</Text>
        <TouchableOpacity
          onPress={async () => {
            if(hasImage){
              viewFullImage(image);
            }else{
              addPhotoButton(hasImage,type);
            }
        }}>
        {hasImage ? (
          <Image
            style={styles.tinyLogo}
            source={{uri:`file://${image}?v=${rand}`}}
          />
        ) : (
          <Icon
            style={styles.tinyLogo}
            fill='#8F9BB3'
            name='image-outline'
          />
        )}

        </TouchableOpacity>
      </View>
    )
  }
  return (
  <Layout style={{flex: 1}}>
        <View style={{padding: 10}}>
          { appConfig.region != "XI" ? (
            <Text>Type: {beneficiary.type}</Text>
          ): (<></>) }
          <Text>HHID: {beneficiary.hhid}</Text>
          <Text>Name: {beneficiary.fullname}</Text>
          <Text>Birthdate: {beneficiary.birthday}</Text>
          <Text>Barangay: {beneficiary.barangay_name}</Text>
          <Text>City/Municipality: {beneficiary.city_name}</Text>
          <Text>Province: {beneficiary.province_name}</Text>
          <Text>Date Validated: {beneficiary.validated_date}</Text>
          <View>
            <Button onPress={() => navigation.navigate("Validate Information")}>VALIDATE BENEFICIARY</Button>
          </View>
        </View>
        <Divider />
        <ScrollView>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          <View style={{paddingLeft: 10}}>
          <Text>ADD PHOTO</Text>
          <TouchableOpacity
            onPress={async () => {
              addPhotoButton()
          }}>
            <Icon
              style={styles.tinyLogo}
              fill='#8F9BB3'
              name='camera-outline'
            />
          </TouchableOpacity>
        </View>
          <ImagePreview addPhotoButton={addPhotoButton} hasImage={beneficiary.image_photo != null} type="image_photo" desc="PHOTO" image={`${beneficiary.images_path}/${beneficiary.image_photo}`} />
        </Layout>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          <ImagePreview addPhotoButton={addPhotoButton} hasImage={beneficiary.image_valid_id != null} type="image_valid_id" desc="VALID ID FRONT" image={`${beneficiary.images_path}/${beneficiary.image_valid_id}`} />
          <ImagePreview addPhotoButton={addPhotoButton} hasImage={beneficiary.image_valid_id_back != null} type="image_valid_id_back" desc="VALID ID BACK" image={`${beneficiary.images_path}/${beneficiary.image_valid_id_back}`} />
        </Layout>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          <ImagePreview addPhotoButton={addPhotoButton} hasImage={beneficiary.image_house != null} type="image_house" desc="HOUSE" image={`${beneficiary.images_path}/${beneficiary.image_house}`} />
          <ImagePreview addPhotoButton={addPhotoButton} hasImage={beneficiary.image_birth != null} type="image_birth" desc="BIRTH CERTIFICATE" image={`${beneficiary.images_path}/${beneficiary.image_birth}`} />
        </Layout>
        <Layout style={{flex: 1, flexDirection: "row",marginTop: 20}}>
          <ImagePreview addPhotoButton={addPhotoButton} hasImage={beneficiary.image_others != null} type="image_others" desc="OTHERS" image={`${beneficiary.images_path}/${beneficiary.image_others}`} />
        </Layout>
    </ScrollView>
    </Layout>
  );
}

export default Information;
