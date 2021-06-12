'''
This script is about operations related to the curator
'''

from connect import Connect
from flask import render_template, request, url_for, flash, redirect, Blueprint
from flask.blueprints import Blueprint
from flask_login import login_required
from flask.globals import session
from models import role_required
import numpy as np
from datetime import datetime
from psycopg2.extensions import AsIs

curator = Blueprint('curator', __name__)


@curator.route('/curator/')
@login_required
@role_required('curator')
def curator_panel():
    '''Home page for the curator'''

    con = Connect(session['role'], session['db_pw'])
    acts = con.query('''
        SELECT *
        FROM mark_book_view
        LIMIT 100
        ''')
    return render_template('curator.html', acts=acts)


@curator.route('/miners', methods=['POST', 'GET'])
@login_required
@role_required('curator')
def miners():
    '''List Miners under a certain filter'''

    query = '''
        SELECT id, name, mail, phone, gender, age, reg_date, COALESCE(ai,0) AS active_index, COALESCE(c,0) AS consumption
        FROM
            miners NATURAL LEFT OUTER JOIN
            (
                SELECT id, COUNT(*) AS ai
                FROM marks
                WHERE %s <= DATE(mark_time) AND DATE(mark_time) <= %s
                GROUP BY id
            ) AS r1 NATURAL LEFT OUTER JOIN
            (
                SELECT id, SUM(bought_num * price) AS c
                FROM buy_view NATURAL JOIN books
                WHERE %s <= bought_date AND bought_date <= %s
                GROUP BY id
            ) AS r2
        WHERE
            (gender IN %s) AND
            ((age BETWEEN %s AND %s) %s) AND
            (reg_date BETWEEN %s AND %s) AND
            (COALESCE(ai,0) BETWEEN %s AND %s) AND
            (COALESCE(c,0) BETWEEN %s AND %s) %s %s
        ORDER BY %s %s
    '''

    con = Connect(session['role'], session['db_pw'])

    if request.method == 'POST':
        start_date = request.form['start_date']
        end_date = request.form['end_date']
        order_by = request.form['order_by']
        order = request.form['order']
        gender = (
            -1 if not request.form.get('male') else int(
                request.form.get('male')),
            -1 if not request.form.get('female') else int(
                request.form.get('female')),
            -1 if not request.form.get('non-binary') else int(
                request.form.get('non-binary')),
        )
        if request.form.get('min_age') or request.form.get('max_age'):
            null_age = ''
        else:
            null_age = 'OR age IS NULL'
        min_age = request.form.get('min_age') or 0
        max_age = request.form.get('max_age') or AsIs("FLOAT8 '+INFINITY'")
        start_reg_date = request.form.get('start_reg_date') or '1-1-1'
        end_reg_date = request.form.get(
            'end_reg_date') or datetime.today().strftime('%Y-%m-%d')
        min_ai = request.form.get('min_ai') or 0
        max_ai = request.form.get('max_ai') or AsIs("FLOAT8 '+INFINITY'")
        min_cons = request.form.get('min_cons') or 0
        max_cons = request.form.get('max_cons') or AsIs("FLOAT8 '+INFINITY'")
        mail = 'AND mail IS NOT NULL' if request.form.get('mail') else ''
        phone = 'AND phone IS NOT NULL' if request.form.get('phone') else ''

        if start_date > end_date:
            flash('Please make sure your end date >= start date', 'warning')

    else:
        start_date = '1-1-1'  # We assume that our app is built after this time
        end_date = datetime.today().strftime('%Y-%m-%d')
        order_by = 'reg_date'
        order = 'DESC'
        gender = (0, 1, 2)
        min_age = 0
        max_age = AsIs("FLOAT8 '+INFINITY'")
        null_age = 'OR age IS NULL'
        start_reg_date = start_date
        end_reg_date = end_date
        min_ai = min_age
        max_ai = max_age
        min_cons = min_age
        max_cons = max_age
        mail = ''
        phone = ''

    content = con.query(query, [
        start_date, end_date, start_date, end_date,
        AsIs(gender), min_age, max_age,
        AsIs(null_age), start_reg_date, end_reg_date, min_ai, max_ai, min_cons,
        max_cons,
        AsIs(mail),
        AsIs(phone),
        AsIs(order_by),
        AsIs(order)
    ])
    miner_num = np.shape(content)[0]

    if not request.method == 'POST':
        # Let the date of the first registration be the default start date
        start_date = np.array(content)[-1, 6]

    return render_template('miners.html',
                           content=content,
                           miner_num=miner_num,
                           start_date=start_date,
                           end_date=end_date,
                           order_by=order_by,
                           order=order,
                           gender=gender)


@curator.route('/requests')
@login_required
@role_required('curator')
def requests():
    '''For the curator to manage all the requests'''

    con = Connect(session['role'], session['db_pw'])
    books = con.query('SELECT * FROM requested_books')
    return render_template('requests.html', requests=books)


@curator.route('/add_request/<int:isbn>', methods=['POST'])
@login_required
@role_required('curator')
def add_request(isbn):
    '''Non-view page, for approving a request directly'''

    con = Connect(session['role'], session['db_pw'])
    con.modify(
        '''
        INSERT INTO books(isbn, title, author, publisher, publish_year, publish_month, price)
            SELECT requested_books.*
            FROM requested_books
            WHERE isbn = %s
        ''', [str(isbn)])

    return redirect(url_for('curator.requests'))


@curator.route('/turndown/<int:isbn>', methods=['POST'])
@login_required
@role_required('curator')
def turndown(isbn):
    '''Non-view page, for turning down a request'''

    con = Connect(session['role'], session['db_pw'])
    con.modify(
        '''
        UPDATE request
        SET request_state = 3
        WHERE isbn = %s
        ''', [str(isbn)])

    return redirect(url_for('curator.requests'))


@curator.route('/sales', methods=['POST', 'GET'])
@login_required
@role_required('curator')
def sales():
    '''View sales records under certain date range filter'''

    con = Connect(session['role'], session['db_pw'])

    # A date range filter is applied
    if request.method == 'POST':
        start_date = request.form['start_date']
        end_date = request.form['end_date']

        if start_date > end_date:
            flash('Please make sure your end date >= start date', 'warning')

        records = con.query(
            '''
            SELECT buy_view.*, title, (bought_num * price) AS total_price
            FROM buy_view NATURAL JOIN books
            WHERE %s <= bought_date AND bought_date <= %s
            ORDER BY bought_date DESC
            ''', [start_date, end_date])

    # Show all sales records
    else:
        records = con.query('''
            SELECT buy_view.*, title, (bought_num * price) AS total_price
            FROM buy_view NATURAL JOIN books
            ORDER BY bought_date DESC
            ''')

        # start_date as the date of the first record, end_date as today
        start_date = str(np.array(records)[-1, 2])
        end_date = datetime.today().strftime('%Y-%m-%d')

    total_sales = 0 if not records else sum(np.array(records)[:, -1])

    return render_template('sales.html',
                           records=records,
                           start_date=start_date,
                           end_date=end_date,
                           total_sales=total_sales)


@curator.route('/books', methods=['POST', 'GET'])
@login_required
@role_required('curator')
def books():
    '''List all books under a certain filter'''

    # Base query
    query = '''
        SELECT *
        FROM books
        WHERE
    '''
    value_list = []

    # Add advanced filters to the base query
    if request.method == 'POST':
        if request.form.get('title'):
            title = '%' + '%'.join(request.form.get('title')) + '%'
            query = query + ' title LIKE %s AND'
            value_list.append(title)
        if request.form.get('isbn'):
            isbn = '%' + request.form.get('isbn') + '%'
            query = query + ' isbn LIKE %s AND'
            value_list.append(isbn)
        if request.form.get('author'):
            author = '%' + '%'.join(request.form.get('author')) + '%'
            query = query + ' author LIKE %s AND'
            value_list.append(author)
        if request.form.get('publisher'):
            publisher = '%' + '%'.join(request.form.get('publisher')) + '%'
            query = query + ' publisher LIKE %s AND'
            value_list.append(publisher)
        if request.form.get('min_publish_year'):
            min_publish_year = request.form.get('min_publish_year')
            query = query + ' publish_year >= %s AND'
            value_list.append(min_publish_year)
        if request.form.get('max_publish_year'):
            max_publish_year = request.form.get('max_publish_year')
            query = query + ' publish_year <= %s AND'
            value_list.append(max_publish_year)
        if request.form.get('min_publish_month'):
            min_publish_month = request.form.get('min_publish_month')
            query = query + ' publish_month >= %s AND'
            value_list.append(min_publish_month)
        if request.form.get('max_publish_month'):
            max_publish_month = request.form.get('max_publish_month')
            query = query + ' publish_month <= %s AND'
            value_list.append(max_publish_month)
        if request.form.get('price_min'):
            price_min = request.form.get('price_min')
            query = query + ' price >= %s AND'
            value_list.append(price_min)
        if request.form.get('price_max'):
            price_max = request.form.get('price_max')
            query = query + ' price <= %s AND'
            value_list.append(price_max)

    query = query + ' 1 = 1'  # To close the predicate

    con = Connect(session['role'], session['db_pw'])
    rows = con.query(query, value_list)

    # Scroll to the result
    scroll = (request.method == 'POST') * 'result'

    return render_template('books.html', rows=rows, scroll=scroll)


@curator.route('/sql', methods=['POST', 'GET'])
@login_required
@role_required('curator')
def sql():
    '''The most direct way for the curator to connect to the database'''

    query = request.form.get('query')

    if query:
        con = Connect(session['role'], session['db_pw'])
        result = con.query(query)
        # Or show the error message
        err = con.err

        return render_template('sql.html', result=result, err=err, scroll='result')

    return render_template('sql.html')