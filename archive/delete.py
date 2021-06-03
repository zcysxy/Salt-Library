import connect as con
import psycopg2

def delete_books(max_number):
    """
    Delete books whose number is greater than max_number
    """
    
    # Connect to the database
    conn, cur = con.connect()

    try:
        # execute the DELETE  statement
        cur.execute("DELETE FROM books WHERE number > %s", (max_number,))
        #! Note here to make max_number a **list of values** we should make it a tuple, or [max_number]

        # get the number of deleted rows
        rows_deleted = cur.rowcount
        
        # Commit & close
        conn.commit()
        cur.close()
        conn.close()
        print('Successfully delete %d rows' % rows_deleted)
        return rows_deleted
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        if conn is not None:
            conn.close()


if __name__ == '__main__':
    delete_books(50)