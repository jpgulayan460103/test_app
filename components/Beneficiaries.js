import React, {useEffect, useState} from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { Layout, Text, Icon, List, ListItem, Button, IndexPath, Select, SelectItem, Divider, Input } from '@ui-kitten/components';
import _isEmpty from 'lodash/isEmpty'

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
        selectedAddresses: {selectedProvince, selectedCity, selectedBarangay, selectedType},
        getBeneficiaries,
        getCities,
        getBarangays,
        appConfig,
        typeOptions,
    }) => {
    useEffect(() => {
        navigation.setOptions({
            title: `Beneficiaries`,
        });
        // getBeneficiaries();
        updateAddressFilter('searchString', "");
        // updateAddressFilter('type', null);
        if(appConfig.province_name){
            setProvinceValue(appConfig.province_name);
            updateAddressFilter('province_name', appConfig.province_name);
            getCities(appConfig.province_name);
        }else{
            setProvinceValue(selectedProvince);
        }
        if(appConfig.city_name){
            setCityValue(appConfig.city_name)
            updateAddressFilter('city_name', appConfig.city_name);
            getBarangays(appConfig.province_name, appConfig.city_name);
        }else{
            setCityValue(selectedCity);
        }
        if(appConfig.barangay_name){
            setBarangayValue(appConfig.barangay_name)
            updateAddressFilter('barangay_name', appConfig.barangay_name);
        }else{
            setBarangayValue(selectedBarangay);
        }
        setTypeValue(selectedType);
        return () => {
            
        };
    }, []);
    
    const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
    const [provinceValue, setProvinceValue] = useState(null);
    const [cityValue, setCityValue] = useState(null);
    const [barangayValue, setBarangayValue] = useState(null);
    const [showFilter, setShowFilter] = useState(true);
    const [value, setValue] = useState('');
    const [typeValue, setTypeValue] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const renderItemIcon = (props) => (
        <Icon {...props} name='person'/>
    );

    const renderIcon = (props) => (
        <TouchableOpacity onPress={() => {
            setHasSearched(true);
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
            <View style={{ width: (listWidth - 140), paddingRight: 4}}>
                <Text category='c1' style={{fontWeight: "bold", fontSize: 14}}>
                    {`${item.lastname ? item.lastname : ""}, ${item.firstname ? item.firstname : ""} ${item.middlename ? item.middlename : ""} ${item.extname ? item.extname : ""}`}
                </Text>
                <Text category='c1'>{`${item.barangay_name}, ${item.city_name}\n${item.province_name}, ${item.region}`}</Text>
            </View>
            <View style={{ width: 120, justifyContent: 'center', alignItems: 'center'}}>
                <Button
                    size='tiny'
                    onPress={() => {
                        navigation.navigate("Beneficiary Information", {beneficiary: item});
                        // setBeneficiary(item);
                    }
                }>View Information</Button>
            </View>
        </View>
    );
    

    return (
        <Layout style={{flex: 1}}>
            {showFilter ? (
                <Layout style={{flex: 0, paddingTop: 10, flexDirection: "row", justifyContent: "space-evenly"}}>
                <Layout style={{width: "45%"}}>
                    <Select
                        disabled={appConfig.province_name != "" && appConfig.province_name != null}
                        label='Province/City'
                        placeholder="Select Province/City"
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
                        label='City/Municipality/Subdistrict'
                        disabled={appConfig.city_name != "" && appConfig.city_name != null}
                        placeholder="Select City/Municipality/Subdistrict"
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
            <Layout style={{flex: 0, paddingTop: 10, flexDirection: "row", justifyContent: "space-evenly"}}>
                <Layout style={{width: "93%"}}>
                    <Select
                        label='Type'
                        placeholder="Select Type"
                        onSelect={(item) => {
                            setTypeValue(typeOptions[item.row]);
                            updateAddressFilter('type', typeOptions[item.row]);
                        }}
                        value={typeValue}>
                        {
                            typeOptions.map((item, index) => {
                                return (<SelectItem title={item} key={`type_${index}`}/>)
                            })
                        }
                    </Select>
                </Layout>
            </Layout>
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
                { !_isEmpty(beneficiaries) ? (<>
                    <List
                        data={beneficiaries}
                        renderItem={renderItem}
                    />
                </>) : (<>
                    <Text style={{textAlign: "center"}}> {hasSearched ? "No Data Found" : ""} </Text>
                </>)}
            </Layout>
        </Layout>
    );
}


export default Beneficiaries;
