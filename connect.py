import psycopg2
import psycopg2.extras

def connect():
    '''
    Connect to the PostgreSQL database server
    {databse: saltlibrary, user: curator}
    Output:
    - conn: connection object
    - cur: cursor object
    ! Remember to .close() these objects when you want to close the connection!
    '''
    
    conn = None
    try:
        # connect to the PSQL server
        print('Connecting to the PostgreSQL database...')
        conn = psycopg2.connect(
            host = 'localhost',
            database = 'saltlibrary',
            user = 'curator',
            password = 'SaltLibrary'
        )
		
        # create a dictionar-like cursor
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # execute a statement
        print('PostgreSQL database version:')
        cur.execute('SELECT version()')

        # display the PostgreSQL database server version
        db_version = cur.fetchone()
        print(db_version)

        return conn, cur

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        if conn is not None:
            conn.close()


if __name__ == '__main__':
    connect()