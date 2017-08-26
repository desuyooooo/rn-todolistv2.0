# Midterm Project - TodoList v2.0

Group Laurel:
- Averos, Christian
- Becbec, Wilmarie Faye
- De Guzman, John Rez
- Delicano, Jobea Ann
- Laurel, Kamille Rose

## Application

```
git clone https://github.com/desuyooooo/rn-todolistv2.0.git TodoList-v2.0
cd TodoList-v2.0
npm install
npm start
```
Consists of:
- Adding and assigning of task
- Edit
- Delete
- Comments on task
- Logs

## API

```
git clone -b api2 https://github.com/desuyooooo/express-boilerplate.git Express
cd Express
npm install
mysql -u [username] -p
CREATE DATABASE [database name];
exit
mysql -u [username] -p [database name] < todolist.sql
exit
node index.js
```
### TABLES

- users
```
id int primary key auto_increment not null,
username varchar(20) unique not null,
password varchar(10000) not null;
```

- todos
```
id int not null primary key auto_increment,
title varchar (50) not null,
description varchar (50) not null,
done tinyint default 0,
date_created datetime default CURRENT_TIMESTAMP(),
date_modified datetime,
assigned_by int not null.
assigned_to int not null);
```

- comments
```
id int primary key not null auto_increment,
todo_id int not null,
comment_by int not null,
content varchar (100) not null,
comment_date datetime default CURRENT_TIMESTAMP());
```

- logs
```
id int primary key not null auto_increment,
todo_id int not null,
mode ENUM('add', 'update', 'delete', 'checked', 'comment'),
content varchar (100) not null,
modified_by int not null,
date_modified datetime default CURRENT_TIMESTAMP(),
assigned_to int not null,
assigned_by int not null);
```
