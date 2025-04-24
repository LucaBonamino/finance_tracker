import json
import enum
import random

class TransactioType(enum.Enum):
    FIXED_EXPENSES = 'fixed_expenses'
    LOISIRS = "loisirs"
    CAR = 'car'
    SPESA = 'spesa'

with open("db.json", 'r') as f:
    data = json.load(f)

transactions = data.get('transactions')

print(transactions)
for transaction in transactions:
    transaction['type'] = random.choice(list(TransactioType)).value

data['transactions'] = transactions
print(data)

with open("db.json", 'w') as f:
    json.dump(data, f,indent=4)