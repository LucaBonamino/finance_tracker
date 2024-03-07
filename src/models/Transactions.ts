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
}
