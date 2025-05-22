import csv
from io import StringIO
from typing import Optional

from orjson import orjson

from fin_pool.database.db_engine import get_new_session
from fin_pool.entities import Transaction, Transactions
from fin_pool.database.models import Transaction as DBTransaction, Account, TransactionCategory, TransactionType



# TODO: Attach session to DBEngine

class AppService:

    @staticmethod
    def get_transactions():
        with get_new_session() as session:
            transactions = session.query(DBTransaction).all()
            t_out = [
                Transaction[int](
                    id=item.id,
                    quantity=item.quantity,
                    date=item.date,
                    account_owner=item.account.account_owner if item.account is not None else None,
                    type=item.transaction_type.type if item.transaction_type is not None else None,
                    category=item.transaction_type.category.category if item.transaction_type is not None and item.transaction_type.category is not None else None
                )
                for item in transactions
            ]

        return Transactions[int](t_out)

    @staticmethod
    def get_transaction(transaction_id: int):
        with get_new_session() as session:
            transaction = session.query(DBTransaction).filter(DBTransaction.id == transaction_id).one_or_none()
            return Transaction[int](
                id=transaction.id,
                quantity=transaction.quantity,
                date=transaction.date,
                account_owner=transaction.account.account_owner if transaction.account is not None else None,
                type=transaction.transaction_type.type if transaction.transaction_type else None,
                category=transaction.transaction_type.category.category if transaction.transaction_type is not None and transaction.transaction_type.category is not None else None
            )

    @staticmethod
    def get_content_from_json(content):
        raw = orjson.loads(content)
        return Transactions[Optional[int]].model_validate(raw)

    @staticmethod
    def get_content_from_csv(content):
        decoded = content.decode('utf-8')
        with StringIO(decoded) as csv_file:
            reader = csv.DictReader(csv_file)
            transactions = Transactions[Optional[int]].model_validate(
                [Transaction.model_validate(row) for row in reader])
        return transactions

    @classmethod
    def get_file_content(cls, filename, content) -> Transactions:
        ext = filename.suffix.split('.')[1]
        if ext == 'json':
            return cls.get_content_from_json(content)
        elif ext == 'csv':
            return cls.get_content_from_csv(content)
        raise Exception('Not Implemented yet')

    @staticmethod
    def insert_transaction(session, /, transaction_model):
        cat_id = None
        t_id = None
        if transaction_model.category is not None:
            cat = session.query(TransactionCategory).filter(
                TransactionCategory.category == transaction_model.category).one_or_none()
            if cat is None:
                cat = TransactionCategory(category=transaction_model.category)
                session.add(cat)
                session.flush()
            cat_id = cat.id
        if transaction_model.type is not None:
            t = session.query(TransactionType).filter(TransactionType.type == transaction_model.type).one_or_none()
            if t is None:
                t = TransactionType(type=transaction_model.type, category_id=cat_id)
                session.add(t)
                session.flush()
            t_id = t.id
        account = session.query(Account).filter(Account.account_owner == transaction_model.account_owner).one_or_none()
        if account is None:
            account = Account(account_owner=transaction_model.account_owner)
            session.add(account)
            session.flush()
        account_id = account.id
        transaction_object = DBTransaction(
            quantity=transaction_model.quantity,
            date=transaction_model.date,
            account_id=account_id,
            transaction_type_id=t_id
        )
        session.add(transaction_object)
        session.flush()

    @classmethod
    def insert_transactions(cls, transactions: Transactions) -> None:
        session = get_new_session()
        try:
            for item in transactions.root:
                cls.insert_transaction(session, item)
            session.commit()

        except Exception as exc:
            session.rollback()
            print(exc)
        finally:
            session.close()
