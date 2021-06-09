from flask_login import UserMixin, current_user
from flask import flash, redirect, url_for, session
from connect import Connect
from functools import wraps

# Users model
class User(UserMixin):
    def __init__(self, ID):
        if id != 'curator':
            con = Connect()
            user = con.query('SELECT * FROM miners WHERE ID=%s',[ID],1)
            if user:
                self.__dict__.update(user)
            
            # self.role = 'miner'
        elif id == 'curator':
            self.role = 'curator'
            # self.id = 'curator'

# Roles model
def role_required(*roles):
    def wrapper(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if session['role'] not in roles:
                if session['role'] == 'miner':
                    flash('You are not authorized to access that page!', 'danger')
                    return redirect(url_for('miner.profile'))
                elif session['role'] == 'curator':
                    flash("You are the curator now, don't play around!", 'danger')
                    return redirect(url_for('curator.curator_panel'))
            return f(*args, **kwargs)
        return wrapped
    return wrapper