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

All these command are in `ini.sql`

### Schemas

Now we should build schemas for our project.

/[

Other attributes *books* should have

* translator
* original_name
* pages
* language

- [ ] Does the ISBN need a check?
- [ ] Multivalue for author and translator?

]/

### MD5

MD5 是一种加密 hash 函数, 它将 plaintext 密码映为 MD5 密码在**一定程度**上提高了安全性

我们用 psql 自带 `MD5()` 函数对储存在 *miners* 的密码进行加密

但值得注意的是, 除了表中的密码, 我们还会进行数据库用户注册, 即 `CREATE USER user_name WITH PASSWORD pw`, psql 会自动对密码 *pw* 进行加密, 储存在表 *pg_authid* 中 (只有 superuser 能够查看). 所以我们无需再这一步手动加密. 但是注意现在 psql 默认的加密方式是更安全的 scram 加密方式, 而不是 md5.

> The method scram-sha-256 performs SCRAM-SHA-256 authentication, as described in RFC 7677. It is a challenge-response scheme that prevents password sniffing on untrusted connections and supports storing passwords on the server in a cryptographically hashed form that is thought to be secure. ([auth-password](https://www.postgresql.org/docs/13/auth-password.html))

## Psycopg2

See Salt-Box for notes.

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
set FLASK_APP=app
set FLASK_ENV=development
```

here `app` implies that your main python script is `app.py`.

Then build the app

```shell
flask run
```

### Blueprint

为了避免将所有 routes 写在一个文件中, 我们应该设置 `app.py` 为主文件, 然后建立其他功能文件, 然后在 `app.py` 中注册它们, 使组成一个 app. 同时 app configuration 等 meta 信息应该储存在 `app.py` 当中.

注册名为 `auth.py` 中的 routes

```python
# blueprint for auth routes in our app
from auth import auth as auth_blueprint
app.register_blueprint(auth_blueprint)
```

同时注意, 在用 `url_for` method 的时候, argument 应该是**函数名**, 而且非主文件中的函数应该加入 module 名, 如 `url_for('auth.login')`

### Flash

Use flash to display error and success!

### WTForm

Use WTForm to build better forms such as setting default values
