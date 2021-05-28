import re
from flask import Flask, render_template, request, url_for, flash, redirect, Blueprint
from flask.blueprints import Blueprint
from werkzeug.exceptions import abort
import connect as con
import psycopg2

book = Blueprint('book', __name__)

@book.route('/', methods=('GET', 'POST'))
@book.route('/home/', methods=('GET', 'POST'))
def home():
    conn, cur = con.connect()
    cur.execute('''
        SELECT *
        FROM books
    ''')
    rows = cur.fetchall()
    cur.close()
    conn.close()
    print('Successfully fetched!')

    if request.method == 'POST':
        title = request.form['title']
        return redirect('/search_result?title=%s' % title)
    
    return render_template('home.html', books=rows)

@book.route('/search_result', methods=('GET','POST'))
def search_result():
    conn, cur = con.connect()
    like_title = '%' + '%'.join(request.args.get('title')) + '%'
    cur.execute(
        """
        SELECT *
        FROM books
        WHERE title LIKE %s
        """,
        (like_title,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if request.method == 'POST':
        title = request.form['title']
        return redirect('/search_result?title=%s' % title)

    return render_template('search_result.html', result=rows)


@book.route('/about/')
@book.route('/home/about/')
def about():
    return render_template('about.html')

def get_book(isbn):
    conn, cur = con.connect()
    cur.execute('SELECT * FROM books where isbn = %s', [str(isbn)])
    content = cur.fetchone()
    cur.close()
    conn.close()

    if content is None:
        abort(404)
    
    return content

@book.route('/<int:isbn>')
def book_info(isbn):
    content = get_book(isbn)
    return render_template('book.html', content=content)

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
            conn, cur = con.connect()
            cur.execute(
                '''
                INSERT INTO books VALUES (%s, %s, %s, %s, %s, %s, %s);
                ''',
                (isbn, title, author, publisher, publish_year, publish_month, price)
            )
            # A check function needed here!

            conn.commit()
            cur.close()
            conn.close()
        
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
            conn, cur = con.connect()
            cur.execute(
                '''
                UPDATE books
                SET isbn=%s, title=%s, author=%s, publisher=%s, publish_year=%s, publish_month=%s, price=%s 
                WHERE isbn = %s;
                ''',
                (isbn, title, author, publisher, publish_year, publish_month, price, content['isbn'])
            )
            # A check function needed here!

            conn.commit()
            cur.close()
            conn.close()
            print('UPDATE SUCCESS')
        
            return redirect('/%s' % isbn)
    
    return render_template('editbook.html', content=content)

# POST only makes that navigating to the page raise an error,
# since web browser default to GET requests
@book.route('/<int:isbn>/delete', methods=('POST',))
def deletebook(isbn):
    title = get_book(isbn)['title']

    conn, cur = con.connect()
    cur.execute('DELETE FROM books WHERE isbn=%s', [str(isbn)])
    conn.commit()
    cur.close()
    conn.close()
    print('DELETE SUCCESS')
    
    flash('Book 《%s》 was deleted!' % title, category="warning")

    return redirect('/')
