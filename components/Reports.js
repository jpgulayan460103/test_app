import React, {useEffect, useState} from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { Layout, Text, Icon, List, ListItem, Button, IndexPath, Select, SelectItem, Divider, Input } from '@ui-kitten/components';

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
});

const listWidth = Dimensions.get('window').width;

const Reports = ({navigation, reportDates, getReportDates}) => {
    useEffect(() => {
        getReportDates();
    }, []);
    const renderItem = ({ item, index }) => (
        <View style={
            {
                width:"100%",
                backgroundColor: "#222b44",
                padding: 5,
                paddingLeft: 10,
                borderColor: "black",
                borderBottomWidth: 1,
                flexDirection: "row"
            }
        }>
            <TouchableOpacity onPress={() => {
                // navigation.navigate("Beneficiary Information", {beneficiary: item})
            }}>
                <View style={{ width: (listWidth * 0.25), paddingRight: 4}}>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                        {item.validated_date}
                    </Text>
                </View>
            </TouchableOpacity>
            <View style={{ width: (listWidth * 0.7), flex: 1, flexDirection: "row"}}>
                <View style={{flex: 1/3}}>
                    <Text category='c1' style={{textAlign: "center", fontSize: 14}}>
                        {item.count_hhid}
                    </Text>
                </View>
                <View style={{flex: 1/3}}>
                    <Text category='c1' style={{textAlign: "center", fontSize: 14}}>
                        {item.total_images}
                    </Text>
                </View>
                <View style={{flex: 1/3}}>
                    <Text category='c1' style={{textAlign: "center", fontSize: 14}}>
                        {item.total_uploaded}
                    </Text>
                </View>
            </View>
        </View>
    );
    

    return (
        <Layout style={{flex: 1}}>
            <View style={
                {
                    width:"100%",
                    backgroundColor: "#222b44",
                    padding: 5,
                    paddingLeft: 10,
                    borderColor: "black",
                    borderBottomWidth: 1,
                    flexDirection: "row"
                }
            }>
                <View style={{ width: (listWidth * 0.25), paddingRight: 4}}>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                        Date
                    </Text>
                </View>
                <View style={{ width: (listWidth * 0.7), flex: 1, flexDirection: "row"}}>
                    <View style={{flex: 1/3}}>
                        <Text category='c1' style={{textAlign: "center",fontWeight: "bold", fontSize: 14}}>
                            Validated
                        </Text>
                    </View>
                    <View style={{flex: 1/3}}>
                        <Text category='c1' style={{textAlign: "center",fontWeight: "bold", fontSize: 14}}>
                            Images
                        </Text>
                    </View>
                    <View style={{flex: 1/3}}>
                        <Text category='c1' style={{textAlign: "center",fontWeight: "bold", fontSize: 14}}>
                            Uploaded
                        </Text>
                    </View>
                </View>
            </View>
            <List
            data={reportDates}
            renderItem={renderItem}
            />
        </Layout>
    );
}


export default Reports;
