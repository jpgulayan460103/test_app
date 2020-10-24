import React, {useEffect} from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Text, Icon, List, ListItem, Button } from '@ui-kitten/components';

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
});


const Beneficiaries = ({beneficiaries, navigation, selectBeneficiary, getBeneficiaries}) => {

    const renderItemIcon = (props) => (
        <Icon {...props} name='person'/>
    );


    const renderItem = ({ item, index }) => (
    <ListItem
        onPress={() => {
            selectBeneficiary(item);
            navigation.navigate("Beneficiary Information")
        } }
        title={`${item.fullname}`}
        description={`${item.barangay_name}, ${item.city_name}\n${item.province_name}`}
        accessoryLeft={renderItemIcon}
        accessoryRight={() => {
            return (
                <Button
                    size='tiny'
                    onPress={() => {
                        selectBeneficiary(item);
                        navigation.navigate("Camera");
                    }
                }>TAKE PICTURE</Button>
            )
        }}
    />
    );
    return (


        <Layout style={{flex: 1}}>
        <List
            data={beneficiaries}
            renderItem={renderItem}
        />
        </Layout>
    );
}


export default Beneficiaries;
