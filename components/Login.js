import React, {useEffect, useState} from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Dimensions } from 'react-native';
import { Layout, Text, Icon, List, ListItem, Button, IndexPath, Select, Card, Divider, Input } from '@ui-kitten/components';

const styles = StyleSheet.create({
    container: {
        maxHeight: 192,
    },
});

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const Login = ({setVisible, userLogin, userLoginError, loginLoading, loginString}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [secureTextEntry, setSecureTextEntry] = React.useState(true);

    const toggleSecureEntry = () => {
      setSecureTextEntry(!secureTextEntry);
    };
  
    const renderIcon = (props) => (
      <TouchableWithoutFeedback onPress={toggleSecureEntry}>
        <Icon {...props} name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}/>
      </TouchableWithoutFeedback>
    );
    const renderIconUser = (props) => (
        <Icon {...props} name="person-outline"/>
    );
    return (
        <Card disabled={true} style={{width: width*0.8}}>
            <View style={{alignItems: "center"}}>
                <View style={{width: 120, height: 120, borderWidth: 2, borderRadius: 60, padding: 10, borderColor: "rgba(255,255,255,0.4)"}}>
                    <Icon fill='#8F9BB3' name="person"/>
                </View>
            </View>
            <Input
                label="Username"
                placeholder='Username'
                value={username}
                accessoryRight={renderIconUser}
                onChangeText={nextValue => setUsername(nextValue) }
            />
            <Input
                value={password}
                label='Password'
                placeholder='Password'
                caption={userLoginError.error}
                accessoryRight={renderIcon}
                secureTextEntry={secureTextEntry}
                onChangeText={nextValue => setPassword(nextValue) }
                />
            <Button onPress={() => userLogin({username: username, password: password})} disabled={loginLoading} style={{marginTop: 10}}>
                {loginLoading ? "Logging in" : "Login"}
            </Button>
            {/* <Text>{loginString}</Text> */}
        </Card>
    );
}


export default Login;
