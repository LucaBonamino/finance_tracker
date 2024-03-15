import { CollectionModel } from "./CollectionModel";
import { Events } from "./Events";
import { Sync } from "./Sync";
import { Transaction, TransactionProp } from "./Transaction";
import { Attributes } from "./Attributes";
import { rootUrl } from "../Config";

export class Transactions extends CollectionModel<
  Transaction,
  TransactionProp
> {
  static buildTransactions(size: number): Transaction[] {
    let dataSet: Transaction[] = [];
    for (let i = 0; i < size; i++) {
      dataSet.push(
        new Transaction(
          new Attributes<TransactionProp>(Transaction.generateTransaction(i)),
          new Events(),
          new Sync<TransactionProp>(rootUrl)
        )
      );
    }
    return dataSet;
  }

  bindModel(data: Transaction[]): void {
    this.models = data;
  }

  static calculateCumulatedAmount(
    transactions: { transaction: Transaction; index: number }[]
  ): number {
    return transactions.reduce(
      (sum, transactionObj) => sum + transactionObj.transaction.get("amount"),
      0
    );
  }

  static aggragateTransactionObj(collection: Transaction[]) {
    const aggregatedData: {
      [monthYear: string]: { transaction: Transaction; index: number }[];
    } = {};

    collection.forEach((model, index) => {
      const [year, month] = model.get("date").split("-");
      const monthYear = `${year}-${month}`;

      if (!aggregatedData[monthYear]) {
        aggregatedData[monthYear] = [];
      }

      aggregatedData[monthYear].push({ transaction: model, index: index });
    });

    return aggregatedData;
  }

  static formatDate(monthYearString) {
    const [year, month] = monthYearString.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const formattedMonth = monthNames[parseInt(month) - 1];
    return `${formattedMonth} ${year}`;
  }
}
