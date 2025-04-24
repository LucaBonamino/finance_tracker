import csv
import datetime
from decimal import Decimal
from pathlib import Path
from typing import List, Optional, TypeVar, Generic

import orjson
import pydantic
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import RootModel, BaseModel
from sqlalchemy import and_
from fastapi.middleware.cors import CORSMiddleware

from fin_pool.database.db_engine import get_new_session
from fin_pool.database.models import User, Transaction as DBTransaction, TransactionCategory as DBTransactionCategory, \
    TransactionType as DBTransactionType, Account


class TransactionType(pydantic.BaseModel):
    id: int
    type: str


class TransactionTypes(RootModel[List[TransactionType]]):
    pass


class TransactionCategory(pydantic.BaseModel):
    id: int
    category: str


class TransactionCategories(RootModel[List[TransactionCategory]]):
    pass


class AccountOwner(pydantic.BaseModel):
    id: int
    account_owner: str


class AccountOwners(RootModel[List[AccountOwner]]):
    pass


T = TypeVar("T", int, None)


class Transaction(BaseModel, Generic[T]):
    id: T = None
    quantity: Decimal
    date: datetime.date
    type: Optional[str] = None
    account_owner: str
    category: Optional[str] = None


class Transactions(RootModel[List[Transaction[T]]], Generic[T]):
    pass


class LogInRequest(pydantic.BaseModel):
    email: str
    password: str


class Token(pydantic.BaseModel):
    token: str
    expiring: str


app = FastAPI()

origins = [
    "http://localhost:1234",
    "http://127.0.0.1:1234",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/transactions", status_code=200, response_model=Transactions)
def get_transactions() -> Transactions:
    with get_new_session() as session:
        transactions = session.query(DBTransaction).all()
        t_out = [
            Transaction[int](
                id=item.id,
                quantity=item.quantity,
                date=item.date,
                account_owner=item.account.account_owner,
                type=item.transaction_type.type if item.transaction_type is not None else None,
                category=item.transaction_type.category.category if item.transaction_type is not None and item.transaction_type.category is not None else None
            )
            for item in transactions
        ]

    return Transactions[int](t_out)


@app.get("/transactions/{transaction_id}", status_code=200, response_model=Transaction)
def get_transactions(transaction_id: int) -> Transaction[int]:
    with get_new_session() as session:
        transaction = session.query(DBTransaction).filter(DBTransaction.id == transaction_id).one_or_none()
        return Transaction[int](
            id=transaction.id,
            quantity=transaction.quantity,
            date=transaction.date,
            account_owner=transaction.account.account_owner,
            type=transaction.transaction_type.type if transaction.transaction_type else None,
            category=transaction.transaction_type.category.category if transaction.transaction_type is not None and transaction.transaction_type.category is not None else None
        )


@app.post("/login", status_code=200, response_model=Token)
def log_in(request_body: LogInRequest) -> Token:
    with get_new_session() as session:
        user = session.query(User).filter(
            and_(User.username == request_body.email, User.password == request_body.password)).one_or_none()
        if user is None:
            raise Exception()
    return Token(token="dummy_token", expiring="dummy_expiring")


@app.post("/signup", status_code=200, response_model=Token)
def sign_up(request_body: LogInRequest) -> Token:
    with get_new_session() as session:
        user = User(username=request_body.email, password=request_body.password)
        session.add(user)
        session.commit()
    return Token(token="dummy_token", expiring="dummy_expiring")


@app.post("/transactions_file")
def export_in_csv():
    with get_new_session() as session:
        transactions = session.query(DBTransaction).all()
        t = []
        for transaction in transactions:
            t_type = transaction.transaction_type
            category = t_type.category if t_type.category is not None else None
            t.append(
                [transaction.date,
                 transaction.quantity,
                 t_type.id,
                 t_type.type,
                 category.id if category is not None else None,
                 category.category if category is not None else None]
            )
        with open('transactions.csv', 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)

            writer.writerow(['Date', 'Amount', "Expenses_id", 'Expense Type', "category_id", 'Category'])

            for row in t:

                if isinstance(row[0], datetime.date):
                    row[0] = row[0].isoformat()
                writer.writerow(row)


@app.get("/transaction_categories", status_code=200, response_model=TransactionCategories)
def get_transaction_categories():
    with get_new_session() as session:
        categories = session.query(DBTransactionCategory).all()
        return TransactionCategories.model_validate([
            {"id": item.id, "category": item.category} for item in categories
        ])


@app.get("/transaction_types", status_code=200, response_model=TransactionTypes)
def get_transaction_types():
    with get_new_session() as session:
        transaction_types = session.query(DBTransactionType).all()
        return TransactionTypes.model_validate(
            [{'id': item.id, 'type': item.type} for item in transaction_types])


@app.get("/account_owners", status_code=200, response_model=AccountOwners)
def get_account_owners():
    with get_new_session() as session:
        account_owners = session.query(Account).all()
        return AccountOwners.model_validate([
            {"id": item.id, "account_owner": item.account_owner} for item in account_owners
        ])


@app.post("/upload", status_code=201)
async def upload_file(file: UploadFile = File(...)):
    file_name = Path(file.filename)
    ext = file_name.suffix.split('.')[1]

    contents = await file.read()
    await file.close()
    if ext == 'json':
        raw = orjson.loads(contents)
        try:
            transactions = Transactions[Optional[int]].model_validate(raw)
            session = get_new_session()
            try:
                for item in transactions.root:
                    cat_id = None
                    t_id = None
                    if item.category is not None:
                        cat = session.query(TransactionCategory).filter(
                            TransactionCategory.category == item.category).one_or_none()
                        if cat is None:
                            cat = TransactionCategory(category=item.category)
                            session.add(cat)
                            session.flush()
                        cat_id = cat.id
                    if item.type is not None:
                        t = session.query(TransactionType).filter(TransactionType.type == item.type).one_or_none
                        if t is None:
                            t = TransactionTypes(type=item.type, category_id=cat_id)
                            session.add(t)
                            session.flush()
                        t_id = t.id
                    account = session.query(Account).filter(Account.account_owner == item.account_owner).one_or_none()
                    if account is None:
                        account = Account(account_owner=item.account_owner)
                        session.add(account)
                        session.flush()
                    account_id = account.id
                    transaction = DBTransaction(
                        quantity=item.quantity,
                        date=item.date,
                        account_id=account_id,
                        transaction_type_id=t_id
                    )
                    session.add(transaction)
                    session.flush()
                session.commit()
            except Exception as exc:
                session.rollback()
                print(exc)
            finally:
                session.close()

        except pydantic.ValidationError as e:
            raise HTTPException(400, detail=e.errors())
