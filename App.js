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
            secureTextEntry={true}
            style={styles.textInput}
            value={this.state.password}
        />
        <Button 
            color='#e91e63'
            style={styles.button}
            onPress={this.loginPress.bind(this)}
            title='LOG IN'
        />
        <Text style={styles.textTitle}> or </Text>
        <Button 
            color='#e91e63'
            style={styles.button}
            onPress={()=>this.setState({modalContent: 'register', username:'', password:''})}
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
            secureTextEntry={true}
            style={styles.textInput}
            value={this.state.password}
        />
        <Button 
            color='#e91e63'
            style={styles.button}
            title='REGISTER'
            onPress={this.registerPress.bind(this)}
        />
        <Text style={styles.textTitle}> or </Text>
        <Button 
            color='#e91e63'
            style={styles.button}
            onPress={()=>this.setState({modalContent: 'login', username:'', password:''})}
            title='LOG IN USING AN EXISTING ACCOUNT'
        /> 
      </View>;
      break;
    }

    return(
      <View style={styles.mainView}>
        <Modal
          animationType="slide"
          onRequestClose={() => this.setState({ modalVisible: false })}
          transparent={false}
          visible={this.state.modalVisible}>
          <View style={styles.Modal}>
            {modalContent}
          </View>
        </Modal>
        <Header
          leftComponent={{ icon: 'menu' }}
          rightComponent={{ 
            icon: this.state.sessionId ? 'add' : 'input',
            onPress: () => this.setState({ modalVisible: true }) }}
        />
        <Body id={this.state.sessionId} />
      </View>       
    );
  }

  validate(username, password){
    var re = ^[a-zA-Z0-9]{1,}$;
    ToastAndroid.show('Don\'t include special characters!', ToastAndroid.LONG)
    return (re.test(username) === re.test(password) === true);
  }

  loginPress(){
    const payload = {
      username: this.state.username,
      password: this.state.password
    };
    if(validate(this.state.username, this.state.password)){
        axios.post('http://192.168.254.111:3009/api/users/login', payload)
          .then(response => {
            ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
            try{
              if(response.data.id)
                this.setState({
                  sessionId: response.data.id, 
                  modalVisible: false,
                  username: '',
                  password: '',
                  modalContent: 'add'
                });
            }catch(e){
              
            }
          })
          .catch(err => ToastAndroid.show(err.response.data.error, ToastAndroid.LONG))
          .then(this.getTodos);
    }
  }

  registerPress(){
    const payload = {
      username: this.state.username,
      password: this.state.password
    };
    if(validate(this.state.username, this.state.password)){
      axios.post('http://192.168.254.111:3009/api/users/register', payload)
        .then(response => {
          ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
          this.loginPress();
        })
        .catch(err => ToastAndroid.show(err.response.data.error, ToastAndroid.LONG))
        .then(this.getTodos);
    }
  }

}

class Body extends React.Component {
  constructor(props, ctx){
    super(props, ctx);
  }
  
  /*
  componentOnMount(){
    try{
      axios.post('http://192.168.254.111:3009/api/todos/', {userid: this.props.id})
    }
  }
  */

  render(){
    if(this.props.id)
      content = 
        <View>
          <Text>Add flat list here {this.props.id.toString()}</Text>
        </View>;
    else
      content = <Text>Log in first to view todos</Text>;

    return(
      <View style={styles.Body}>
        {content}
      </View>  
    );
  }  
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
      paddingTop: 10,
      paddingBottom: 10
    },
    textInput: {
      height: 46, 
      fontSize: 24,
      padding: 10
    },
    button: {
      padding: 10
    },
    Body: {
      marginTop: 70,
      padding: 10
    },
    Modal: {
      marginTop: 70,
      padding: 20
    }
})
