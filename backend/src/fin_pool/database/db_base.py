import os

from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, declarative_base


host = os.getenv("POSTGRES_HOST", "localhost")

url = f"postgresql://{os.getenv('POSTGRES_USER', 'username')}:{os.getenv('POSTGRES_PASSWORD', 'password')}@{host}:5432/{os.getenv('POSTGRES_DB', 'finPool')}"
engine = create_engine(url)

session_maker = sessionmaker(autoflush=False, autocommit=False, bind=engine)

metadata_obj = MetaData()

MyBase = declarative_base()