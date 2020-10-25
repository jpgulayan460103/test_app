import React, {useEffect} from 'react';
import { ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity, View  } from 'react-native';
import { Layout, Text, Divider } from '@ui-kitten/components';

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
const Information = ({beneficiary, changePicture, navigation}) => {
  const viewFullImage = () => {
    navigation.navigate("Image Preview", {isViewOnly: true});
  }
  const ImagePreview = ({image, desc}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          viewFullImage();
          changePicture(image)
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
