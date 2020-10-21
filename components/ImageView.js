import React, {useState} from 'react';
import { SafeAreaView, ScrollView, Image, StyleSheet, View, Dimensions, Text, Button  } from 'react-native';
import * as eva from '@eva-design/eva';
// import { ApplicationProvider, IconRegistry, Text, Tab, TabBar  } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import Header from './Header';

const styles = StyleSheet.create({
    container: {
      paddingTop: 50,
    },
    tinyLogo: {
        width: Dimensions.get('window').width, // applied to Image
        height: Dimensions.get('window').height,
        resizeMode: "stretch"
    },
    logo: {
      width: 66,
      height: 58,
    },
  });
const ImageView = ({beneficiary, capturedImage}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
            <View style={{ justifyContent: "space-evenly", flexDirection: "row" }}>
                <View style={{width:120}}>
                    <Button title="Save" />
                </View>
                <View style={{width:120}}>
                    <Button title="Delete" color="#ff0000" />
                </View>
            </View>
            <View style={{ flex: 1}}>
                <Image
                style={styles.tinyLogo}
                source={{uri:capturedImage}}
                />
            </View>
        </ScrollView>
    </SafeAreaView>
  );
}

export default ImageView;
