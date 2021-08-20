import React, {useEffect, useState} from 'react';
import { StyleSheet, TouchableHighlight, View, Dimensions, RefreshControl } from 'react-native';
import { Layout, Text, List, } from '@ui-kitten/components';

const styles = StyleSheet.create({
    container: {
        width:"100%",
        height: 40,
        backgroundColor: "#222b44",
        padding: 5,
        paddingLeft: 10,
        borderColor: "black",
        borderBottomWidth: 1,
        flexDirection: "row",
        alignItems: "center"
    }
});

const listWidth = Dimensions.get('window').width;

const ReportCashcard = ({navigation, reportDates, getReportDates}) => {
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        getReportDates();
    }, []);
    const renderItem = ({ item, index }) => (
        <TouchableHighlight onPress={() => {
            navigation.navigate("Cashcard Daily Report", {report: item});
        }}>
        <View style={styles.container}>
            
                <View style={{ width: (listWidth * 0.25), paddingRight: 4}}>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                        {item.date_scanned}
                    </Text>
                </View>
            
            <View style={{ width: (listWidth * 0.7), flex: 1, flexDirection: "row"}}>
                <View style={{flex: 1/2}}>
                    <Text category='c1' style={{textAlign: "center", fontSize: 14}}>
                        {item.count_hhid}
                    </Text>
                </View>
                <View style={{flex: 1/2}}>
                    <Text category='c1' style={{textAlign: "center", fontSize: 14}}>
                        {item.count_updated}
                    </Text>
                </View>
            </View>
        </View>
        </TouchableHighlight>
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
                    <View style={{flex: 1/2}}>
                        <Text category='c1' style={{textAlign: "center",fontWeight: "bold", fontSize: 14}}>
                        Claimed
                        </Text>
                    </View>
                    <View style={{flex: 1/2}}>
                        <Text category='c1' style={{textAlign: "center",fontWeight: "bold", fontSize: 14}}>
                            Uploaded
                        </Text>
                    </View>
                </View>
            </View>
            <List
            data={reportDates}
            renderItem={renderItem}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => {
                    setRefreshing(true);
                    getReportDates();
                    setRefreshing(false);
                }} />
            }
            />
            <Text style={{textAlign: "center"}}>Pull down to refresh</Text>
        </Layout>
    );
}


export default ReportCashcard;
