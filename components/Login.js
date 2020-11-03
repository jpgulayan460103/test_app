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
const Login = ({setVisible, userLogin, userLoginError, loginLoading}) => {
    const [username, setUsername] = useState("jpgulayan");
    const [password, setPassword] = useState("admin123");
    const [secureTextEntry, setSecureTextEntry] = React.useState(true);

    const toggleSecureEntry = () => {
      setSecureTextEntry(!secureTextEntry);
    };
  
    const renderIcon = (props) => (
      <TouchableWithoutFeedback onPress={toggleSecureEntry}>
        <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'}/>
      </TouchableWithoutFeedback>
    );
    return (
        <Card disabled={true} style={{width: width*0.8}}>
            {/* <Text category="h1">Login</Text> */}
            <Input
                label="Username"
                placeholder='Username'
                value={username}
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
            <Button onPress={() => userLogin({username: username, password: password})} disabled={loginLoading}>
                {loginLoading ? "Logging in" : "Login"}
            </Button>
        </Card>
    );
}


export default Login;
