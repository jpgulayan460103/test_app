import React, {useState, useEffect} from 'react';
import { ScrollView, Image, StyleSheet, View, Dimensions, Text, Button, BackHandler, Alert  } from 'react-native';
import _debounce from 'lodash/debounce';

const height = Dimensions.get('window').height; 
const width = Dimensions.get('window').width; 

const styles = StyleSheet.create({
    container: {
      paddingTop: 50,
    },
    tinyLogo: {
      height: height,  //its same to '20%' of device height
      aspectRatio: 1, // <-- this
      resizeMode: "contain",
    },
    logo: {
      width: 66,
      height: 58,
    },
  });
const ImageView = ({savePicture, pictureTaken, deletePicture, route, navigation}) => {
  const { isViewOnly, capturedImage, capturedImageType } = route.params;
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    pictureTaken(capturedImage,capturedImageType)
    const backAction = () => {
      if(isViewOnly){
        navigation.goBack()
        return true;
      }
      Alert.alert("Hold on!", "Are you sure you want to go back without saving?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { text: "YES", onPress: () => {
          deletePicture(capturedImage, isViewOnly)
          navigation.goBack()
        } }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);
  const delayedSavePicture = _debounce(()=>{
    setLoading(true);
    navigation.goBack();
    savePicture();
  }, 250);
  const delayedDeletePicture = _debounce(() => {
    setLoading(true);
    navigation.goBack();
    deletePicture(capturedImage, isViewOnly);
  },250);
  return (
    <View style={{ flex: 1 }}>
      {!isViewOnly ? (
        <View style={{ justifyContent: "space-evenly", flexDirection: "row", padding: 10 }}>
          <View style={{width:120}}>
              <Button title="Save" onPress={delayedSavePicture} disabled={isViewOnly || loading} />
          </View>
          <View style={{width:120}}>
              <Button disabled={loading} title="Delete" color="#ff0000" onPress={delayedDeletePicture} />
          </View>
      </View>
      ) : (<></>)}
      <ScrollView>
        <ScrollView horizontal>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10}}>
              <Image
              style={styles.tinyLogo}
              source={{uri:`file://${capturedImage}`}}
              />
          </View>
          </ScrollView>
        </ScrollView>
    </View>
  );
}

export default ImageView;
