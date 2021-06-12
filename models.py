'''
This script is about the user model and role model used by the app
'''

from flask_login import UserMixin
from flask import flash, redirect, url_for, session
from connect import Connect
from functools import wraps


# Users model
class User(UserMixin):
    def __init__(self, ID):
        con = Connect()
        # Get the user info
        user = con.query('SELECT * FROM miners WHERE ID=%s', [ID], 1)
        if user:
            # Store the user info into current_user
            self.__dict__.update(user)


# Roles model
# Two log-in roles: Miner & curator
def role_required(*roles):
    def wrapper(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if session['role'] not in roles:
                if session['role'] == 'miner':
                    # For curator-only pages
                    flash('You are not authorized to access that page!',
                          'danger')
                    return redirect(url_for('miner.profile'))
                elif session['role'] == 'curator':
                    # For Miner-only pages
                    flash("You are the curator now, don't play around!",
                          'danger')
                    return redirect(url_for('curator.curator_panel'))
            return f(*args, **kwargs)

        return wrapped

    return wrapper