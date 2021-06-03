#!venv/bin/python3
from flask import Flask
from flask_login import LoginManager
from models import User

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
def load_user(ID):
    return User(ID)

if __name__ == '__main__':
    app.run(use_debugger=False, use_reloader=False, passthrough_errors=True)