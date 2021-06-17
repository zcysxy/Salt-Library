#!venv/bin/python3
from flask import Flask
from flask_login import LoginManager
from models import User

app = Flask(__name__)
app.config['SECRET_KEY'] = 'SaltLibrary'

# Register blueprints
# 4 parts: auth, book, miner, curator
from auth import auth
app.register_blueprint(auth)

from book import book
app.register_blueprint(book)

from miner import miner
app.register_blueprint(miner)

from curator import curator
app.register_blueprint(curator)

# Set up login manager
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message = "You need to be logged in to view that page!"
login_manager.login_message_category = "danger"
login_manager.init_app(app)


@login_manager.user_loader
def load_user(ID):
    return User(ID)


if __name__ == '__main__':
    # For VS Code debug mode
    # app.run(use_debugger=False, use_reloader=False, passthrough_errors=True)

    # For waitress deployment mode
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)