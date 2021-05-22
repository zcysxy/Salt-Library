import connect as con
import psycopg2

def update_books(values):
    '''
    Update book number based on the IBSN
    '''

    # Construct the update SQL command
    update_command = """
        UPDATE books
        SET number = %s
        WHERE IBSN = %s
    """

    # Connect to the database
    conn, cur = con.connect()
    updated_rows = 0
    try:
        cur.execute(update_command, values)
        
        # get the number of updated rows
        updated_rows = cur.rowcount
        
        # Commit & close
        conn.commit()
        cur.close()
        conn.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        if conn is not None:
            conn.close()

    return updated_rows


if __name__ == '__main__':
    update_books((10,'18300180101'))