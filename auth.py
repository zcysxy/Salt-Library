import re
from flask import Flask, render_template, request, url_for, flash, redirect, Blueprint
from flask_login import login_user, UserMixin, login_required, logout_user
import connect as con
from psycopg2.extensions import AsIs, quote_ident

auth = Blueprint('auth', __name__)

# User model
class User(UserMixin):
    def __init__(self, id):
        conn, cur = con.connect()
        cur.execute('SELECT * FROM miners WHERE ID=%s',[id])
        user = cur.fetchone()
        cur.close()
        conn.close()
        self.__dict__.update(user)

@auth.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        ID = request.form['id']
        password = request.form['password']

        conn, cur = con.connect()
        cur.execute("SELECT password AS pw1, MD5(%s) AS pw2 FROM miners WHERE id = %s", [password, ID])
        result = cur.fetchone()
        cur.close()
        conn.close()

        if result is None:
            flash("The ID doesn't exist!", category="danger")
        elif result['pw1'] != result['pw2']:
            flash("The password is incorrect!", category="danger")
        else:
            flash("Successfully login!", "success")

            user = User(ID)
            login_user(user)
            return redirect('/profile/')
        
        return render_template('login.html')

    return render_template('login.html')

@auth.route('/signup', methods=['POST', 'GET'])
def signup():
    gender_dicts = [{'gender': ['Female', 1]}, {'gender': ['Male', 0]}, {'gender': ['Non-binary', 2]}]

    if request.method == 'POST':
        ID = request.form['id']
        password = request.form['password']
        c_password = request.form['c_password']
        name = request.form['name']
        mail = request.form['mail']
        phone = request.form['phone']
        gender = request.form['gender']
        # Since AGE is int type, we need to manually tranform it to None if it's missing
        age = request.form['age'] if request.form['age'] else None
    
        #! A lot of check here
        if not True:
            pass
        else:
            conn, cur = con.connect()
            cur.execute(
                '''
                INSERT INTO miners VALUES (%s, MD5(%s), %s, %s, %s, %s, %s);
                ''',
                (ID, password, name, mail, phone, gender, age)
            )
            # A check function needed here!

            cur.execute(
                '''
                CREATE USER %s WITH PASSWORD %s
                ''',
                (AsIs(ID), password)
            )

            conn.commit()
            cur.close()
            conn.close()
        
            return redirect(url_for('auth.login'))

    return render_template('signup.html', options=gender_dicts)

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    flash("Successfully logout!", "success")
    return redirect(url_for('book.home'))