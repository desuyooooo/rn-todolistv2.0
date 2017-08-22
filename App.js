import React from 'react';
import {   StatusBar, StyleSheet, Text, TextInput, Button, Modal, ToastAndroid, FlatList, View, ViewPagerAndroid, Picker } from 'react-native';
import {
  FormLabel,
  Header,
  Icon,
  List,
  ListItem
} from 'react-native-elements';
import {PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator} from 'rn-viewpager';
import axios from 'axios';

const api = 'http://192.168.254.111:3009';

export default class App extends React.Component {
  constructor(props, ctx){
    super(props, ctx);

    this.loginPress = this.loginPress.bind(this);
    this.registerPress = this.registerPress.bind(this);
    this.addTodo = this.addTodo.bind(this);
    this.getTodos = this.getTodos.bind(this);
    this._renderUsers = this._renderUsers.bind(this);

    this.state = {
      sessionId: null,
      modalContent: 'login',
      modalVisible: false,
      username: null,
      password: null,
      todos: [],
      users: [],
      refreshing: false,
      title: '',
      description: '',
      assigned_to: null
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this._renderUsers()
    }, 5000)
  }

  render(){
    switch(this.state.modalContent){
      case 'add':
        modalContent = 
        <View>
          <Text style={styles.textTitle}>Add a Todo</Text>
          <TextInput
            onChangeText={(title) => this.setState({title})}
            placeholder='Title'
            style={styles.textInput}
            value={this.state.title} />
          <TextInput
            onChangeText={(description) => this.setState({description})}
            placeholder='Description'
            style={styles.textInput}
            value={this.state.description} />
          <Text>Assign to:</Text>
          <Picker
            selectedValue={(this.state.assigned_to)?this.state.assigned_to:this.state.sessionId}
            onValueChange={(itemValue, itemIndex) => this.setState({assigned_to: itemValue})}>
            {this.state.users.map((user)=>{
              return <Picker.Item key={user.key} value={user.key} label={(user.key==this.state.sessionId)?user.username + ' (me)':user.username}/>
            })}
          </Picker>
          <Button 
            color='#e91e63'
            style={styles.button}
            onPress={this.addTodo}
            title='ADD TODO' />
        </View>;
        break;
      case 'login':
        modalContent = 
        <View>
          <Text style={styles.textTitle}>Log In</Text>
          <TextInput
            onChangeText={(username) => this.setState({username})}
            placeholder='Username'
            style={styles.textInput}
            value={this.state.username} />
          <TextInput
              onChangeText={(password) => this.setState({password})}
              placeholder='Password'
              secureTextEntry={true}
              style={styles.textInput}
              value={this.state.password} />
          <Button 
              color='#e91e63'
              style={styles.button}
              onPress={this.loginPress}
              title='LOG IN' />
          <Text style={styles.textTitle}> or </Text>
          <Button 
              color='#e91e63'
              style={styles.button}
              onPress={()=>this.setState({modalContent: 'register', username:'', password:''})}
              title='CREATE NEW ACCOUNT'/> 
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
            onPress={this.registerPress}
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
          statusBarProps={{ transparent: true }}
          leftComponent={{  }}
          rightComponent={{ 
            icon: this.state.sessionId ? 'add' : 'input',
            onPress: () => this.setState({ modalVisible: true })
             }}
        />
        <View style={{flex:1, marginTop: 70}}>
          <IndicatorViewPager
              style={{height:600, flexDirection: 'column-reverse'}}
              indicator={this._renderTitleIndicator()}>
              <View style={{backgroundColor:'cadetblue'}}>
                <FlatList
                  data={this.state.todos}
                  onRefresh={this.getTodos}
                  refreshing={this.state.refreshing}
                  renderItem={
                      ({item}) => <Text>{item.title}</Text>
                  }
                  />
              </View>
              <View style={{backgroundColor:'cornflowerblue'}}>
                <FlatList
                  data={this.state.todos}
                  onRefresh={this.getTodos}
                  refreshing={this.state.refreshing}
                  renderItem={({item}) => this._renderMyTodos}
                  />
              </View>
              <View style={{backgroundColor:'#1AA094'}}>
                <FlatList
                  data={this.state.todos}
                  onRefresh={this.getTodos}
                  refreshing={this.state.refreshing}
                  renderItem={({item}) => this._renderTheirTodos}
                  />
              </View>
          </IndicatorViewPager>
        </View>
      </View>       
    );
  }

  _renderMyTodos({item}){
    if (item.assigned_to === this.state.sessionId){
        return <Text>{item.title}</Text>
    }
  }

  _renderTheirTodos({item}){
    if (item.assigned_by === this.state.sessionId){
        return <Text>{item.title}</Text>
    }
  }

  _renderTitleIndicator() {
    return <PagerTitleIndicator titles={['ALL', 'MINE', 'THEIRS']} />;
  }

  _renderUsers() {
    axios.get(api + '/api/users')
      .then(response => {
        const users = response.data;

        this.setState({
          users: users.map(function (user){
            return {
              key: user.id,
              username: user.username
            }
          })
        })
        
      });
  }

  validate(username, password) {
    const re = new RegExp('^[a-zA-Z0-9]{1,}$');
    return (re.test(username) === re.test(password) === true);
  }

  loginPress() {
    const payload = {
      username: this.state.username,
      password: this.state.password
    };
    if(this.validate(this.state.username, this.state.password)){
        axios.post(api + '/api/users/login', payload)
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
          .then(this.getTodos)
    }else{
      ToastAndroid.show('Don\'t include special characters!', ToastAndroid.LONG)
    }
  }

  registerPress(){
    const payload = {
      username: this.state.username,
      password: this.state.password
    };
    if(this.validate(this.state.username, this.state.password)){
      axios.post(api + '/api/users/register', payload)
        .then(response => {
          ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
          this.loginPress();
        })
        .catch(err => ToastAndroid.show(err.response.data.message, ToastAndroid.LONG))
        .then(this.getTodos)
    }else{
      ToastAndroid.show('Don\'t include special characters!', ToastAndroid.LONG);
    }
  }

  addTodo(){
    axios.post(api + '/api/todos/', 
      { title: this.state.title, 
        description: this.state.description, 
        assigned_by: this.state.sessionId, 
        assigned_to: this.state.assigned_to
      })
      .then(response => {
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT);

        this.setState({
          title: '',
          description: '',
          assigned_to: 0,
          modalVisible: false
        })
      })
      .catch(err => ToastAndroid.show(err.response.data.error, ToastAndroid.LONG))
      .then(this.getTodos);
  }

  getTodos(){
    this.setState({ refreshing: true });

    axios.post(api + '/api/todos/all', {userid: this.state.sessionId})
    .then(response => {
      const todos = response.data;
      
      this.setState({
        refreshing: false,
        todos: todos.map(function (todo) {
          return {
            key: todo.id,
            title: todo.title,
            description: todo.description,
            done: !!todo.done,
            date_created: todo.date_created,
            date_modified: todo.date_modified,
            assigned_by: todo.assigned_by,
            assigned_to: todo.assigned_to
          };
        })
      });
    })
    .catch(err => {
      this.setState({ refreshing: false });
      ToastAndroid.show(err.toString(), ToastAndroid.SHORT);
    });

  }
}

const styles = StyleSheet.create({
  view: {
      backgroundColor:'#e0f2f1',
      flex: 1,
      marginTop: 70
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
