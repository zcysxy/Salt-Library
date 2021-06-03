from re import U
from models import role_required
import numpy as np
from flask import Flask, render_template, request, url_for, flash, redirect, Blueprint
from flask.blueprints import Blueprint
from flask.globals import session
from flask_login.utils import login_required, current_user
from werkzeug.exceptions import abort
from connect import Connect

book = Blueprint('book', __name__)

def get_book(isbn):
    con = Connect()
    content = con.query('SELECT * FROM books where isbn = %s', [str(isbn)],1)

    if content is None:
        abort(404)
    
    return content

@book.route('/', methods=('GET', 'POST'))
@book.route('/home/', methods=('GET', 'POST'))
def home():
    if request.method == 'POST':
        title = request.form['title']
        return redirect('/search_result?title=%s' % title)

    best_seller = '''
        SELECT *
        FROM books
        ORDER BY sold DESC
        LIMIT 5
    '''

    best_rated = '''
        SELECT *
        FROM books
        ORDER BY u_rating DESC
        LIMIT 5
    '''

    all_books = '''
        SELECT *
        FROM books
    '''

    con = Connect(transaction=True)
    bs = con.query(best_seller)
    br = con.query(best_rated)
    ab = con.query(all_books)
    con.cc()
    
    return render_template('home.html', bs=bs, br=br, ab=ab)

@book.route('/<int:isbn>')
def book_info(isbn):
    content = get_book(isbn)
    
    # Tag state
    if current_user.is_authenticated:
        con = Connect(session['role'], session['db_pw'])
        tag_state = con.query(
            '''
            SELECT tag_state, DATE(mark_time) AS tag_date
            FROM tag NATURAL JOIN marks
            WHERE
                operation = 2 AND
                isbn = %s AND
                id = %s
            ''',
            [str(isbn),current_user.id], 1
        )
    else:
        tag_state = None
    
    # Tag statistics
    con = Connect()
    tag_stat = np.array(con.query(
        '''
        SELECT tag_state, COUNT(*)
        FROM tag NATURAL JOIN (
            SELECT mark_id
            FROM marks
            WHERE isbn = %s AND operation = 2
        ) AS r
        GROUP BY tag_state
        ''',
        [str(isbn)]
    ))
    tag_stat = dict((int(tag_stat[i,0]), tag_stat[i,1]) for i in range(tag_stat.shape[0]))

    # Your rating
    if current_user.is_authenticated:
        con = Connect(session['role'], session['db_pw'])
        rating = con.query(
            '''
            SELECT rating, DATE(mark_time) AS rate_date
            FROM rate NATURAL JOIN marks
            WHERE
                operation = 4 AND
                isbn = %s AND
                id = %s
            ''',
            [str(isbn),current_user.id], 1
        )
    else:
        tag_state = None

    # User rating
    con = Connect()
    u_rating = con.query(
        '''
        SELECT AVG(rating) AS avg_u_rating, COUNT(*) AS u_num
        FROM rate NATURAL JOIN (
            SELECT mark_id
            FROM marks
            WHERE isbn = %s AND operation = 4
        ) AS r
        ''',
        [str(isbn)], 1
    )
    if u_rating['u_num'] == 0:
        u_rating = None

    # Your review
    if current_user.is_authenticated:
        con = Connect(session['role'], session['db_pw'])
        review = con.query(
            '''
            SELECT content, DATE(mark_time) AS review_date
            FROM review NATURAL JOIN marks
            WHERE
                operation = 3 AND
                isbn = %s AND
                id = %s
            ''',
            [str(isbn),current_user.id], 1
        )
    else:
        review = None

    # User review
    con = Connect()
    u_reviews = con.query(
        '''
        SELECT content, id, DATE(mark_time) AS review_date
        FROM review NATURAL JOIN (
            SELECT mark_id, id, mark_time
            FROM marks
            WHERE isbn = %s AND operation = 3
        ) AS r
        ORDER BY review_date DESC
        ''',
        [str(isbn)]
    )

    return render_template(
        'book.html',
        content = content, 
        tag_state = tag_state,
        tag_stat = tag_stat,
        rating = rating,
        u_rating = u_rating,
        review = review,
        u_reviews = u_reviews
    )

@book.route('/<int:isbn>/tag', methods=('POST',))
@login_required
@role_required('miner')
def tag(isbn):
    state_dict = {'To Read': 1, 'Reading': 2, 'Read': 3}
    tag_state = state_dict[request.form['tag']]

    con = Connect(session['role'], session['db_pw'])
    msg = con.query('SELECT change_tag(%s,%s, %s)', [str(isbn), current_user.id, tag_state],1)[0]
    
    if msg:
        flash(msg, 'danger')

    return redirect('/%d' % isbn)

@book.route('/<int:isbn>/rate', methods=('POST',))
@login_required
@role_required('miner')
def rate(isbn):
    rating = request.form['rating']
    con = Connect(session['role'], session['db_pw'])
    msg = con.query('SELECT change_rating(%s,%s, %s)', [str(isbn), current_user.id, rating],1)[0]

    if msg:
        flash(msg, 'danger')

    return redirect('/%d' % isbn)

@book.route('/<int:isbn>/review', methods=('POST',))
@login_required
@role_required('miner')
def review(isbn):
    content = request.form['review']

    con = Connect(session['role'], session['db_pw'])
    msg = con.query('SELECT change_review(%s,%s,%s)', [str(isbn), current_user.id, content], 1)[0]

    if msg:
        flash(msg, 'danger')

    return redirect('/%d' % isbn)

@book.route('/search_result', methods=('GET','POST'))
def search_result():
    like_title = '%' + '%'.join(request.args.get('title')) + '%'

    con = Connect()
    rows = con.query(
        """
        SELECT *
        FROM books
        WHERE title LIKE %s
        """,
        (like_title,)
    )

    if request.method == 'POST':
        title = request.form['title']
        return redirect('/search_result?title=%s' % title)

    return render_template('search_result.html', result=rows)

@book.route('/ad_search', methods=('GET','POST'))
def ad_search():
    if request.method == 'POST':
        query = '''
            SELECT *
            FROM books
            WHERE
        '''
        value_list = []

        if request.form['title']:
            title = '%' + '%'.join(request.form['title']) + '%'
            query = query + ' title LIKE %s AND'
            value_list.append(title)
        if request.form['isbn']:
            isbn = '%' + request.form['isbn'] + '%'
            query = query + ' isbn LIKE %s AND'
            value_list.append(isbn)
        if request.form['author']:
            author = '%' + '%'.join(request.form['author']) + '%'
            query = query + ' author LIKE %s AND'
            value_list.append(author)
        if request.form['publish_year']:
            publish_year = request.form['publish_year']
            query = query + ' publish_year = %s AND'
            value_list.append(publish_year)
        if request.form['publish_month']:
            publish_month = request.form['publish_month']
            query = query + ' publish_monty = %s AND'
            value_list.append(publish_month)
        if request.form['price_min']:
            price_min = request.form['price_min']
            query = query + ' price >= %s AND'
            value_list.append(price_min)
        if request.form['price_max']:
            price_max = request.form['price_max']
            query = query + ' price <= %s AND'
            value_list.append(price_max)

        query = query + ' 1 = 1'

        con = Connect()
        rows = con.query(query, value_list)
        
        return render_template('ad_search.html', result=rows)

    return render_template('ad_search.html', result=[])

@book.route('/newbook/', methods=('GET','POST'))
def newbook():
    if request.method == 'POST':
        isbn = request.form['isbn']
        title = request.form['title']
        author = request.form['author']
        publisher = request.form['publisher']
        publish_year = request.form['publish_year']
        publish_month = request.form['publish_month']
        price = request.form['price']
    
        if not isbn:
            flash('ISBN is required!', category="danger")
        elif not title:
            flash('Title is required!', category="danger")
        else:
            con = Connect()
            con.modify(
                '''
                INSERT INTO books VALUES (%s, %s, %s, %s, %s, %s, %s);
                ''',
                (isbn, title, author, publisher, publish_year, publish_month, price)
            )
            # A check function needed here!
        
            return redirect(url_for('home'))

    return render_template('newbook.html')

@book.route('/<int:isbn>/edit', methods=('GET', 'POST'))
def editbook(isbn):
    content = get_book(isbn)

    if request.method == 'POST':
        isbn = request.form['isbn']
        title = request.form['title']
        author = request.form['author']
        publisher = request.form['publisher']
        publish_year = request.form['publish_year']
        publish_month = request.form['publish_month']
        price = request.form['price']

        if not isbn:
            flash('isbn is required!', category="danger")
        elif not title:
            flash('Title is required!', category="danger")
        else:
            con = Connect()
            con.modify(
                '''
                UPDATE books
                SET isbn=%s, title=%s, author=%s, publisher=%s, publish_year=%s, publish_month=%s, price=%s 
                WHERE isbn = %s;
                ''',
                (isbn, title, author, publisher, publish_year, publish_month, price, content['isbn'])
            )
            # A check function needed here!

            print('UPDATE SUCCESS')
        
            return redirect('/%s' % isbn)
    
    return render_template('editbook.html', content=content)

@book.route('/requestbook/', methods=('GET','POST'))
@login_required
@role_required('miner')
def requestbook():
    if request.method == 'POST':
        isbn = request.form['isbn']
        title = request.form['title']
        author = request.form['author']
        publisher = request.form['publisher']
        publish_year = request.form['publish_year']
        publish_month = request.form['publish_month']
        price = request.form['price']
    
        if not isbn:
            flash('ISBN is required!', category="danger")
        elif not title:
            flash('Title is required!', category="danger")
        else:
            con = Connect(session['role'],session['db_pw'], transaction=True)
            con.modify(
                '''
                INSERT INTO requested_books VALUES (%s, %s, %s, %s, %s, %s, %s);
                ''',
                (isbn, title, author, publisher, publish_year, publish_month, price)
            )

            con.modify(
                '''
                INSERT INTO request VALUES (%s, %s, CURRENT_TIMESTAMP, 1)
                ''',
                [isbn, current_user.id]
            )
            con.cc()
            # A check function needed here!
        
            return redirect(url_for('miner.mylibrary'))

    return render_template('requestbook.html')

# POST only makes that navigating to the page raise an error,
# since web browser default to GET requests
@book.route('/<int:isbn>/delete', methods=('POST',))
def deletebook(isbn):
    title = get_book(isbn)['title']

    con = Connect()
    con.modify('DELETE FROM books WHERE isbn=%s', [str(isbn)])
    print('DELETE SUCCESS')
    
    flash('Book 《%s》 was deleted!' % title, category="warning")

    return redirect('/')

@book.route('/<int:isbn>/add2chart', methods=('POST',))
@login_required
@role_required('miner')
def add2chart(isbn):
    num = request.form['num']

    #! SQL function needed
    con = Connect(session['role'], session['db_pw'])
    con.modify('INSERT INTO cart VALUES (%s, %s, %s);', [str(isbn), current_user.id, num])
    flash('The book is added to your chart!', 'success')

    return redirect('/%d' % isbn)
