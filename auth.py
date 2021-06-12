'''
This script is about sign-up, login management
'''

from flask import render_template, request, url_for, flash, redirect, Blueprint
from flask.globals import session
from flask_login import login_user, login_required, logout_user
from connect import Connect, roles_config
from models import User

auth = Blueprint('auth', __name__)


@auth.route('/login', methods=['POST', 'GET'])
def login():
    '''
    - Log in as the curator or a Miner
    - Check if the user exists and if the passwords match
    - Temporarily store the role and database password in the app session
    '''

    if request.method == 'POST':
        ID = request.form['id']
        password = request.form['password']
        role = request.form.get('role')

        # Log in as the curator
        if role == 'curator':
            con = Connect()
            result = con.query(
                "SELECT password AS pw1, MD5(%s) AS pw2 FROM miners WHERE id = 'curator'",
                [password], 1)

            if ID == 'curator' and result['pw1'] == result['pw2']:
                user = User(ID)
                login_user(user)

                # Temporarily store the role and database password in session
                session['role'] = role
                session['db_pw'] = password

                return redirect('/curator')
            else:
                flash("You are not the curator!", "danger")
        # Log in as a Miner
        else:
            con = Connect()
            result = con.query(
                "SELECT password AS pw1, MD5(%s) AS pw2 FROM miners WHERE id = %s",
                [password, ID], 1)

            if result is None:
                flash("The ID doesn't exist!", category="danger")
            elif result['pw1'] != result['pw2']:
                flash("The password is incorrect!", category="danger")
            else:
                flash("Successfully login!", "success")

                user = User(ID)
                login_user(user)

                # Temporarily store the role and database password in session
                session['role'] = 'miner'
                session['db_pw'] = roles_config['miner']

                return redirect('/profile')

        return render_template('login.html')

    return render_template('login.html')


@auth.route('/signup', methods=['POST', 'GET'])
def signup():
    '''
    - Sign up a Miner account
    - Check if the user info is valid
    '''

    # Construc the gender dictionary
    gender_dicts = [{
        'gender': ['Female', 1]
    }, {
        'gender': ['Male', 0]
    }, {
        'gender': ['Non-binary', 2]
    }]

    if request.method == 'POST':
        ID = request.form['id']
        password = request.form['password']
        c_password = request.form['c_password']
        # To get NULL in psql, we need to manually tranform empty string '' to None
        name = request.form['name'] or None
        mail = request.form['mail'] or None
        phone = request.form['phone'] or None
        gender = request.form['gender']
        age = str(request.form['age']) or None

        if password != c_password:
            msg = "Two passwords don't match!"
        else:
            con = Connect()
            # Use SQL function insert_miners to check and insert the new user
            msg = con.query('SELECT insert_miners(%s,%s,%s,%s,%s,%s,%s)',
                            (ID, password, name, mail, phone, gender, age),
                            1)[0]

        if msg:
            flash(msg, 'danger')
        else:
            return redirect(url_for('auth.login'))

    return render_template('signup.html', options=gender_dicts)


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    # Clear the temporary session info
    session.clear()
    flash("Successfully logout!", "success")

    return redirect(url_for('book.home'))