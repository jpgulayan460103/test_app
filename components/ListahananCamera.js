/* eslint-disable no-console */
import React, { useMemo, useEffect, useState, useRef } from 'react';
import Marker from "react-native-image-marker"
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  ToastAndroid,
  Alert,
  Image,
  Button,
  BackHandler
} from 'react-native';
// eslint-disable-next-line
import { RNCamera } from 'react-native-camera';
// eslint-disable-next-line
import Slider from '@react-native-community/slider';
import Geolocation from '@react-native-community/geolocation';

import { useCamera } from 'react-native-camera-hooks';
import RNFS from 'react-native-fs';
import { Icon } from '@ui-kitten/components';
import _debounce from 'lodash/debounce'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import { CropView } from 'react-native-image-crop-tools';

const landmarkSize = 2;

const recordOptions = {
  mute: false,
  maxDuration: 5,
  quality: RNCamera.Constants.VideoQuality['288p'],
};

const initialState = {
  flash: 'off',
  zoom: 0,
  autoFocus: 'on',
  autoFocusPoint: {
    normalized: { x: 0.5, y: 0.5 }, // normalized values required for autoFocusPointOfInterest
    drawRectPosition: {
      x: Dimensions.get('window').width * 0.5 - 32,
      y: Dimensions.get('window').height * 0.5 - 32,
    },
  },
  focusDepth: 0,
  type: 'back',
  whiteBalance: 'auto',
  ratio: '16:9',

  isRecording: false,
  canDetectFaces: false,
  canDetectText: false,
  canDetectBarcode: false,
  faces: [],
  textBlocks: [],
  barcodes: [],
};

const renderFaces = faces => (
  <View style={styles.facesContainer} pointerEvents="none">
    {faces.map(renderFace)}
  </View>
);

const renderFace = ({ bounds, faceID, rollAngle, yawAngle }) => (
  <View
    key={faceID}
    transform={[
      { perspective: 600 },
      { rotateZ: `${rollAngle.toFixed(0)}deg` },
      { rotateY: `${yawAngle.toFixed(0)}deg` },
    ]}
    style={[
      styles.face,
      {
        ...bounds.size,
        left: bounds.origin.x,
        top: bounds.origin.y,
      },
    ]}>
    <Text style={styles.faceText}>ID: {faceID}</Text>
    <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
    <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
  </View>
);

const renderLandmarksOfFace = (face = {}) => {
  const renderLandmark = position =>
    position && (
      <View
        style={[
          styles.landmark,
          {
            left: position.x - landmarkSize / 2,
            top: position.y - landmarkSize / 2,
          },
        ]}
      />
    );
  return (
    <View key={`landmarks-${face.faceID}`}>
      {renderLandmark(face.leftEyePosition)}
      {renderLandmark(face.rightEyePosition)}
      {renderLandmark(face.leftEarPosition)}
      {renderLandmark(face.rightEarPosition)}
      {renderLandmark(face.leftCheekPosition)}
      {renderLandmark(face.rightCheekPosition)}
      {renderLandmark(face.leftMouthPosition)}
      {renderLandmark(face.mouthPosition)}
      {renderLandmark(face.rightMouthPosition)}
      {renderLandmark(face.noseBasePosition)}
      {renderLandmark(face.bottomMouthPosition)}
    </View>
  );
};

const renderLandmarks = (faces = []) => (
  <View style={styles.facesContainer} pointerEvents="none">
    {faces.map(renderLandmarksOfFace)}
  </View>
);

const renderTextBlocks = (textBlocks = []) => (
  <View style={styles.facesContainer} pointerEvents="none">
    {textBlocks.map(renderTextBlock)}
  </View>
);

const renderTextBlock = ({ bounds = {}, value }) => (
  <React.Fragment key={value + bounds.origin.x}>
    <Text
      style={[
        styles.textBlock,
        { left: bounds.origin.x, top: bounds.origin.y },
      ]}>
      {value}
    </Text>
    <View
      style={[
        styles.text,
        {
          ...bounds.size,
          left: bounds.origin.x,
          top: bounds.origin.y,
        },
      ]}
    />
  </React.Fragment>
);

const renderBarcodes = (barcodes = []) => (
  <View style={styles.facesContainer} pointerEvents="none">
    {barcodes.map(renderBarcode)}
  </View>
);

const renderBarcode = ({ bounds = {}, data, type }) => (
  <React.Fragment key={data + bounds.origin.x}>
    <View
      style={[
        styles.text,
        {
          ...bounds.size,
          left: bounds.origin.x,
          top: bounds.origin.y,
        },
      ]}>
      <Text style={[styles.textBlock]}>{`${data} ${type}`}</Text>
    </View>
  </React.Fragment>
);

export const ListahananCamera = ({navigation, route, setBeneficiary}) => {
  const cropViewRef = useRef();
  const { beneficiary } = route.params;
  const [hasPictureTaken, setHasPictureTaken] = useState(false);
  const [pictureType, setPictureType] = useState("");
  const [pictureTaken, setPictureTaken] = useState("");
  const [lastPosition, setLastPosition] = useState({
    longitude: "",
    latitude: "",
  });
  useEffect(() => {
    // setBeneficiary(beneficiary);
    const backAction = () => {
      if(!hasPictureTaken){
        return false;
      }
      Alert.alert("Hold on!", "Are you sure you want to go back to retake picture?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        { text: "YES", onPress: async () => {
          let fileExists = await RNFS.exists(pictureTaken);
          if(fileExists){
            RNFS.unlink(pictureTaken);
          }
          setHasPictureTaken(false);
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
  const [
    {
      cameraRef,
      type,
      flash,
      autoFocus,
      focusDepth,
      zoom,
      whiteBalance,
      autoFocusPoint,
      drawFocusRingPosition,
      barcodes,
      ratio,
      cameraState,
      isRecording,
      faces,
      textBlocks,
    },
    {
      toggleFacing,
      toggleFlash,
      toggleAutoFocus,
      setFocusDepth,
      toggleWB,
      touchToFocus,
      toggleCameraState,
      facesDetected,
      textRecognized,
      barcodeRecognized,
      zoomIn,
      zoomOut,
      setIsRecording,
      takePicture,
    },
  ] = useCamera(initialState);

  const [location, setLocation] = useState({});
  const [loading, setLoading] = useState(false);
  const [cropLabel, setCropLabel] = useState("Crop Image");

  //TODO: [mr] useEffect?
  const canDetectFaces = useMemo(() => cameraState['canDetectFaces'], [
    cameraState,
  ]);
  const canDetectText = useMemo(() => cameraState['canDetectText'], [
    cameraState,
  ]);
  const canDetectBarcode = useMemo(() => cameraState['canDetectBarcode'], [
    cameraState,
  ]);

  const waterMark = async (image, type) => {
    return  Marker.markText({
      src: `file://${image.uri.substring(5)}`,
      text: `${beneficiary.full_name} (${type.substring(10)})`, 
      X: 0,
      Y: 0, 
      color: '#000000',
      fontName: 'Arial-BoldItalicMT',
      fontSize: image.height / 24,
      textBackgroundStyle: {
        type: 'stretchX',
        paddingX: 0,
        paddingY: 0,
        color: '#FFFFFF'
      },
      scale: 1, 
      quality: 100,
      position: "bottomCenter"
   })
  }

  const flashText = (flash) => {
    switch (flash) {
      case "on":
        return <Text><Icon style={{width: 30, height: 30 }} fill='black' name='flash-outline'/></Text>;
      case "off":
        return <Text><Icon style={{width: 30, height: 30 }} fill='black' name='flash-off-outline'/></Text>;
      case "auto":
        return <Text>A<Icon style={{width: 30, height: 30 }} fill='black' name='flash-outline'/></Text>;
      case "torch":
        return <Text><Icon style={{width: 30, height: 30 }} fill='black' name='flash'/></Text>;
      default:
        return <Text><Icon style={{width: 30, height: 30 }} fill='black' name='flash-outline'/></Text>;
    }
  }

  const delayedTakePicture =  _debounce(async (label, type) => {
    try {
      setIsRecording(true);
      let options = { fixOrientation: true };
      ToastAndroid.show("Taking Picture, Please wait.", ToastAndroid.SHORT)
      let data = await takePicture(options);
      let dirExist = await RNFS.exists(data.uri);
      if(dirExist){
        setHasPictureTaken(true);
        setPictureType(type);
        setPictureTaken(data.uri);
        setCropLabel("Crop Signature");
        if(type == "uploading_photo"){
          setCropLabel("Crop Photo");
        }
        // navigation.navigate("Image Preview", {isViewOnly: false, capturedImage: data.uri.substring(7), capturedImageType: type});
      }else{
        console.log("err");
      }

    } catch (e) {
      console.warn(e);
    } finally {
      setIsRecording(false);
      setLoading(false);
    }
  }, 150);

  const camView = (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={{
          flex: 1,
          justifyContent: 'space-between',
        }}
        captureAudio={false}
        type={type}
        flashMode={flash}
        autoFocus={autoFocus}
        autoFocusPointOfInterest={autoFocusPoint.normalized}
        zoom={zoom}
        whiteBalance={whiteBalance}
        ratio={ratio}
        focusDepth={focusDepth}
        faceDetectionLandmarks={
          RNCamera.Constants.FaceDetection.Landmarks
            ? RNCamera.Constants.FaceDetection.Landmarks.all
            : null
        }
        onFacesDetected={canDetectFaces ? facesDetected : null}
        onTextRecognized={canDetectText ? textRecognized : null}
        onGoogleVisionBarcodesDetected={
          canDetectBarcode ? barcodeRecognized : null
        }>
        <View style={StyleSheet.absoluteFill}>
          <View style={[styles.autoFocusBox, drawFocusRingPosition]} />
          <TouchableWithoutFeedback onPress={touchToFocus}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
        <View style={{position: "absolute", backgroundColor: "white",top: -10, width: "100%"}}>
              <Text style={{ fontSize: 11,padding: 10, paddingBottom: 5, paddingTop: 5}}>{`HHID: ${beneficiary.uct_id}\nName: ${beneficiary.full_name}\nAddress: ${beneficiary.brgy_name}, ${beneficiary.city_name}, ${beneficiary.province_name}\n`}</Text>
            </View>
        <View
            style={{
              backgroundColor: 'transparent',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 5,
              marginRight: 20,
            }}>
            <TouchableOpacity
              onPress={() => toggleFlash()}>
              { flashText(flash) }
            </TouchableOpacity>
            <TouchableOpacity
              style={{marginLeft: 10}}
              onPress={() => toggleFacing()}>
              <Icon style={{width: 30, height: 30 }} fill='black' name='flip-2-outline'/>
            </TouchableOpacity>
          </View>
        <View
          style={{
            height: 72,
            backgroundColor: 'transparent',
            justifyContent: 'space-around',
          }}>
            
        </View>
        <View style={{ bottom: 0 }}>
          <View
            style={{
              height: 20,
              backgroundColor: 'transparent',
              flexDirection: 'row',
              alignSelf: 'flex-end',
            }}>
          </View>
          <View
            style={{
              height: 56,
              backgroundColor: 'transparent',
              flexDirection: 'row',
              alignSelf: 'flex-end',
            }}>
          </View>
          {/* {zoom !== 0 && (
            <Text style={[styles.flipText, styles.zoomText]}>Zoom: {zoom}</Text>
          )} */}
          <View
            style={{
              height: 56,
              backgroundColor: 'transparent',
              flexDirection: 'row',
              justifyContent: "space-evenly",
            }}>
            <TouchableOpacity
              disabled={loading}
              style={[
                styles.flipButton,
                styles.picButton,
                { flex: 0.3, alignSelf: 'flex-end' },
              ]}
              disabled={loading}
              onPress={() => { setLoading(true);delayedTakePicture("PHOTO","uploading_photo") }}>
              <Text style={styles.flipText}>PHOTO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={loading}
              style={[
                styles.flipButton,
                styles.picButton,
                { flex: 0.3, alignSelf: 'flex-end' },
              ]}
              onPress={() => { setLoading(true);delayedTakePicture("SIGNATURE","uploading_signature") }}>
              <Text style={styles.flipText}>SIGNATURE</Text>
            </TouchableOpacity>
          </View>

        </View>
        {!!canDetectFaces && renderFaces(faces)}
        {!!canDetectFaces && renderLandmarks(faces)}
        {!!canDetectText && renderTextBlocks(textBlocks)}
        {!!canDetectBarcode && renderBarcodes(barcodes)}
      </RNCamera>
    </View>
  );

  const cropView = (
    <View>
      <Button
          title={cropLabel}
          onPress={() => {
            cropViewRef.current.saveImage(true,90);
            // console.log(cropped);
          }}
        />
        {/* <Text>{pictureTaken}</Text> */}
    <CropView
        sourceUrl={pictureTaken}
        style={styles.image}
        ref={cropViewRef}
        onImageCrop={async (res) => {
          console.log(res);
          let markedImage = await waterMark(res, pictureType)
          navigation.navigate("Image Preview", {isViewOnly: false, capturedImage: markedImage, capturedImageType: pictureType});
        }}
        // keepAspectRatio
        // aspectRatio={{width: 16, height: 9}}
      />
    </View>
  );

  return hasPictureTaken ? cropView : camView;
};



const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "94%",
    resizeMode: "stretch",
    // position: "absolute"
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: '#000',
  },
  flipButton: {
    flex: 0.3,
    height: 50,
    marginHorizontal: 2,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoFocusBox: {
    position: 'absolute',
    height: 64,
    width: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    opacity: 0.4,
  },
  flipText: {
    color: 'white',
    fontSize: 15,
    textAlign: "center"
  },
  zoomText: {
    position: 'absolute',
    bottom: 70,
    zIndex: 2,
    left: 2,
  },
  picButton: {
    zIndex: 150,
    backgroundColor: 'crimson',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red',
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  text: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#F00',
    justifyContent: 'center',
  },
  textBlock: {
    color: '#F00',
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  cropView: {
    flex: 1,
    backgroundColor: 'red'
  },
});

export default ListahananCamera;