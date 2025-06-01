import csv
import datetime
from pathlib import Path

import pydantic
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from sqlalchemy import and_
from fastapi.middleware.cors import CORSMiddleware

from fin_pool.database.db_engine import get_new_session
from fin_pool.database.models import User, Transaction as DBTransaction, TransactionCategory as DBTransactionCategory, \
    TransactionType as DBTransactionType, Account, TransactionCategory, TransactionType
from fin_pool.entities import Transactions, Transaction, Token, LogInRequest, TransactionCategories, TransactionTypes, \
    AccountOwners
from fin_pool.service import AppService

app = FastAPI()

origins = [
    "http://localhost:1234",
    "http://127.0.0.1:1234"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# TODO: HTTP Error handling via a custom error handling function

# TODO: Correct error handling inside of each Fast API paths

# TODO: Re-order code inside Fast API paths into services and utils

# TODO: Attach session to DBEngine

@app.get("/transactions", status_code=200, response_model=Transactions)
def get_transactions() -> Transactions:
    return AppService.get_transactions()


@app.get("/transactions/{transaction_id}", status_code=200, response_model=Transaction)
def get_transactions(transaction_id: int) -> Transaction[int]:
    return AppService.get_transaction(transaction_id)


@app.post("/transactions", status_code=201)
def add_transaction(request_model: Transaction = Body(...)):
    session = get_new_session()
    try:
        if request_model.account_owner is not None:
            account = session.query(Account).filter(Account.account_owner == request_model.account_owner).one_or_none()
            if account is None:
                account = Account(account_owner=request_model.account_owner)
                session.add(account)
                session.flush()
                account_id = account.id
            else:
                account_id = account.id
        else:
            account_id = None

        # Transaction category
        if request_model.category is not None:
            category = session.query(DBTransactionCategory).filter(
                DBTransactionCategory.category == request_model.category).one_or_none()
            if category is None:
                category = DBTransactionCategory(category=request_model.category)
                session.add(category)
                session.flush()
                category_id = category.id
            else:
                category_id = category.id
        else:
            category_id = None

        # Transaction type
        if request_model.type is not None:
            transaction_type = session.query(DBTransactionType).filter(
                DBTransactionType.type == request_model.type).one_or_none()
            if transaction_type is None:
                transaction_type = DBTransactionType(type=request_model.type, category_id=category_id)
                session.add(transaction_type)
                session.flush()
                type_id = transaction_type.id
            else:
                type_id = transaction_type.id
        else:
            type_id = None

        transaction = DBTransaction(
            date=request_model.date,
            quantity=request_model.quantity,
            transaction_type_id=type_id,
            account_id=account_id
        )
        session.add(transaction)
        session.commit()

    except Exception as exc:
        session.rollback()
        raise HTTPException(status_code=500, detail=exc)
    finally:
        session.close()


@app.delete("/transactions/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int):
    session = get_new_session()
    try:
        transaction = session.query(DBTransaction).filter(DBTransaction.id == transaction_id).one_or_none()
        if transaction is None:
            raise HTTPException(status_code=404)
        session.add(transaction)
        session.delete(transaction)
        session.commit()
    except Exception as exc:
        session.rollback()
        raise exc
    finally:
        session.close()


@app.put("/transactions/{transaction_id}", status_code=204)
def update_transaction(transaction_id: int, request_model: Transaction = Body(...)):
    session = get_new_session()
    try:
        transaction = session.query(DBTransaction).filter(DBTransaction.id == transaction_id).one_or_none()
        if transaction is None:
            raise HTTPException(status_code=404)

        if request_model.account_owner is not None:
            account = session.query(Account).filter(Account.account_owner == request_model.account_owner).one_or_none()
            if account is None:
                account = Account(account_owner=request_model.account_owner)
                session.add(account)
                session.flush()
                account_id = account.id
            else:
                account_id = account.id
        else:
            account_id = None

        # Transaction category
        if request_model.category is not None:
            category = session.query(DBTransactionCategory).filter(
                DBTransactionCategory.category == request_model.category).one_or_none()
            if category is None:
                category = DBTransactionCategory(category=request_model.category)
                session.add(category)
                session.flush()
                category_id = category.id
            else:
                category_id = category.id
        else:
            category_id = None

        # Transaction type
        if request_model.type is not None:
            transaction_type = session.query(DBTransactionType).filter(
                DBTransactionType.type == request_model.type).one_or_none()
            if transaction_type is None:
                transaction_type = DBTransactionType(type=request_model.type, category_id=category_id)
                session.add(transaction_type)
                session.flush()
                type_id = transaction_type.id
            else:
                type_id = transaction_type.id
        else:
            type_id = None

        transaction.date = request_model.date
        transaction.quantity = request_model.quantity
        transaction.transaction_type_id = type_id
        transaction.category_id = category_id
        transaction.account_id = account_id
        session.add(transaction)
        session.commit()

    except Exception as exc:
        session.rollback()
        raise HTTPException(status_code=500, detail=exc)
    finally:
        session.close()


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

            # Optionally, write a header row
            writer.writerow(['Date', 'Amount', "Expenses_id", 'Expense Type', "category_id", 'Category'])

            for row in t:
                # Convert the first element (a date) to a string in ISO format
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


# TODO: Generalize file upload Excel files
@app.post("/upload", status_code=201)
async def upload_file(file: UploadFile = File(...)):
    file_name = Path(file.filename)
    print(file_name)
    contents = await file.read()
    await file.close()
    try:
        transactions = AppService.get_file_content(content=contents, filename=file_name)
    except pydantic.ValidationError as e:
        raise HTTPException(400, detail=e.errors())
    
    AppService.insert_transactions(transactions)
