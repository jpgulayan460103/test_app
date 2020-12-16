/* eslint-disable no-console */
import React, { useMemo, useEffect, useState } from 'react';
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
  Alert
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
  const { beneficiary } = route.params;
  const [lastPosition, setLastPosition] = useState({
    longitude: "",
    latitude: "",
  });
  useEffect(() => {
    // setBeneficiary(beneficiary);
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

  const waterMark = async (data, type, location) => {
    return  Marker.markText({
      src: data.uri,
      text: `HHID: ${beneficiary.hhid}\nName: ${beneficiary.fullname}\nImage: ${type}\nLocation: ${location.latitude}, ${location.longitude}`, 
      X: 30,
      Y: 10, 
      color: '#000000',
      fontName: 'Arial-BoldItalicMT',
      fontSize: 30,
      textBackgroundStyle: {
        type: 'stretchX',
        paddingX: 10,
        paddingY: 10,
        color: '#FFFFFF'
      },
      scale: 1, 
      quality: 100
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
        let markedImage = await waterMark(data, label, lastPosition)
        let fileExists = await RNFS.exists(data.uri);
        if(fileExists){
          RNFS.unlink(data.uri);
        }
        navigation.navigate("Image Preview", {isViewOnly: false, capturedImage: markedImage, capturedImageType: type});
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

  return (
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
              <Text style={{ fontSize: 11,padding: 10, paddingBottom: 5, paddingTop: 5}}>{`HHID: ${beneficiary.uct_id}\nName: ${beneficiary.full_name}\n\n`}</Text>
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
              onPress={() => { setLoading(true);delayedTakePicture("PHOTO","image_photo") }}>
              <Text style={styles.flipText}>PHOTO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={loading}
              style={[
                styles.flipButton,
                styles.picButton,
                { flex: 0.3, alignSelf: 'flex-end' },
              ]}
              onPress={() => { setLoading(true);delayedTakePicture("SIGNATURE","image_signature") }}>
              <Text style={styles.flipText}>VALID ID FRONT</Text>
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
};

const styles = StyleSheet.create({
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
});

export default ListahananCamera;