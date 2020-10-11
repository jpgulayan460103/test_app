import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry, Layout, Text } from '@ui-kitten/components';
import Header from './components/Header'
import { EvaIconsPack } from '@ui-kitten/eva-icons';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.dark}>
      <Header />
        <Layout style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ScrollView>
          <Text category='h1'>Hello World</Text>
        </ScrollView>
        </Layout>
      </ApplicationProvider>
    </SafeAreaView>
  );
}

export default App;