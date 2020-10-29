import React, {useEffect, useState} from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { Layout, Text, Icon, List, ListItem, Button, IndexPath, Select, SelectItem, Divider, Input } from '@ui-kitten/components';

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
});

const listWidth = Dimensions.get('window').width;

const Beneficiaries = ({
        beneficiaries,
        navigation,
        updateAddressFilter,
        addresses: {provinces, cities, barangays},
        selectedAddresses: {selectedProvince, selectedCity, selectedBarangay},
        getBeneficiaries
    }) => {
    useEffect(() => {
        // getBeneficiaries();
        setProvinceValue(selectedProvince);
        setCityValue(selectedCity);
        setBarangayValue(selectedBarangay);
        return () => {
            
        };
    }, []);
    
    const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
    const [provinceValue, setProvinceValue] = useState(null);
    const [cityValue, setCityValue] = useState(null);
    const [barangayValue, setBarangayValue] = useState(null);
    const [showFilter, setShowFilter] = useState(true);
    const [value, setValue] = useState('');
    const renderItemIcon = (props) => (
        <Icon {...props} name='person'/>
    );

    const renderIcon = (props) => (
        <TouchableOpacity onPress={() => {
            getBeneficiaries();
        }}>
          <Icon {...props} name="search"/>
        </TouchableOpacity>
      );


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
                navigation.navigate("Beneficiary Information", {beneficiary: item})
            }}>
            <View style={{ width: (listWidth - 120), paddingRight: 4}}>
                <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                    {`${item.lastname ? item.lastname : ""}, ${item.firstname ? item.firstname : ""} ${item.middlename ? item.middlename : ""} ${item.extname ? item.extname : ""}`}
                </Text>
                <Text category='c1'>{`${item.barangay_name}, ${item.city_name}\n${item.province_name}, ${item.region}`}</Text>
            </View>
            </TouchableOpacity>
            <View style={{ width: 100, justifyContent: 'center', alignItems: 'center'}}>
                <Button
                    size='tiny'
                    onPress={() => {
                        navigation.navigate("Camera", {beneficiary: item});
                    }
                }>TAKE PICTURE</Button>
            </View>
        </View>
    );
    

    return (
        <Layout style={{flex: 1}}>
            {showFilter ? (
                <Layout style={{flex: 0, paddingTop: 10, flexDirection: "row", justifyContent: "space-evenly"}}>
                <Layout style={{width: "45%"}}>
                    <Select
                        label='Province'
                        placeholder="Select Province"
                        onSelect={(item) => {
                            setProvinceValue(provinces[item.row]);
                            setCityValue(null);
                            setBarangayValue(null);
                            updateAddressFilter('province_name', provinces[item.row]);
                        }}
                        value={provinceValue}>
                        {
                            provinces.map((item, index) => {
                                return (<SelectItem title={item} key={`prov_${index}`}/>)
                            })
                        }
                    </Select>
                </Layout>
                <Layout style={{width: "45%"}}>
                    <Select
                        label='City/Municipality'
                        placeholder="Select City/Municipality"
                        onSelect={(item) => {
                            setCityValue(cities[item.row]);
                            setBarangayValue(null);
                            updateAddressFilter('city_name', cities[item.row]);
                        }}
                        value={cityValue}>
                        {
                            cities.map((item, index) => {
                                return (<SelectItem title={item} key={`city_${index}`}/>)
                            })
                        }
                    </Select>
                </Layout>
            </Layout>
            ) : (<></>) }

            {showFilter ? (
                <Layout style={{flex: 0, paddingTop: 10, flexDirection: "row", justifyContent: "space-evenly"}}>
                    <Layout style={{width: "93%"}}>
                        <Select
                            label='Barangay'
                            placeholder="Select Barangay"
                            onSelect={(item) => {
                                setBarangayValue(barangays[item.row]);
                                updateAddressFilter('barangay_name', barangays[item.row]);
                            }}
                            value={barangayValue}>
                            {
                                barangays.map((item, index) => {
                                    return (<SelectItem title={item} key={`brgy_${index}`}/>)
                                })
                            }
                        </Select>
                    </Layout>
                </Layout>
            ) : (<></>)}
            <TouchableOpacity
                onPress={
                    () => {
                        setShowFilter(prev => {
                            return !prev;
                        })
                    }
                }>
                <Text style={{textAlign: "center", paddingTop: 10}}>{showFilter ? "HIDE" : "SHOW"} SEARCH FILTERS</Text>
            </TouchableOpacity>
            <Layout style={{flex: 0, flexDirection: "row", justifyContent: "space-evenly"}}>
                <Layout style={{width: "93%"}}>
                <Input
                    value={value}
                    label='Search'
                    placeholder='Enter Name'
                    accessoryRight={renderIcon}
                    onChangeText={nextValue => {
                        setValue(nextValue);
                        updateAddressFilter('searchString', nextValue);
                    }}
                />
                </Layout>
            </Layout>
            <Divider style={{marginTop: 20}} />
            <Layout style={{flex: 1}}>
                <List
                data={beneficiaries}
                renderItem={renderItem}
                />
            </Layout>
        </Layout>
    );
}


export default Beneficiaries;
