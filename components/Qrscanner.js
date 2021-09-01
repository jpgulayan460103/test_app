import React from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback, Dimensions, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useCamera } from 'react-native-camera-hooks';
import BarcodeMask from 'react-native-barcode-mask';
import { isEmpty } from 'lodash';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const landmarkSize = 2;


const Qrscanner = ({ initialProps, getScannedValue }) => {
  const [
    { 
      cameraRef,
      autoFocus,
      focusDepth,
      autoFocusPoint,
      drawFocusRingPosition,
      ratio,
      barcodes
     },
    {
      touchToFocus,
      facesDetected,
      textRecognized,
    },
  ] = useCamera(initialProps);

  const readBarcode = (barcode) => {
    getScannedValue(barcode.data);
  }

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
  

  return (
    <View style={{ flex: 1 }}>
      <RNCamera
        ref={cameraRef}
        captureAudio={false}
        autoFocus={autoFocus}
        autoFocusPointOfInterest={{ x: 0.5, y: 0.5 }}
        ratio={ratio}
        focusDepth={focusDepth}
        style={{ height: height, width: width, overflow: "hidden" }}
        // onTextRecognized={textRecognized}
        onFacesDetected={facesDetected}
        onBarCodeRead={(e) => readBarcode(e)}
        type={RNCamera.Constants.Type.back}
      >
      <View style={StyleSheet.absoluteFill}>
          <View style={[styles.autoFocusBox, drawFocusRingPosition]} />
          <TouchableWithoutFeedback>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
        { renderBarcodes(barcodes) }
      </RNCamera>
    </View>
  );
};


const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "94%",
    resizeMode: "stretch",
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
    height: 120,
    width: 120,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: -30,
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

export default Qrscanner