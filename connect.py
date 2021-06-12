'''
This script is about the connection between the app and PSQL
'''

import psycopg2
import psycopg2.extras
from psycopg2.extensions import AsIs

# We put database password for tourist and Miner here
# since they are not important and
# should be available to the public
roles_config = {
    # role: database password
    'tourist': '1234',
    'miner': 'miner'
}

class Connect():
    '''
    Connect to the PostgreSQL database server with different users,
    execute commands, and return results
    '''
    def __init__(self,
                 ID='tourist',
                 password=roles_config['tourist'],
                 transaction=False):
        self.host = 'localhost'
        self.database = 'saltlibrary'

        # Connect the database as ...
        # Defaut is as tourist
        self.ID = ID
        self.password = password

        # If trans = True, then the connection won't commit and close automatically
        self.trans = transaction
        self.state = 0  # 0 for closed, 1 for connected, -1 for error
        self.err = None # Exception message

        self.conn = None
        self.cur = None

        try:
            # Connect to the PSQL server
            self.conn = psycopg2.connect(host=self.host,
                                         database=self.database,
                                         user=self.ID,
                                         password=self.password)

            # Create a dictionar-like cursor
            self.cur = self.conn.cursor(
                cursor_factory=psycopg2.extras.DictCursor)
            self.state = 1  # for "connected"

            print('Connected!')

        except (Exception, psycopg2.DatabaseError) as error:
            self.state = -1
            print(error)
            self.err = error
            self.cc()

    def cc(self):
        '''Commit & Close'''

        if self.cur is not None:
            self.cur.close()
        if self.conn is not None:
            # If error occured, then rollback
            if self.state == -1:
                self.conn.rollback()
            else:
                self.conn.commit()
                self.conn.close()

        if self.state == -1:
            print('Errors occured!')
        self.state = 0

    def create(self, command):
        '''CREATE commands'''

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
            self.err = error
            self.cc()

    def modify(self, command, value_list=None):
        '''Modification commands'''

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
            self.err = error
            self.cc()

    def execute_many(self, command, tuple_list):
        '''Execute many commands at once'''

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
            self.err = error
            self.cc()

    def query(self, command, values=None, size=-1):
        '''Execute a quert'''

        if self.state != 1:
            raise Exception('Not connected!')

        try:
            self.cur.execute(command, values)

            # Choose the size of the returned result
            if size == -1:
                result = self.cur.fetchall()  # list
            elif size == 1:
                result = self.cur.fetchone()  # dict
            else:
                result = self.cur.fetchmany(size=size)  # list

            # Commit & close
            if self.trans == False:
                self.cc()
                print('Data fetched!')

            return result
        except (Exception, psycopg2.DatabaseError) as error:
            self.state = -1
            print(error)
            self.err = error
            self.cc()

    def create_user(self, command, values):
        '''The first placeholder must be user_name'''

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
            self.err = error
            self.cc()

    def execute(self, command, value_list=None):
        '''Execute a command'''

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
            self.err = error
            self.cc()
