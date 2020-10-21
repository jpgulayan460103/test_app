import React from 'react';
import { SafeAreaView, ScrollView, Image, StyleSheet, Dimensions, TouchableHighlight  } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry, Layout, Text } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

const styles = StyleSheet.create({
    container: {
      paddingTop: 50,
    },
    tinyLogo: {
      width: Dimensions.get('window').width / 3,
      height: Dimensions.get('window').width / 3,
      margin: 2
    },
    logo: {
      width: 66,
      height: 58,
    },
  });
const Information = ({beneficiary, capturedImage, navigation}) => {
  const viewFullImage = () => {
    navigation.navigate("Image Preview");
  }
  const ImagePreview = ({image}) => {
    return (
      <TouchableHighlight onPress={() => viewFullImage()}>
      <Image
        style={styles.tinyLogo}
        source={{uri:image}}
      />
    </TouchableHighlight>
    )
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.dark}>
        <Layout style={{flex: 1}}>
        <ScrollView>
          <Text category='h1'>Hello World</Text>
          <Text>{beneficiary.fullname}</Text>
            <Text>{beneficiary.province_name}</Text>
            <Text>{capturedImage}</Text>
            <Layout style={{flex: 1, flexDirection: "row"}}>
              <ImagePreview image={capturedImage} />
              <ImagePreview image={capturedImage} />
              <ImagePreview image={capturedImage} />
            </Layout>
        </ScrollView>
        </Layout>
      </ApplicationProvider>
    </SafeAreaView>
  );
}

export default Information;
