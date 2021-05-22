import connect as con
import psycopg2

def create_tables():
    '''
    Create tables in SaltLibrary database
    '''

    # Construct SQL creating tables commands
    commands = [
        '''
        CREATE TABLE test (
            test_id CHAR(11) PRIMARY KEY,
            test_value INT
        );
        ''',
        '''
        CREATE TABLE books (
            IBSN CHAR(11) PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            number INT CHECK(number >= 0)
        );
        '''
    ]

    # Connect to the database
    conn, cur = con.connect()

    # Create tables
    try:
        for command in commands:
            cur.execute(command)
    
        # Commit & close
        cur.close()
        conn.commit()
        conn.close()
        print('Committed and closed!')
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        if conn is not None:
            conn.close()

if __name__ == '__main__':
    create_tables()