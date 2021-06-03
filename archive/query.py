import connect as con
import psycopg2

def get_books():
    '''
    Query data from the *books* table
    '''

    # Construct the SQL query
    query = '''
        SELECT *
        FROM books
    '''

    # Connect to the database
    conn, cur = con.connect()
    
    try:
        cur.execute(query)

        # Get the result size
        print("The number of tuples in result: ", cur.rowcount)
        
        # Print the result
        row = cur.fetchone()
        while row is not None:
            print(row['isbn'])
            row = cur.fetchone()

        # '''OR'''
        # rows = cur.fetchall()
        # for row in rows:
        #     print(row)

        # Close
        cur.close()
        conn.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        if conn is not None:
            conn.close()

if __name__ == '__main__':
    get_books()