

from sqlalchemy import Integer, Column, String, ForeignKey, Date, Numeric
from sqlalchemy.orm import relationship

from fin_pool.database.db_base import MyBase


class Transaction(MyBase):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    quantity = Column(Numeric, nullable=False)
    transaction_type_id = Column(Integer, ForeignKey("transaction_types.id"))
    transaction_type = relationship("TransactionType", back_populates="transactions")
    account_id = Column(Integer, ForeignKey("accounts.id"))
    account = relationship("Account", back_populates="transactions")

class User(MyBase):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)


class TransactionType(MyBase):
    __tablename__ = "transaction_types"

    id = Column(Integer, primary_key=True)
    type = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("transaction_categories.id"))
    category = relationship("TransactionCategory", back_populates="transaction_types")
    transactions = relationship("Transaction", back_populates="transaction_type")


class TransactionCategory(MyBase):
    __tablename__ = "transaction_categories"

    id = Column(Integer, primary_key=True)
    category = Column(String)
    transaction_types = relationship("TransactionType", back_populates="category")


class Account(MyBase):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True)
    account_owner = Column(String)
    transactions = relationship("Transaction", back_populates="account")