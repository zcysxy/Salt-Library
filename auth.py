from flask import Flask, render_template, request, url_for, flash, redirect, Blueprint
from flask.globals import session
from flask_login import login_user, UserMixin, login_required, logout_user, current_user
from connect import Connect
from models import User

auth = Blueprint('auth', __name__)

#! To move
miner_config = {'db_pw': 'miner'}

@auth.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        ID = request.form['id']
        password = request.form['password']
        role = request.form.get('role')

        if role == 'curator':
            user = User(ID,  role)
            login_user(user)
            session['role'] = role
            session['db_pw'] = password
            return redirect('/curator')
        else:
            con = Connect()
            result = con.query("SELECT password AS pw1, MD5(%s) AS pw2 FROM miners WHERE id = %s", [password, ID], 1)

            if result is None:
                flash("The ID doesn't exist!", category="danger")
            elif result['pw1'] != result['pw2']:
                flash("The password is incorrect!", category="danger")
            else:
                flash("Successfully login!", "success")

                user = User(ID, role)
                login_user(user)
                session['role'] = 'miner'
                session['db_pw'] = miner_config['db_pw']
                return redirect('/profile')
        
        return render_template('login.html')

    return render_template('login.html')

@auth.route('/signup', methods=['POST', 'GET'])
def signup():
    gender_dicts = [{'gender': ['Female', 1]}, {'gender': ['Male', 0]}, {'gender': ['Non-binary', 2]}]

    if request.method == 'POST':
        ID = request.form['id']
        password = request.form['password']
        c_password = request.form['c_password']
        name = request.form['name'] or None
        mail = request.form['mail'] or None
        phone = request.form['phone'] or None
        gender = request.form['gender']
        # Since AGE is int type, we need to manually tranform it to None if it's missing
        age = str(request.form['age']) or None
    
        if password != c_password:
            msg = "Two passwords don't match!"
        else:
            con = Connect()
            msg = con.query('SELECT insert_miners(%s,%s,%s,%s,%s,%s,%s)',(ID,password,name,mail,phone,gender,age),1)[0]

        if msg:
            flash(msg,'danger')
        else:
            return redirect(url_for('auth.login'))

    return render_template('signup.html', options=gender_dicts)

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    flash("Successfully logout!", "success")
    return redirect(url_for('book.home'))