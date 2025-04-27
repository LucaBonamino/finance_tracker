import csv

types_mappings = {
    "rent": 1,
    "parking": 2,
    "food": 3,
    "PayPall": 4,
    "unknown - BELAIR DISTRIB 02.03": 5,
    "SAINTE IRINE": 6,
    "Medical": 7,
    "Occasional food": 8,
    "glosseries": 9,
    "tenue-compte": 10,
    "Caisse-Medico": 11,
    "electricity": 12
}

category_mappings = {
    "fixed-expenses": 1,
    "variables-expenses": 2
}

account_mappings = {
    "Common": 1,
    "Luca": 2,
    "Chiara": 3
}

with open("transactions.csv") as f:
    reader = csv.reader(f)
    headers = next(reader)
    t = "insert into transactions\n (date, quantity, transaction_type_id, account_id)\n"
    t += "VALUES\n"
    n_rows = []
    for row in reader:
        n_row = [
            f"'{row[0]}'",
             row[1],
             types_mappings[row[2]],
            account_mappings["Common"]
             # category_mappings[row[3]] if row[3] != '' else None
             ]
        t += f"({','.join([str(item) for item in n_row])}),\n"
        n_rows.append(
            n_row
        )


with open("ins_transactions.sql", "w") as f:
    f.write(t)