import connect as con
import psycopg2

def insert_books(tuple_list):
    '''
    insert new new books into the *books* table
    '''

    # Construct the insert command
    insert_command = '''INSERT INTO books VALUES (%s, %s, %s, %s, %s, %s, %s)'''
    
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
        ('9787521729696', '天使之门', '佩内洛普·菲茨杰拉德', '中信出版集团', 2021, 4, 55.00),
        ('9787108070678', '戊戌时期康有为、梁启超的思想', '茅海建', '生活·读书·新知三联书店', 2021, 5, 98.00),
        ('9787571001933', '达摩流浪者', '杰克·凯鲁亚克', '湖南科学技术出版社', 2021, 5, 52.00),
        ('9787540790356', '海东五百年', '丁晨楠', '漓江出版社', 2021, 5, 58.00),
        ('9787535694232', '萨朗波', '菲利普·德吕耶', '后浪丨湖南美术出版社', 2021, 6, 148.00),
        ('9787509015919', '印度次大陆', '托马斯·特劳特曼', '当代世界出版社', 2021 ,4, 68.00),
        ('9787559651518', '成长的边界', '大卫·爱泼斯坦', '后浪丨北京联合出版公司', 2021, 4, 60.00)
    ])