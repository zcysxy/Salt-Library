'''
This script is about dealing with books in the library
'''

from models import role_required
import numpy as np
from flask import render_template, request, url_for, flash, redirect, Blueprint
from flask.blueprints import Blueprint
from flask.globals import session
from flask_login.utils import login_required, current_user
from werkzeug.exceptions import abort
from connect import Connect

book = Blueprint('book', __name__)


def get_book(isbn):
    '''A simple function to get the book info from its ISBN'''

    con = Connect()
    content = con.query('SELECT * FROM books where isbn = %s', [str(isbn)], 1)

    if content is None:
        abort(404)

    return content


@book.route('/', methods=('GET', 'POST'))
@book.route('/home/', methods=('GET', 'POST'))
def home():
    '''Home page of the app'''

    if request.method == 'POST':
        title = request.form['title']
        return redirect('/search_result?title=%s' % title)

    # Three "face" tabs for the app
    # Best Sellers, Top Rated, and All Books
    best_seller = '''
        SELECT *
        FROM books
        WHERE sold > 0
        ORDER BY sold DESC
        LIMIT 5
    '''

    top_rated = '''
        SELECT *
        FROM books
        WHERE u_rating IS NOT NULL
        ORDER BY u_rating DESC
        LIMIT 5
    '''

    all_books = '''
        SELECT *
        FROM books
        ORDER BY RANDOM()
    '''

    con = Connect(transaction=True)
    bs = con.query(best_seller)
    tr = con.query(top_rated)
    ab = con.query(all_books)
    con.cc()

    return render_template('home.html', bs=bs, tr=tr, ab=ab)


@book.route('/search_result', methods=('GET', 'POST'))
def search_result():
    '''Simple fuzzy search'''

    if request.args.get('title'):
        # Construct the fuzzy pattern of the book title
        like_title = '%' + '%'.join(request.args.get('title')) + '%'

        con = Connect()
        rows = con.query(
            """
            SELECT *
            FROM books
            WHERE title LIKE %s
            """, (like_title, ))
    else:
        rows = []

    if request.method == 'POST':
        title = request.form['title']

        return redirect('/search_result?title=%s' % title)

    return render_template('search_result.html', result=rows)


@book.route('/ad_search', methods=('GET', 'POST'))
def ad_search():
    if request.method == 'POST':
        # Base query
        query = '''
            SELECT *
            FROM books
            WHERE
        '''
        value_list = []

        # Add advanced filter to the base query
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
        if request.form['publisher']:
            publisher = '%' + '%'.join(request.form['publisher']) + '%'
            query = query + ' publisher LIKE %s AND'
            value_list.append(publisher)
        if request.form['min_publish_year']:
            min_publish_year = request.form['min_publish_year']
            query = query + ' publish_year >= %s AND'
            value_list.append(min_publish_year)
        if request.form['max_publish_year']:
            max_publish_year = request.form['max_publish_year']
            query = query + ' publish_year <= %s AND'
            value_list.append(max_publish_year)
        if request.form['min_publish_month']:
            min_publish_month = request.form['min_publish_month']
            query = query + ' publish_month >= %s AND'
            value_list.append(min_publish_month)
        if request.form['max_publish_month']:
            max_publish_month = request.form['max_publish_month']
            query = query + ' publish_month <= %s AND'
            value_list.append(max_publish_month)
        if request.form['price_min']:
            price_min = request.form['price_min']
            query = query + ' price >= %s AND'
            value_list.append(price_min)
        if request.form['price_max']:
            price_max = request.form['price_max']
            query = query + ' price <= %s AND'
            value_list.append(price_max)

        query = query + ' 1 = 1'  # To close the predicate

        con = Connect()
        rows = con.query(query, value_list)

        return render_template('ad_search.html', result=rows, scroll='result')

    return render_template('ad_search.html', result=[])


@book.route('/<int:isbn>')
def book_info(isbn):
    '''
    The page of a book, including
    - book information
    - add to cart button
    - your tag
    - users tag state statistics
    - your rating
    - users average rating
    - your review
    - users reviews
    '''
    content = get_book(isbn)

    # If logged in
    if current_user.is_authenticated and session['role'] == 'miner':
        con = Connect(session['role'], session['db_pw'], transaction=True)

        # Your tag
        tag_state = con.query(
            '''
            SELECT tag_date, tag_state
            FROM tag_view
            WHERE isbn = %s AND id = %s
            ''', [str(isbn), current_user.id], 1)

        # Your rating
        rating = con.query(
            '''
            SELECT rating, rate_date
            FROM rate_view
            WHERE isbn = %s AND id = %s
            ''', [str(isbn), current_user.id], 1)

        # Your review
        review = con.query(
            '''
            SELECT content, review_date
            FROM review_view
            WHERE isbn = %s AND id = %s
            ''', [str(isbn), current_user.id], 1)

        con.cc()
    else:
        tag_state = None
        rating = None
        review = None

    # Statistics for public
    con = Connect(transaction=True)
    # Tag statistics
    tag_stat = np.array(
        con.query(
            '''
            SELECT tag_state, COUNT(*)
            FROM (SELECT tag_state FROM tag_view WHERE isbn=%s) AS r
            GROUP BY tag_state
            ''', [str(isbn)]))
    tag_stat = dict((int(tag_stat[i, 0]), tag_stat[i, 1])
                    for i in range(tag_stat.shape[0]))

    # User review
    u_reviews = con.query(
        '''
        SELECT content, id, review_date, rating
        FROM review_view NATURAL LEFT OUTER JOIN rate_view
        WHERE isbn = %s
        ORDER BY review_date DESC
        ''', [str(isbn)])

    return render_template('book.html',
                           content=content,
                           tag_state=tag_state,
                           tag_stat=tag_stat,
                           rating=rating,
                           review=review,
                           u_reviews=u_reviews)


# POST only/ non-view makes that navigating to the page raise an error,
# since web browser default to GET requests
@book.route('/<int:isbn>/add2cart', methods=('POST', ))
@login_required
@role_required('miner')
def add2cart(isbn):
    '''Non-view page, for adding to cart'''

    num = request.form['num']

    con = Connect(session['role'], session['db_pw'])
    con.modify(
        '''
        INSERT INTO cart VALUES (%s, %s, %s)
        ON CONFLICT (isbn, id)
        DO UPDATE SET cart_num = cart.cart_num + EXCLUDED.cart_num
        ''', [str(isbn), current_user.id, num])

    flash('The book is added to your cart!', 'success')

    return redirect('/%d' % isbn)


@book.route('/<int:isbn>/tag', methods=('POST', ))
@login_required
@role_required('miner')
def tag(isbn):
    '''Non-view page, for tagging'''

    # Construct the tag state dictionary
    state_dict = {'To Read': 1, 'Reading': 2, 'Read': 3}

    tag_state = state_dict[request.form['tag']]

    con = Connect(session['role'], session['db_pw'])
    # Call the SQL procedure change_tag to tag
    msg = con.query('SELECT change_tag(%s,%s,%s)',
                    [str(isbn), current_user.id, tag_state], 1)[0]

    if msg:
        flash(msg, 'danger')

    return redirect('/%d' % isbn)


@book.route('/<int:isbn>/rate', methods=('POST', ))
@login_required
@role_required('miner')
def rate(isbn):
    '''Non-view page, for rating'''

    rating = request.form['rating']

    con = Connect(session['role'], session['db_pw'])
    # Call the SQL procedure change_rating to rate
    msg = con.query('SELECT change_rating(%s,%s, %s)',
                    [str(isbn), current_user.id, rating], 1)[0]

    if msg:
        flash(msg, 'danger')

    return redirect('/%d' % isbn)


@book.route('/<int:isbn>/review', methods=('POST', ))
@login_required
@role_required('miner')
def review(isbn):
    '''Non-view page, for reviewing'''

    content = request.form['review']

    con = Connect(session['role'], session['db_pw'])
    # Call the SQL procedure change_review to review
    msg = con.query('SELECT change_review(%s,%s,%s)',
                    [str(isbn), current_user.id, content], 1)[0]

    if msg:
        flash(msg, 'danger')

    return redirect('/%d' % isbn)


@book.route('/requestbook', methods=('GET', 'POST'))
@login_required
@role_required('miner')
def requestbook():
    '''For Miners to request missing books'''

    if request.method == 'POST':
        isbn = request.form['isbn'] or None
        title = request.form['title'] or None
        author = request.form['author'] or None
        publisher = request.form['publisher'] or None
        publish_year = request.form['publish_year'] or None
        publish_month = request.form['publish_month'] or None
        price = request.form['price'] or None

        con = Connect(session['role'], session['db_pw'])
        # Call SQL function insert_request to request
        msg = con.query('SELECT insert_request(%s,%s,%s,%s,%s,%s,%s,%s)', [
            current_user.id, isbn, title, author, publisher, publish_year,
            publish_month, price
        ], 1)[0]

        if msg:
            # Return the error message
            flash(msg, 'danger')
        else:
            # Otherwise return the success message
            flash(
                'Your request is submitted! Please wait for the request result :)',
                'success')

            return redirect(url_for('miner.mylibrary'))

    return render_template('requestbook.html')


@book.route('/newbook/', methods=('GET', 'POST'))
@book.route('/newbook/<int:isbn>', methods=('GET', 'POST'))
@login_required
@role_required('curator')
def newbook(isbn=None):
    '''For the curator to add books to the library'''

    # If adding a requested book, get its info first
    if isbn:
        con = Connect(session['role'], session['db_pw'])
        content = con.query('SELECT * FROM requested_books WHERE isbn = %s',
                            [str(isbn)], 1)
    else:
        content = {}

    if request.method == 'POST':
        isbn = request.form['isbn']
        title = request.form['title'] or None
        author = request.form['author'] or None
        publisher = request.form['publisher'] or None
        publish_year = request.form['publish_year'] or None
        publish_month = request.form['publish_month'] or None
        price = request.form['price'] or None

        con = Connect(session['role'], session['db_pw'], transaction=True)
        # Call SQL function check_book to check the validation of the book info
        msg = con.query('SELECT check_book(%s,%s,%s,%s)',
                        [isbn, title, publish_year, publish_month], 1)[0]

        if msg:
            flash(msg, category="danger")
            con.cc()
        else:
            con.modify(
                '''
                INSERT INTO books VALUES (%s, %s, %s, %s, %s, %s, %s);
                ''', (isbn, title, author, publisher, publish_year,
                      publish_month, price))

            con.cc()

            return redirect('/%s' % isbn)

    return render_template('newbook.html', content=content)


@book.route('/<int:isbn>/edit', methods=('GET', 'POST'))
@login_required
@role_required('curator')
def editbook(isbn):
    '''For the curator to edit the info of one book'''

    # Get the current book info
    content = get_book(isbn)

    if request.method == 'POST':
        isbn = request.form['isbn']
        title = request.form['title'] or None
        author = request.form['author'] or None
        publisher = request.form['publisher'] or None
        publish_year = request.form['publish_year'] or None
        publish_month = request.form['publish_month'] or None
        price = request.form['price'] or None

        con = Connect(session['role'], session['db_pw'], transaction=True)
        # Call SQL function check_book to check the validation of the book info
        msg = con.query('SELECT check_book(%s,%s,%s,%s, TRUE)',
                        [isbn, title, publish_year, publish_month], 1)[0]

        if msg:
            flash(msg, category="danger")
            con.cc()
        else:
            con.modify(
                '''
                UPDATE books
                SET isbn=%s, title=%s, author=%s, publisher=%s, publish_year=%s, publish_month=%s, price=%s 
                WHERE isbn = %s;
                ''', (isbn, title, author, publisher, publish_year,
                      publish_month, price, content['isbn']))
            con.cc()
            return redirect('/%s' % isbn)

    return render_template('editbook.html', content=content)


@book.route('/<int:isbn>/delete', methods=('POST', ))
@login_required
@role_required('curator')
def deletebook(isbn):
    '''Fot the curator to delete one book'''

    title = get_book(isbn)['title']

    con = Connect(session['role'], session['db_pw'])
    con.modify('DELETE FROM books WHERE isbn=%s', [str(isbn)])

    flash('Book 《%s》 was deleted!' % title, category="warning")

    return redirect('/')


@book.route('/test')
def test():
    return render_template('test.html')