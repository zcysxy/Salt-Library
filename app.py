#!venv/bin/python3
from flask import Flask, render_template, request, url_for, flash, redirect
import connect as con
import psycopg2

app = Flask(__name__)
app.config['SECRET_KEY'] = 'SaltLibrary'

@app.route('/')
@app.route('/home/')
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

        conn, cur = con.connect()
        cur.execute(
            '''
            SELECT *
            FROM books
            WHERE title = %s
            ''',
            (title,)
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()

        return render_template('search_result.html', result=rows)

    return render_template('home.html', books=rows)

@app.route('/about/')
@app.route('/home/about/')
def about():
    flash('WHATTTTT')
    return render_template('about.html')

@app.route('/newbook/', methods=('GET','POST'))
def newbook():
    if request.method == 'POST':
        ISBN = request.form['ISBN']
        title = request.form['title']
        author = request.form['author']
        publisher = request.form['publisher']
        publish_year = request.form['publish_year']
        publish_month = request.form['publish_month']
        price = request.form['price']
    
        if not ISBN:
            flash('ISBN is required!')
        elif not title:
            flash('Title is required!')
        else:
            conn, cur = con.connect()
            cur.execute(
                '''
                INSERT INTO books VALUES (%s, %s, %s, %s, %s, %s, %s);
                ''',
                (ISBN, title, author, publisher, publish_year, publish_month, price)
            )
            # A check function needed here!

            conn.commit()
            cur.close()
            conn.close()
        
            return redirect(url_for('home'))

    return render_template('newbook.html')

if __name__ == '__main__':
    app.run()