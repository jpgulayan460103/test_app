import React from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Text, ViewPager } from '@ui-kitten/components';

const ViewPagerSimpleUsageShowcase = () => {

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return (
    <ViewPager
      selectedIndex={selectedIndex}
      onSelect={index => setSelectedIndex(index)}>
      <Layout
        style={styles.tab}
        level='2'>
        <Text category='h5'>USERS</Text>
      </Layout>
      <Layout
        style={styles.tab}
        level='2'>
        <Text category='h5'>ORDERS</Text>
      </Layout>
      <Layout
        style={styles.tab}
        level='2'>
        <Text category='h5'>TRANSACTIONS</Text>
      </Layout>
    </ViewPager>
  );
};

const styles = StyleSheet.create({
  tab: {
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ViewPagerSimpleUsageShowcase;