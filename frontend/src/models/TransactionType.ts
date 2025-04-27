import { rootUrl } from "../Config";
import { Attributes } from "./Attributes";
import { Model } from "./Model";
import { Sync } from "./Sync";
import { Events } from "./Events";

export interface TransactionTypeProp {
  id?: number;
  type: string;
}

export class TransactionType extends Model<TransactionTypeProp> {
  static buildTransactionType(attrs: TransactionTypeProp): TransactionType {
    return new TransactionType(
      new Attributes<TransactionTypeProp>(attrs),
      new Events(),
      new Sync<TransactionTypeProp>(`${rootUrl}/transactions_types`)
    );
  }
}
