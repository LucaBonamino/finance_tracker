from fin_pool.database.db_engine import get_new_session
from fin_pool.database.models import Transaction as DBTransaction


def get_data():
    t = []
    with get_new_session() as session:
        transactions = session.query(DBTransaction).all()
        for transaction in transactions:
            t_type = transaction.transaction_type
            category = t_type.category if t_type.category is not None else None
            t.append(
                [transaction.date,
                 transaction.quantity,
                 t_type.id,
                 t_type.type,
                 category.id if category is not None else None,
                 category.category if category is not None else None,
                 transaction.account_id,
                 transaction.account.account_owner if transaction.account is not None else None
                 ]
            )
    return t