from fin_pool.database.db_engine import get_new_session
from fin_pool.database.models import Transaction as DBTransaction
from fin_pool.entities import Transaction, Transactions


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