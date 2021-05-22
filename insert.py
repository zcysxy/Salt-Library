import connect as con
import psycopg2

def insert_books(tuple_list):
    '''
    insert new new books into the *books* table
    '''

    # Construct the insert command
    insert_command = """INSERT INTO books(IBSN, name, number) VALUES (%s, %s, %s)"""
    
    # Connect to the database
    conn, cur = con.connect()
    
    # Insert the values
    try:
        cur.executemany(insert_command, tuple_list)

        # Commit & close
        conn.commit()
        cur.close()
        conn.close()
        print('Insertion Complete!')
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        if conn is not None:
            conn.close()

if __name__ == '__main__':
    insert_books([
        ('18300180103', 'My Story', 0)
        ('18300180102', 'My trashy Life', 10000)
    ])