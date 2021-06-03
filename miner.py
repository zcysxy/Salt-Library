from connect import Connect
from flask import Flask, render_template, request, url_for, flash, redirect, Blueprint
from flask.blueprints import Blueprint
from flask_login import login_required, current_user
from flask.globals import session
from werkzeug.exceptions import abort
from models import role_required
import numpy as np

miner = Blueprint('miner', __name__)

@miner.route('/profile/')
@login_required
@role_required('miner')
def profile():
    return render_template('profile.html', profile=current_user, session_infor=session)

@miner.route('/editprofile/', methods=('GET', 'POST'))
@login_required
@role_required('miner')
def editprofile():
    gender_dicts = [{'gender': ['Female', 1]}, {'gender': ['Male', 0]}, {'gender': ['Non-binary', 2]}]
    
    con = Connect(session['role'], session['db_pw'])
    content = con.query('SELECT * FROM miners where ID = %s', [current_user.__dict__['id']],1)

    if request.method == 'POST':
        name = request.form['name']
        mail = request.form['mail'] or None
        phone = request.form['phone'] or None
        gender = request.form['gender']
        age = request.form['age'] or None
        old_password = request.form['old_password'] or None
        new_password = request.form['new_password'] or None
        c_password = request.form['c_password']

        newtf = (new_password is not None)

        query = (
            'UPDATE miners\n' +
            'SET name=%s, mail=%s, phone=%s, gender=%s, age=%s' +
            (', password=MD5(%s)' * newtf) +
            '\nWHERE id = %s;'
        )
        values = [name, mail, phone, gender, age, content['id']] + ([new_password] * newtf)

        if newtf and (new_password != c_password):
            flash("Two new passwords don't match!", 'danger')


        con = Connect(session['role'], session['db_pw'])
        con.modify(query, values)
        # A check function needed here!
        
        flash("Your infomation is updated", "success")
        return redirect(url_for('miner.editprofile'))
    
    return render_template('editprofile.html', content=content, options=gender_dicts)

@miner.route('/cart', methods=('GET', 'POST'))
@login_required
@role_required('miner')
def cart():
    con = Connect(session['role'], session['db_pw'])
    content = con.query(
        '''
        SELECT isbn, title, price, cart_num
        FROM books NATURAL JOIN (SELECT isbn, cart_num FROM cart WHERE id = %s) AS mycart
        ''',
        [current_user.__dict__['id']]
    )
    
    if content:
        total_price = sum(np.array(content)[:,-2] * np.array(content)[:,-1])
    else:
        total_price = 0

    return render_template('cart.html', content=content, total_price=total_price)

@miner.route('/cart/remove/<int:isbn>', methods=('POST',))
@login_required
@role_required('miner')
def remove4cart(isbn):
    con = Connect(session['role'], session['db_pw'])
    con.modify('DELETE FROM cart WHERE isbn=%s AND id=%s', [str(isbn), current_user.id])

    return redirect(url_for('miner.cart'))

@miner.route('/buy', methods=('POST',))
@login_required
@role_required('miner')
def buy():
    con = Connect(session['role'], session['db_pw'])
    con.execute('CALL buying(%s);',[current_user.id])
    return redirect(url_for('miner.mylibrary'))

@miner.route('/mylibrary', methods=('GET',))
@login_required
@role_required('miner')
def mylibrary():
    con = Connect(session['role'], session['db_pw'], transaction=True)

    # Owned books
    owned = con.query(
        '''
        SELECT DISTINCT books.*
        FROM buy NATURAL JOIN marks NATURAL JOIN books
        WHERE id=%s
        ''',
        [current_user.id]
    )

    # To read
    toread = con.query(
        '''
        SELECT books.*
        FROM tag NATURAL JOIN marks NATURAL JOIN books
        WHERE id=%s AND tag_state=1
        ''',
        [current_user.id]
    )

    # Reading
    reading = con.query(
        '''
        SELECT books.*
        FROM tag NATURAL JOIN marks NATURAL JOIN books
        WHERE id=%s AND tag_state=2
        ''',
        [current_user.id]
    )

    # Read
    read = con.query(
        '''
        SELECT books.*
        FROM tag NATURAL JOIN marks NATURAL JOIN books
        WHERE id=%s AND tag_state=3
        ''',
        [current_user.id]
    )

    # Rating
    rating = con.query(
        '''
        SELECT books.*, rating
        FROM rate NATURAL JOIN marks NATURAL JOIN books
        WHERE id=%s
        ORDER BY rating DESC
        ''',
        [current_user.id]
    )

    # Request
    request = con.query(
        '''
        SELECT requested_books.*, DATE(request_time) AS request_date, request_time
        FROM request NATURAL JOIN requested_books
        WHERE id=%s
        ORDER BY request_time DESC
        ''',
        [current_user.id]
    )

    con.cc()

    return render_template(
        'mylibrary.html',
        owned = owned,
        toread = toread,
        reading = reading,
        read = read,
        rating = rating,
        request = request
    )