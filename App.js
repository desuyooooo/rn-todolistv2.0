import React from 'react';
import {   StatusBar, StyleSheet, Text, TextInput, Button, Modal, ToastAndroid, FlatList, View } from 'react-native';
import {
  FormLabel,
  Header,
  Icon,
  List,
  ListItem
} from 'react-native-elements';
import axios from 'axios';

export default class App extends React.Component {
  constructor(props, ctx){
    super(props, ctx);
    this.state = {
      sessionId: null,
      modalContent: 'login',
      modalVisible: false,
      username: null,
      password: null
    }
  }

  render(){
    const session = this.state.sessionId;

    switch(this.state.modalContent){
      case 'add':
        modalContent = <Text>add</Text>;
        break;
      case 'login':
        modalContent = 
        <View>
        <Text style={styles.textTitle}>Log In</Text>
        <TextInput
          onChangeText={(username) => this.setState({username})}
          placeholder='Username'
          style={styles.textInput}
          value={this.state.username}
        />
        <TextInput
            onChangeText={(password) => this.setState({password})}
            placeholder='Password'
            style={styles.textInput}
            value={this.state.password}
        />
        <Button 
            color='#e91e63'
            style={styles.button}
            title='LOG IN'
        />
        <Text> or </Text>
        <Button 
            color='#e91e63'
            style={styles.button}
            onPress={()=>this.setState({modalContent: 'register'})}
            title='CREATE NEW ACCOUNT'
        /> 
        </View>;
        break;
      case 'register':
        modalContent = <View>
        <Text style={styles.textTitle}>Register</Text>
        <TextInput
          onChangeText={(username) => this.setState({username})}
          placeholder='Username'
          style={styles.textInput}
          value={this.state.username}
        />
        <TextInput
            onChangeText={(password) => this.setState({password})}
            placeholder='Password'
            style={styles.textInput}
            value={this.state.password}
        />
        <Button 
            color='#e91e63'
            style={styles.button}
            title='REGISTER'
        />
        <Text> or </Text>
        <Button 
            color='#e91e63'
            style={styles.button}
            onPress={()=>this.setState({modalContent: 'login'})}
            title='LOG IN USING AN EXISTING ACCOUNT'
        /> 
      </View>;
      break;
    }

    return(
      <View style={styles.mainView}>
        <Header
          leftComponent={{ icon: 'menu' }}
          rightComponent={{ 
            icon: this.state.sessionId ? 'add' : 'input',
            onPress: () => this.setState({ modalVisible: true }) }}
        />
        <Modal
          animationType="slide"
          onRequestClose={() => this.setState({ modalVisible: false })}
          transparent={false}
          visible={this.state.modalVisible}>
          {modalContent}
        </Modal>
        <Body id={this.state.sessionId}/>

      </View>       
    );
  }

  loginPress(){
    const payload = {
      username: this.state.username,
      password: this.state.password
    };
    axios.post('http://192.168.254.111:3009/api/users/login', payload)
      .then(response => {
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT);

        this.setState({
          
          modalVisible: false
        })
      })
      .catch(err => ToastAndroid.show(err.response.data.error, ToastAndroid.LONG))
      .then(this.getTodos);
  }
  }

}

class Body extends React.Component {
  
}



const styles = StyleSheet.create({
  view: {
      backgroundColor:'#e0f2f1',
      flex: 1,
      paddingTop: 50,
      paddingLeft: 25,
      paddingRight: 25
    },
    textTitle:{
      fontSize: 24,
      textAlign: 'center',
      paddingBottom: 10
    },
    textInput: {
      height: 46, 
      fontSize: 24,
      marginLeft: 10,
      marginRight: 10,
      padding: 10
    },
    button: {
      padding: 10
    }
})