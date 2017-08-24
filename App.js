import React from 'react';
import {   StatusBar, StyleSheet, Text, TextInput, Button, Modal, ToastAndroid, FlatList, View, ViewPagerAndroid, Picker } from 'react-native';
import {
  CheckBox,
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
    this.logoutPress = this.logoutPress.bind(this);
    this.addTodo = this.addTodo.bind(this);
    this.getTodos = this.getTodos.bind(this);
    this._renderUsers = this._renderUsers.bind(this);
    this._renderMyTodos = this._renderMyTodos.bind(this);
    this._renderTheirTodos = this._renderTheirTodos.bind(this);

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
      assigned_to: null,
      style: {}
    };
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
            selectedValue={this.state.assigned_to}
            onValueChange={
              (itemValue, itemIndex) => 
              this.setState({assigned_to: (itemValue) ? itemValue : this.state.sessionId })}>
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

    if (this.state.sessionId){
      leftComponent = {icon: 'exit-to-app', onPress: this.logoutPress}
    }else{
      leftComponent = null;
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
          leftComponent={ leftComponent }
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
                  renderItem={this._renderAllTodos.bind(this)}
                  />
              </View>
              <View style={{backgroundColor:'cornflowerblue'}}>
                <FlatList
                  data={this.state.todos}
                  onRefresh={this.getTodos}
                  refreshing={this.state.refreshing}
                  renderItem={this._renderMyTodos}
                  />
              </View>
              <View style={{backgroundColor:'#1AA094'}}>
                <FlatList
                  data={this.state.todos}
                  onRefresh={this.getTodos}
                  refreshing={this.state.refreshing}
                  renderItem={this._renderTheirTodos}
                  />
              </View>
              <View style={{backgroundColor:'#1AA094'}}>
                <Text>logs</Text>
              </View>
          </IndicatorViewPager>
        </View>
      </View>       
    );
  }

  _renderAllTodos({item}){
    return <Todo item={item} getTodos={this.getTodos} sessionId={this.state.sessionId}/>
  }

  _renderMyTodos({item}){
    if (item.assigned_to === this.state.sessionId){
        return <Todo item={item} getTodos={this.getTodos} sessionId={this.state.sessionId}/>
    }
  }

  _renderTheirTodos({item}){
    if (item.assigned_by === this.state.sessionId && item.assigned_to !== this.state.sessionId){
        return <Todo item={item}  getTodos={this.getTodos} sessionId={this.state.sessionId}/>
    }
  }

  _renderTitleIndicator() {
    return <PagerTitleIndicator titles={['ALL', 'MINE', 'THEIRS', 'LOGS']} />;
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
                  modalContent: 'add',
                  assigned_to: response.data.id
                });
            }catch(e){
              
            }
          })
          .catch(err => ToastAndroid.show(err.response.data.error, ToastAndroid.LONG))
          .then(this.getTodos)
          .then(this._renderUsers)
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
    }else{
      ToastAndroid.show('Don\'t include special characters!', ToastAndroid.LONG);
    }
  }

  logoutPress(){
    this.setState({
      sessionId: null,
      modalContent: 'login',
      modalVisible: false,
      username: null,
      password: null,
      todos: [],
      users: []
    })
  }

  addTodo(){
    axios.post(api + '/api/todos/add', 
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
          assigned_to: this.state.sessionId,
          modalVisible: false
        })
      })
      .catch(err => ToastAndroid.show(err.response.data.error, ToastAndroid.LONG))
      .then(this._renderUsers)
      .then(this.getTodos)
  }

  getTodos(){
    this.setState({ refreshing: true });

    axios.post(api + '/api/todos/', {userid: this.state.sessionId})
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
            name_assigned_by: todo.name_assigned_by,
            assigned_to: todo.assigned_to,
            name_assigned_to: todo.name_assigned_to
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

class Todo extends React.Component{
  constructor(props, ctx){
    super(props, ctx);

    this.deleteItem = this.deleteItem.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.checkItem = this.checkItem.bind(this);
    this.pressItem = this.pressItem.bind(this);
    this.addComment = this.addComment.bind(this);
    this.getComments = this.getComments.bind(this);

    this.state = {
      sessionId: this.props.sessionId,
      item: this.props.item,
      title: this.props.item.title,
      description: this.props.item.description,
      modalVisible: false,
      editable: false,
      refreshing: false,
      comment: '',
      comments: []
    }
  }

  componentDidMount(){
    this.getComments();
  }

  render(){
    if(this.state.editable){
      content =
        <View>
          <Button 
              color='#e91e63'
              title='SAVE CHANGES'
              onPress={this.updateItem}/>
          <Text></Text>
          <Button 
              color='#e91e63'
              title='CANCEL'
              onPress={()=>this.setState({editable: false, title: this.state.item.title, description: this.state.item.description})}/>
        </View>;
    }else{
      content = 
        <View>
          <Button 
              color='#e91e63'
              title='EDIT'
              onPress={()=>this.setState({editable: true})}/>
          <Text></Text>
          <Button 
              color='#e91e63'
              title='DELETE'
              onPress={this.deleteItem}/>
        </View>;
    }

    return(
      <View>
        <CheckBox 
          checked={this.state.item.done}
          onIconPress={this.checkItem}
          onPress={this.pressItem}
          textStyle={this.state.style}
          title={this.state.item.title}
        />
        <Modal
          animationType="slide"
          onRequestClose={() => this.setState({ modalVisible: false, editable: false })}
          transparent={false}
          visible={this.state.modalVisible}>
          <View style={{padding: 10}}>
            <FormLabel>TITLE</FormLabel>
            <TextInput 
              style={{height: 30, fontSize: 20, paddingBottom: 5}} 
              editable={this.state.editable} 
              onChangeText={(title) => this.setState({title})}
              value={this.state.title}
              />
            <FormLabel>DESCRIPTION</FormLabel>
            <TextInput 
              style={{height: 30, fontSize: 20, paddingBottom: 5}}
              editable={this.state.editable}
              onChangeText={(description) => this.setState({description})}
              value={this.state.description}/>
            <FormLabel>{`ASSIGNED BY: ${this.state.item.name_assigned_by}     ASSIGNED TO: ${this.state.item.name_assigned_to}`}</FormLabel>
            <FormLabel>{`DATE CREATED: ${this.state.item.date_created}`}</FormLabel>
            {
            //<FormLabel>{`DATE MODIFIED: ${(this.state.item.date_modified)?this.state.item.date_modified:'N/A'}`}</FormLabel>}
            }
            <View style={{marginTop: 10, marginBottom: 10}}>
              {content}
            </View>
            <View style={{height: 280, marginTop: 10}}>
            <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
               <TextInput
                style={{width: 300, paddingBottom:5}} 
                editable={!this.state.editable}
                onChangeText={(comment) => this.setState({comment})}
                value={this.state.comment}/>
               <Icon name='send' onPress={this.addComment}/>
            </View>
            <FlatList
              style={{marginTop:10}}
              data={this.state.comments}
              refreshing={this.state.refreshing}
              renderItem={({item})=><Text>{(item.comment_by==this.state.sessionId)?'Me':item.name_comment_by}: {item.content}</Text>}
            />
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  checkItem(){
    item = this.state.item;
    item.done = !item.done;
    this.setState({
      item: item
    })
    axios.put(api + `/api/todos/checked/${item.key}`, {done: (this.state.item.done)? 1 : 0 } )
      .then(this.props.getTodos)
  }

  pressItem(){
    this.setState({ modalVisible: true });
    this.getComments();
  }

  deleteItem(){
    axios.delete(api + `/api/todos/${this.state.item.key}`)
      .then(response => {
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
        this.setState({modalVisible: false})
      })
      .then(this.props.getTodos)
  }

  updateItem(){
    item = this.state.item;
    item.title = this.state.title;
    item.description = this.state.description;
    axios.put(api + `/api/todos/${this.state.item.key}`, {title: this.state.title, description: this.state.description})
      .then(response => {
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
        this.setState({
          editable: false,
          item: item
        })
      })
      .then(this.props.getTodos)
  }

  addComment(){
    axios.post(api + `/api/todos/${this.state.item.key}/comments`, {comment_by: this.state.sessionId, content: this.state.comment})
      .then(response => {
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
        this.setState({
          comment: ''
        })
      })
      .then(this.getComments)
  }

  getComments(){
    axios.get(api + `/api/todos/${this.state.item.key}/comments`)
      .then(response => {
        const comments = response.data;
      
        this.setState({
          refreshing: false,
          comments: comments.map(function (comment) {
            return {
              key: comment.id,
              content: comment.content,
              comment_by: comment.comment_by,
              name_comment_by: comment.name_comment_by
            }
          })
        });
    })
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
