import React, {useEffect, useState} from 'react';
import { StyleSheet, ToastAndroid, View, Dimensions, Modal, TouchableOpacity, RefreshControl, TouchableWithoutFeedback } from 'react-native';
import { Layout, Text, List, Button, Divider, Card, Select, SelectItem, Input, Icon } from '@ui-kitten/components';

const MainMenu = ({navigation, client, setUser, user}) => {

    return (
        <Layout style={{flex: 1, padding: 10}}>
            <TouchableWithoutFeedback  onPress={() => {
                navigation.navigate('Home')
                }}>
                <View style={{
                        borderColor: "rgba(255,255,255,0.4)",
                        borderStyle: "dotted",
                        borderRadius: 40,
                        borderWidth: 3,
                        padding: 10,
                }}>
                    <Text style={{textAlignVertical:"center", textAlign: "center"}}>Reports</Text>
                </View>
            </TouchableWithoutFeedback>
        </Layout>
    );
}


export default MainMenu;
