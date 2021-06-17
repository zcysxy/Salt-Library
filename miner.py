'''
This script is about operations related to Miners
'''

from connect import Connect
from flask import render_template, request, url_for, flash, redirect, Blueprint
from flask.blueprints import Blueprint
from flask_login import login_required, current_user
from flask.globals import session
from models import role_required
import numpy as np
from datetime import datetime

miner = Blueprint('miner', __name__)


@miner.route('/profile', methods=['POST', 'GET'])
@login_required
@role_required('miner')
def profile():
    '''Home page for Miners'''

    con = Connect(session['role'], session['db_pw'], transaction=True)

    # Get the activities date range filter
    start_date = request.form.get('start_date') or '1-1-1' # Suppose our app is built after this date
    end_date = request.form.get('end_date') or datetime.today().strftime(
        '%Y-%m-%d')

    # All activities
    acts = con.query(
        '''
        SELECT *
        FROM mark_book_view
        WHERE (id = %s) AND (DATE(mark_time) BETWEEN %s AND %s);
        ''', [current_user.id, start_date, end_date])

    # Buying statistic
    buy = con.query(
        '''
        SELECT
            COALESCE(SUM(bought_num),0) AS bought_num,
            COALESCE(SUM(bought_num * price),0) AS bought_sum
        FROM (
                SELECT bought_num, isbn
                FROM buy_view
                WHERE (id = %s) AND (bought_date BETWEEN %s AND %s)
            ) AS r NATURAL JOIN books
        ''', [current_user.id, start_date, end_date], 1)

    # Reading statistic
    read = con.query(
        '''
        SELECT COUNT(*) AS book_num, ROUND(AVG(read_time(%s, mark_id)),1) AS book_time
        FROM (SELECT * FROM tag WHERE tag_state = 3) AS r NATURAL JOIN marks
        WHERE (id = %s) AND (DATE(mark_time) BETWEEN %s AND %s)
        ''', [current_user.id, current_user.id, start_date, end_date], 1)

    # Rating statistic
    rate = con.query(
        '''
        SELECT COUNT(*) AS rate_num, ROUND(AVG(rating),2) AS avg_rating
        FROM rate_view
        WHERE (id = %s) AND (rate_date BETWEEN %s AND %s)
        ''', [current_user.id, start_date, end_date], 1)

    return render_template('profile.html',
                           profile=current_user,
                           acts=acts,
                           buy=buy,
                           read=read,
                           rate=rate)


@miner.route('/editprofile/', methods=('GET', 'POST'))
@login_required
@role_required('miner')
def editprofile():
    '''Edit user infortion'''

    # Construct the gender dictionary
    gender_dicts = [{
        'gender': ['Female', 1]
    }, {
        'gender': ['Male', 0]
    }, {
        'gender': ['Non-binary', 2]
    }]

    con = Connect(session['role'], session['db_pw'])
    # Get the current information
    content = con.query('SELECT * FROM miners where ID = %s',
                        [current_user.__dict__['id']], 1)

    if request.method == 'POST':
        name = request.form['name'] or None
        mail = request.form['mail'] or None
        phone = request.form['phone'] or None
        gender = request.form['gender']
        age = request.form['age'] or None
        old_password = request.form['old_password'] or None
        new_password = request.form['new_password'] or None
        c_password = request.form['c_password']

        # Check if the Miner want to change their password
        newtf = (new_password is not None)
        if newtf and (new_password != c_password):
            msg = "Two new passwords don't match!"
        else:
            con = Connect(session['role'], session['db_pw'])
            # Call SQL function update_miners to change the profile
            msg = con.query('SELECT update_miners(%s,%s,%s,%s,%s,%s,%s,%s)', [
                current_user.id, old_password, new_password, name, mail, phone,
                gender, age
            ], 1)[0]

        if msg:
            flash(msg, 'danger')
        else:
            flash("Your infomation is updated", "success")
            return redirect(url_for('miner.editprofile'))

    return render_template('editprofile.html',
                           content=content,
                           options=gender_dicts)


@miner.route('/cart', methods=('GET', 'POST'))
@login_required
@role_required('miner')
def cart():
    '''Miner's cart view, where the Miner can either remove some books or buy all'''

    con = Connect(session['role'], session['db_pw'])
    content = con.query(
        '''
        SELECT isbn, title, price, cart_num
        FROM books NATURAL JOIN (SELECT isbn, cart_num FROM cart WHERE id = %s) AS mycart
        ''', [current_user.id])

    # Calculate the total price
    if content:
        total_price = sum(np.array(content)[:, -2] * np.array(content)[:, -1])
    else:
        total_price = 0

    return render_template('cart.html',
                           content=content,
                           total_price=total_price)


@miner.route('/cart/remove/<int:isbn>', methods=('POST', ))
@login_required
@role_required('miner')
def remove4cart(isbn):
    '''Non-view page, for removing books from cart'''

    con = Connect(session['role'], session['db_pw'])
    con.modify('DELETE FROM cart WHERE isbn=%s AND id=%s',
               [str(isbn), current_user.id])

    return redirect(url_for('miner.cart'))


@miner.route('/buy', methods=('POST', ))
@login_required
@role_required('miner')
def buy():
    '''Non-view page, for buying all the books in the cart'''

    con = Connect(session['role'], session['db_pw'])
    # Call SQL procedure buying to buy
    con.execute('CALL buying(%s);', [current_user.id])

    return redirect(url_for('miner.mylibrary'))


@miner.route('/mylibrary', methods=('GET', ))
@login_required
@role_required('miner')
def mylibrary():
    '''A place to show books that are related to the Miner'''

    con = Connect(session['role'], session['db_pw'], transaction=True)

    # Owned books
    owned = con.query(
        '''
        SELECT DISTINCT *
        FROM (SELECT isbn, bought_date FROM buy_view WHERE id=%s) AS r NATURAL JOIN books
        ORDER BY bought_date DESC
        ''', [current_user.id])

    # Tagged books
    tagged = con.query(
        '''
        SELECT tag_state, books.*
        FROM (SELECT isbn, tag_state FROM tag_view WHERE id=%s) AS r NATURAL JOIN books
        ORDER BY tag_state
        ''', [current_user.id])

    toread = []
    reading = []
    read = []
    for book in tagged:
        if book['tag_state'] == 1:
            toread.append(book)
        elif book['tag_state'] == 2:
            reading.append(book)
        elif book['tag_state'] == 3:
            read.append(book)

    # Rating
    rating = con.query(
        '''
        SELECT books.*, rating
        FROM (SELECT isbn, rating FROM rate_view WHERE id=%s) AS r NATURAL JOIN books
        ORDER BY rating DESC
        ''', [current_user.id])

    avg_rating = None if not rating else round(
        np.array(rating)[:, -1].mean(), 2)

    # Request
    request = con.query(
        '''
        SELECT request_state, DATE(request_time) AS request_date, isbn, title, request_time
        FROM request NATURAL LEFT OUTER JOIN requested_books
        WHERE id=%s
        ORDER BY request_time DESC
        ''', [current_user.id])

    con.cc()

    return render_template('mylibrary.html',
                           owned=owned,
                           toread=toread,
                           reading=reading,
                           read=read,
                           rating=rating,
                           avg_rating=avg_rating,
                           request=request)
