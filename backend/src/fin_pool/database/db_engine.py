from .db_base import engine, MyBase, session_maker

def create_tables():
    MyBase.metadata.create_all(engine)

def drop_tables():
    MyBase.metadata.drop_all(engine)

def get_new_session():
    return DBEngine().get_session()

class DBEngine:

    def __init__(self):
        self.__engine = engine
        self.__session = session_maker()

    def get_session(self):
        return self.__session

    def get_engine(self):
        return self.__engine

create_tables()
