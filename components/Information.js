import React, {useEffect, useState} from 'react';
import { ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity, View, ToastAndroid, Alert  } from 'react-native';
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


const Information = ({navigation, setBeneficiary, route, beneficiary, appConfig, updateBeneficiaries, db}) => {
  const [images, setImages] = useState([]);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if(route.params.beneficiary){
      setBeneficiary(route.params.beneficiary);
    }
    setImages({

    });
  }, []);

  const viewFullImage = (image, type) => {
    navigation.navigate("Image Preview", {isViewOnly: true, capturedImage: image, capturedImageType: type});
  }
  const addPhotoButton = (hasImage = false, type = null) => {
    if(!hasImage){
      if(beneficiary.validated_date == null || beneficiary.validated_date == ""){
        ToastAndroid.show("Validate first before adding photo.", ToastAndroid.SHORT)
      }else{
        if(type == null){
          navigation.navigate("Camera", {beneficiary: beneficiary});
        }else{
          ImagePicker.launchImageLibrary({mediaType: 'photo'}, (response) => {
            if(response.didCancel){

            }else{
              let dir = `${RNFS.ExternalStorageDirectoryPath}/UCT/temp/`;
              RNFS.mkdir(`${dir}`);
              RNFS.copyFile(response.path,`${dir}/${response.fileName}`);
              let createdImage = `${dir}/${response.fileName}`;
              navigation.navigate("Image Preview", {isViewOnly: false, capturedImage: createdImage, capturedImageType: type});
            }
            
          })
        }
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
              viewFullImage(image, type);
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
  const removeButton = (selectedBeneficiary) => {
    Alert.alert("Hold on!", "Are you sure you want delete validation data and images of this person?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel"
      },
      { text: "YES", onPress: () => {
        removeValidation(selectedBeneficiary)
      } }
    ]);
  }
  const removeValidation = async (selectedBeneficiary) => {
    let sql = "";
    sql += `UPDATE potential_beneficiaries set`;
    sql += ` updated_province_name= ?,`;
    sql += ` updated_city_name = ?,`;
    sql += ` updated_barangay_name = ?,`;
    sql += ` updated_lastname = ?,`;
    sql += ` updated_firstname = ?,`;
    sql += ` updated_middlename = ?,`;
    sql += ` updated_extname = ?,`;
    sql += ` updated_birthday = ?,`;
    sql += ` updated_sex = ?,`;
    sql += ` updated_purok = ?,`;
    sql += ` remarks = ?,`;
    sql += ` status = ?,`;
    sql += ` status_reason = ?,`;
    sql += ` rel_hh = ?,`;
    sql += ` validated_firstname = ?,`;
    sql += ` validated_middlename = ?,`;
    sql += ` validated_lastname = ?,`;
    sql += ` validated_extname = ?,`;
    sql += ` validated_birthday = ?,`;
    sql += ` validated_sex = ?,`;
    sql += ` updated_psgc = ?,`;
    sql += ` contact_number = ?,`;
    sql += ` mothers_name = ?,`;
    sql += ` images_path = ?,`;
    sql += ` image_photo = ?,`;
    sql += ` image_valid_id = ?,`;
    sql += ` image_valid_id_back = ?,`;
    sql += ` image_house = ?,`;
    sql += ` image_birth = ?,`;
    sql += ` image_others = ?,`;
    sql += ` validated_date = ?`;
    sql += ` where hhid = ?`;


    selectedBeneficiary.updated_province_name = null;
    selectedBeneficiary.updated_city_name = null;
    selectedBeneficiary.updated_barangay_name = null;
    selectedBeneficiary.updated_lastname = null;
    selectedBeneficiary.updated_firstname = null;
    selectedBeneficiary.updated_middlename = null;
    selectedBeneficiary.updated_extname = null;
    selectedBeneficiary.updated_birthday = null;
    selectedBeneficiary.updated_sex = null;
    selectedBeneficiary.updated_purok = null;
    selectedBeneficiary.remarks = null;
    selectedBeneficiary.status = null;
    selectedBeneficiary.status_reason = null;
    selectedBeneficiary.rel_hh = null;
    selectedBeneficiary.validated_firstname = null;
    selectedBeneficiary.validated_middlename = null;
    selectedBeneficiary.validated_lastname = null;
    selectedBeneficiary.validated_extname = null;
    selectedBeneficiary.validated_birthday = null;
    selectedBeneficiary.validated_sex = null;
    selectedBeneficiary.updated_psgc = null;
    selectedBeneficiary.contact_number = null;
    selectedBeneficiary.mothers_name = null;
    selectedBeneficiary.validated_date = null;


    selectedBeneficiary.images_path = null;
    selectedBeneficiary.image_photo = null;
    selectedBeneficiary.image_valid_id = null;
    selectedBeneficiary.image_valid_id_back = null;
    selectedBeneficiary.image_house = null;
    selectedBeneficiary.image_birth = null;
    selectedBeneficiary.image_others = null;

    let params = [
      selectedBeneficiary.updated_province_name,
      selectedBeneficiary.updated_city_name,
      selectedBeneficiary.updated_barangay_name,
      selectedBeneficiary.updated_lastname,
      selectedBeneficiary.updated_firstname,
      selectedBeneficiary.updated_middlename,
      selectedBeneficiary.updated_extname,
      selectedBeneficiary.updated_birthday,
      selectedBeneficiary.updated_sex,
      selectedBeneficiary.updated_purok,
      selectedBeneficiary.remarks,
      selectedBeneficiary.status,
      selectedBeneficiary.status_reason,
      selectedBeneficiary.rel_hh,
      selectedBeneficiary.validated_firstname,
      selectedBeneficiary.validated_middlename,
      selectedBeneficiary.validated_lastname,
      selectedBeneficiary.validated_extname,
      selectedBeneficiary.validated_birthday,
      selectedBeneficiary.validated_sex,
      selectedBeneficiary.updated_psgc,
      selectedBeneficiary.contact_number,
      selectedBeneficiary.mothers_name,
      selectedBeneficiary.images_path,
      selectedBeneficiary.image_photo,
      selectedBeneficiary.image_valid_id,
      selectedBeneficiary.image_valid_id_back,
      selectedBeneficiary.image_house,
      selectedBeneficiary.image_birth,
      selectedBeneficiary.image_others,
      selectedBeneficiary.validated_date,
      selectedBeneficiary.hhid
  ];
  let fileExist;

  fileExist = await RNFS.exists(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_photo}`);
  if(fileExist){
      RNFS.unlink(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_photo}`);
  }
  fileExist = await RNFS.exists(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_valid_id}`);
  if(fileExist){
      RNFS.unlink(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_valid_id}`);
  }
  fileExist = await RNFS.exists(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_valid_id_back}`);
  if(fileExist){
      RNFS.unlink(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_valid_id_back}`);
  }
  fileExist = await RNFS.exists(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_house}`);
  if(fileExist){
      RNFS.unlink(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_house}`);
  }
  fileExist = await RNFS.exists(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_birth}`);
  if(fileExist){
      RNFS.unlink(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_birth}`);
  }
  fileExist = await RNFS.exists(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_others}`);
  if(fileExist){
      RNFS.unlink(`file://${selectedBeneficiary.images_path}/${selectedBeneficiary.image_others}`);
  }
  // console.log(sql);
  // console.log(params);
  db.transaction((trans) => {
      trans.executeSql(sql, params, (trans, results) => {
          ToastAndroid.show("Removed validation data.", ToastAndroid.SHORT)
          navigation.goBack();
      },
      (error) => {
          console.log(error);
      });
  });
  // console.log(selectedBeneficiary);
  updateBeneficiaries(selectedBeneficiary);
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

          {beneficiary.validated_date ? (
              <View style={{flexDirection: "row", justifyContent: "space-evenly"}}>
                <Button onPress={() => navigation.navigate("Validate Information")}>{beneficiary.validated_date ? "UPDATE BENEFICIARY" : "VALIDATE BENEFICIARY"}</Button>
                <Button status="danger" onPress={() => { removeButton(beneficiary) } }>Remove Validation Data</Button>
              </View>
          ) : (
              <Button onPress={() => navigation.navigate("Validate Information")}>{beneficiary.validated_date ? "UPDATE BENEFICIARY" : "VALIDATE BENEFICIARY"}</Button>
          )}
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
