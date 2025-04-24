import { CollectionModel } from "./CollectionModel";
import { Transaction, TransactionProp, TransactionType } from "./Transaction";

export class Transactions extends CollectionModel<
  Transaction,
  TransactionProp
> {
  bindModel(data: Transaction[]): void {
    this.models = data;
  }

  static calculateCumulatedAmount(
    transactions: { transaction: Transaction; index: number }[]
  ): number {
    console.log("transactions");
    console.log(transactions);
    const total = transactions.reduce(
      (sum, transactionObj) =>
        sum + Number(transactionObj.transaction.get("quantity")),
      0
    );
    console.log(total);
    return Math.round((total + Number.EPSILON) * 100) / 100;
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

  static aggregateTransactionsByType(collection: Transaction[]) {
    const aggregatedData: {
      [transactionType: string]: {
        transaction: Transaction;
        index: number;
      }[];
    } = {};
    collection.forEach((model, index) => {
      //const transactionType = model.get("type");
      const transactionType: string = model.get("category") ?? "Unknown";
      if (!aggregatedData[transactionType]) {
        aggregatedData[transactionType] = [];
      }
      // const transactions = { transactions: model, index: index };
      aggregatedData[transactionType].push({
        transaction: model,
        index: index,
      });
    });
    return aggregatedData;
  }

  static formatDate(monthYearString: string) {
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
