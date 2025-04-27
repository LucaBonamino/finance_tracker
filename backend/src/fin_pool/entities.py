import datetime
from decimal import Decimal
from typing import List, TypeVar, Generic, Optional

import pydantic
from pydantic import BaseModel, RootModel


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
    account_owner: Optional[str] = None
    category: Optional[str] = None


class Transactions(RootModel[List[Transaction[T]]], Generic[T]):
    pass


class LogInRequest(pydantic.BaseModel):
    email: str
    password: str


class Token(pydantic.BaseModel):
    token: str
    expiring: str
