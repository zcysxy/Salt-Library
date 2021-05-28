#!venv/bin/python3
import re
from flask import Flask, render_template, request, url_for, flash, redirect, Blueprint
from flask.blueprints import Blueprint
from flask_login import LoginManager, UserMixin
from werkzeug.exceptions import abort
import connect as con
from auth import User
import psycopg2

app = Flask(__name__)
app.config['SECRET_KEY'] = 'SaltLibrary'

# blueprint for auth routes in our app
from auth import auth as auth_blueprint
app.register_blueprint(auth_blueprint)

# blueprint for book parts of app
from book import book as book_blueprint
app.register_blueprint(book_blueprint)

# blueprint for user parts of app
from miner import miner as miner_blueprint
app.register_blueprint(miner_blueprint)

login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message = "You need to be logged in to view that page!"
login_manager.login_message_category = "danger"
login_manager.init_app(app)

@login_manager.user_loader
def load_user(id):
    return User(id)