# Project Process

> In this file I record the process of me building the **Salt Library** LMS

## Python

## Postgresql

### Setup

First you should set up a new *super* user and corresponding database(s) for thr project.

For new user

```sql
CREATE USER curator WITH PASSWORD 'SaltLibrary' CREATEDB CREATEROLE;
```

After this, you can enter the connection by

```shell
psql -U curator -d postgres
```

/[

这里只能进入 `postgres` 数据库, 这似乎是一个跟 `port` 有关的 db cluster. 所有 postgresql 里的数据库都会被显示.

若只使用 `psql -U curator` 则会显示错误 `database "curator" does not exists`. 这是因为 psql 默认进入**同名**数据库. 解决这个问题自然可以先创建一个同名数据库, 如

```shell
createdb -U postgres curator
```

]/

## Psycopg2

## Flask

2021-05-21

I'm ready to use flask to build a **web app** for this pj.

### Virtural Environment

First I use package `virturalenv` to set up an virtural env **`myenv`** for this pj.

* Pj folder path: `D:\OneDrive1\Desktop\Database\pj\Salt-Library`
* Activate the v-env: `.\myenv\Scripts\activate`
* Deactivate: `deactivate`

### Build the App

To build the app you should first run

```shell
set FLASK_APP=main
set FLASK_ENV=development
```

here `main` implies that your main python script is `main.py`.

Then build the app

```shell
flask run
```