import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry, Layout, Text, Icon, List, ListItem, Button } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
});


const Beneficiaries = ({beneficiaries, navigation, selectBeneficiary}) => {
    const renderItemIcon = (props) => (
        <Icon {...props} name='person'/>
    );

    const renderItemAccessory = (item, index) => (
        <Button
            size='tiny'
            onPress={(item) => {
                navigation.navigate('Camera');
                console.log(item);
                console.log(index);
            }
        }>FOLLOW</Button>
    );

    const renderItem = ({ item, index }) => (
    <ListItem
        title={`${item.fullname}`}
        description={`${item.province_name}`}
        accessoryLeft={renderItemIcon}
        accessoryRight={() => {
            return (
                <Button
                    size='tiny'
                    onPress={() => {
                        selectBeneficiary(item);
                        navigation.navigate("Camera");
                    }
                }>FOLLOW</Button>
            )
        }}
    />
    );
    return (
        <SafeAreaView style={{ flex: 1 }}>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={eva.light}>
            <Layout style={{flex: 1}}>
                <List
                    data={beneficiaries}
                    renderItem={renderItem}
                />
            </Layout>
        </ApplicationProvider>
        </SafeAreaView>
    );
}


export default Beneficiaries;
