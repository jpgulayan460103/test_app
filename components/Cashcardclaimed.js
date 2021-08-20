import React, {useEffect, useState} from 'react';
import { StyleSheet, TouchableHighlight, View, Dimensions, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Layout, Text, Icon, List, ListItem, Button, IndexPath, Select, SelectItem, Divider, Input } from '@ui-kitten/components';
import RNFetchBlob from 'rn-fetch-blob'

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
    icon: {
        width: 15,
        height: 15,
      },
});

const listWidth = Dimensions.get('window').width;

const Cashcardclaimed = ({navigation, db, route}) => {

    const { typeView } = route.params;

    const [refreshing, setRefreshing] = useState(false);
    const [claimedBeneficiaries, setClaimedBeneficiaries] = useState([]);
    const [searchString, setSearchString] = useState("");

    useEffect(() => {

        navigation.setOptions({
            title: typeView == "unclaimed" ? "Beneficiaries" : "Claimed Cashcards",
          });
        setClaimedBeneficiaries([])
        getClaimed();
    }, [typeView]);

    const getClaimed = () => {
        let is_claimed = 1;
        let order_by = "order by datetime_claimed desc";
        if(typeView == "unclaimed"){
            is_claimed = 0;
            order_by = "order by city asc";
        }
        let sql = `select * from cashcard where is_claimed = ${is_claimed}`;
        if(searchString != ""){
            let value = searchString.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let keywords = value.split(" ");
            sql += ` and`;
            let mappedKeywords = keywords.map(item => {
                return `full_name like '%${item.trim()}%'`;
            });
            let keywordQuery = mappedKeywords.join(" and ");
            sql += ` ${keywordQuery}`;
        }
        db.transaction((trans) => {
            trans.executeSql(`${sql} ${order_by} limit 20`, [], (trans, results) => {
              let items = [];
              let rows = results.rows;
              for (let i = 0; i < rows.length; i++) {
                var item = rows.item(i);
                items.push(item);
              }
              setClaimedBeneficiaries(items);
            },
            (error) => {
              console.log(error);
            });
          });
    }

    const undoTagging = (hhid) => {
        db.transaction((trans) => {
            trans.executeSql("update cashcard set is_claimed = 0, date_scanned = null, datetime_claimed = null where hhid = ?", [hhid], (trans, results) => {
              let items = [];
              let rows = results.rows;
              for (let i = 0; i < rows.length; i++) {
                var item = rows.item(i);
                items.push(item);
              }
              getClaimed();
            },
            (error) => {
              console.log(error);
            });
          });
    }
    const renderItem = ({ item, index }) => (
        <TouchableHighlight onPress={() => {
            
        }}>
        <View style={
            {
                width:"100%",
                height: 75,
                backgroundColor: "#222b44",
                padding: 5,
                paddingLeft: 10,
                borderColor: "black",
                borderBottomWidth: 1,
                flexDirection: "row",
                alignItems: "center"
            }
        }>
            
                <View style={{ width: (listWidth * 0.35), paddingRight: 4}}>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                        {item.last_name}
                    </Text>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                        {item.first_name}
                    </Text>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                        {item.middle_name}
                    </Text>
                </View>
            
            <View style={{ width: (listWidth * 0.6), flex: 1, flexDirection: "row"}}>
                <View style={{flex: 0.6}}>
                    <Text category='c1' style={{textAlign: "center", fontSize: 14}}>
                        {item.barangay}
                    </Text>
                    <Text category='c1' style={{textAlign: "center", fontSize: 14}}>
                        {item.city}
                    </Text>
                    <Text category='c1' style={{textAlign: "center", fontSize: 14}}>
                        {item.province}
                    </Text>
                </View>
                <View style={{flex: 0.4}}>
                    <Text category='c1' style={{textAlign: "center", fontSize: 14}}>
                        {item.date_scanned}
                    </Text>
                    { typeView == "unclaimed" ? (
                        <Text category='c1' style={{textAlign: "center", fontSize: 14}}>
                            <Button
                                size='tiny'
                                status="primary"
                                onPress={() => {
                                    navigation.navigate("Qrscanner", {beneficiary: item});
                                }
                            }>
                                <Icon
                                    style={styles.icon}
                                    fill='#FFFFFF'
                                    name='person-done'
                                />
                            </Button>
                        </Text>
                    ) : (
                        <Text category='c1' style={{textAlign: "center", fontSize: 14}}>
                        <Button
                            size='tiny'
                            status="danger"
                            onPress={() => {
                                Alert.alert("Hold on!", "Are you sure you undo the tagging of this beneficiary?", [
                                    {
                                    text: "Cancel",
                                    onPress: () => null,
                                    style: "cancel"
                                    },
                                    { text: "YES", onPress: async () => {
                                        undoTagging(item.hhid);
                                    } }
                                ]);
                            }
                        }>
                            <Icon
                                style={styles.icon}
                                fill='#FFFFFF'
                                name='undo'
                            />
                        </Button>
                    </Text>

                    ) }
                </View>
            </View>
        </View>
        </TouchableHighlight>
    );


    const renderIcon = (props) => (
        <TouchableOpacity onPress={() => {
            // console.log(searchString);
            getClaimed()
        }}>
          <Icon {...props} name="search"/>
        </TouchableOpacity>
      );
    

    return (
        <Layout style={{flex: 1}}>
            <View style={{padding: 10}}>
            
            <Input
                    value={searchString}
                    label='Search'
                    placeholder='Enter Name'
                    accessoryRight={renderIcon}
                    onChangeText={nextValue => {
                        // console.log(nextValue);
                        setSearchString(nextValue);
                    }}
            />
            </View>
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
                <View style={{ width: (listWidth * 0.35), paddingRight: 4}}>
                    <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                        Name
                    </Text>
                </View>
                <View style={{ width: (listWidth * 0.6), flex: 1, flexDirection: "row"}}>
                    <View style={{flex: 0.6}}>
                        <Text category='c1' style={{textAlign: "center",fontWeight: "bold", fontSize: 14}}>
                            Address
                        </Text>
                    </View>
                    <View style={{flex: 0.4}}>
                        <Text category='c1' style={{textAlign: "center",fontWeight: "bold", fontSize: 14}}>
                            { typeView == "unclaimed" ? "" : "Date Scanned" }
                        </Text>
                    </View>
                </View>
            </View>
            <List
            data={claimedBeneficiaries}
            renderItem={renderItem}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => {
                    setRefreshing(true);
                    getClaimed();
                    setRefreshing(false);
                }} />
            }
            />
            <Text style={{textAlign: "center"}}>Pull down to refresh</Text>
            {/* <Button
                onPress={() => {
                    navigation.navigate("Qrscanner");
                    // setBeneficiary(item);
                }
            }>Scan cashcard form</Button> */}
            
        </Layout>
    );
}


export default Cashcardclaimed;
