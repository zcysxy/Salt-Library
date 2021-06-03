import psycopg2
import psycopg2.extras
from psycopg2.extensions import AsIs

class Connect():
    '''
    Connect to the PostgreSQL database server with different users,
    and execute commands
    '''

    def __init__(self,ID='tourist',password='1234',transaction=False):
        self.host = 'localhost'
        self.database = 'saltlibrary'
        self.ID = ID
        self.password = password
        self.trans = transaction
        self.state = 0 # 0 for closed, 1 for connected, -1 for error

        # Connect to the server
        self.conn = None
        self.cur = None
        try:
            # connect to the PSQL server
            # print('Connecting to the PostgreSQL database...')
            self.conn = psycopg2.connect(
                host = self.host,
                database = self.database,
                user = self.ID,
                password = self.password
            )
            
            # create a dictionar-like cursor
            self.cur = self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            self.state = 1 # for "connected"
            
            # # execute a statement
            # print('PostgreSQL database version:')
            # self.cur.execute('SELECT version()')

            # # display the PostgreSQL database server version
            # db_version = self.cur.fetchone()
            # print(db_version)
            print('Connected!')

        except (Exception, psycopg2.DatabaseError) as error:
            self.state = -1
            print(error)
            self.cc()
    
    def cc(self):
        if self.cur is not None:
            self.cur.close()
        if self.conn is not None:
            if self.state == -1:
                self.conn.rollback()
            else:
                self.conn.commit()
                self.conn.close()
        
        if self.state == -1:
            print('Errors occured!')
        self.state = 0
    
    def create(self,command):
        if self.state != 1:
            raise Exception('Not connected!')

        try:
            self.cur.execute(command)
    
            # Commit & close
            if self.trans == False:
                self.cc()
                print('Table/View created!')
        except (Exception, psycopg2.DatabaseError) as error:
            self.state = -1
            print(error)
            self.cc()
    
    def modify(self,command,value_list=None):
        if self.state != 1:
            raise Exception('Not connected!')

        try:
            self.cur.execute(command, value_list)
            rows_affected = self.cur.rowcount
            
            # Commit & close
            if self.trans == False:
                self.cc()
                print('%d rows modified!' % rows_affected)
        except (Exception, psycopg2.DatabaseError) as error:
            self.state = -1
            print(error)
            self.cc()
    
    def execute_many(self,command,tuple_list):
        if self.state != 1:
            raise Exception('Not connected!')
            
        try:
            self.cur.executemany(command, tuple_list)

            # Commit & close
            if self.trans == False:
                self.cc()
                print('Multiple execution completed!')
        except (Exception, psycopg2.DatabaseError) as error:
            self.state = -1
            print(error)
            self.cc()
    
    def query(self,command,values=None,size=-1):
        if self.state != 1:
            raise Exception('Not connected!')
            
        try:
            self.cur.execute(command,values)

            if size == -1:
                result = self.cur.fetchall() # list
            elif size == 1:
                result = self.cur.fetchone() # dict
            else:
                result = self.cur.fetchmany(size=size) # list
            
            # Commit & close
            if self.trans == False:
                self.cc()
                print('Data fetched!')

            return result
        except (Exception, psycopg2.DatabaseError) as error:
            self.state = -1
            print(error)
            self.cc()
    
    def create_user(self, command, values):
        "The first placeholder must be user_name"
        if self.state != 1:
            raise Exception('Not connected!')
        
        try:
            self.cur.execute(command, [AsIs(values[0])] + list(values[1:]))

            # Commit & close
            if self.trans == False:
                self.cc()
                print('User created!')

        except (Exception, psycopg2.DatabaseError) as error:
            self.state = -1
            print(error)
            self.cc()

    def execute(self,command,value_list=None):
        if self.state != 1:
            raise Exception('Not connected!')

        try:
            self.cur.execute(command, value_list)
            
            # Commit & close
            if self.trans == False:
                self.cc()
                print('Command executed!')
        except (Exception, psycopg2.DatabaseError) as error:
            self.state = -1
            print(error)
            self.cc()
    