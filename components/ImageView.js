import React, {useState, useEffect} from 'react';
import { TouchableHighlight, Image, StyleSheet, View, Dimensions, Text, Button, BackHandler, Alert, Modal  } from 'react-native';
import _debounce from 'lodash/debounce';
import ImageViewer from 'react-native-image-zoom-viewer';

const height = Dimensions.get('window').height; 
const width = Dimensions.get('window').width; 

const styles = StyleSheet.create({
    container: {
      paddingTop: 50,
    },
    tinyLogo: {
      width: "100%",
      height: "100%",
      resizeMode: "stretch",
    },
    logo: {
      width: 66,
      height: 58,
    },
  });

const rand = Math.random();
const ImageView = ({savePicture, pictureTaken, deletePicture, route, navigation}) => {
  const { isViewOnly, capturedImage, capturedImageType } = route.params;
  const [loading, setLoading] = useState(false);
  const [viewFull, setViewFull] = useState(false);
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
  }, 150);
  const delayedDeletePicture = _debounce(() => {
    setLoading(true);
    navigation.goBack();
    deletePicture(capturedImage, isViewOnly, capturedImageType);
  },150);

  const images = [{
    url: `file://${capturedImage}?v=${rand}`,
  }];
  return (
    <View style={{ flex: 1 }}>
      <View style={{ justifyContent: "space-evenly", flexDirection: "row", padding: 10 }}>
          <View style={{width:120}}>
              <Button title="Save" onPress={() => {
                setLoading(true);
                delayedSavePicture();
              }} disabled={isViewOnly || loading} />
          </View>
          <View style={{width:120}}>
              <Button disabled={loading} title="Delete" color="#ff0000" onPress={() => {
                setLoading(true);
                delayedDeletePicture();
              }} />
          </View>
      </View>
      <Modal visible={viewFull} transparent={true} onRequestClose={() => setViewFull(false)}>
          <ImageViewer saveToLocalByLongPress={false} imageUrls={images}/>
      </Modal>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10}}>
        <TouchableHighlight
        
        onPress={() => {
          setViewFull(true);
        }}>
                    <Image
          style={styles.tinyLogo}
          source={{uri:`file://${capturedImage}?v=${rand}`}}
          />
        </TouchableHighlight>

      </View>
    </View>
  );
}

export default ImageView;
