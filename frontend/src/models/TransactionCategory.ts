import { rootUrl } from "../Config";
import { Attributes } from "./Attributes";
import { Model } from "./Model";
import { Sync } from "./Sync";
import { Events } from "./Events";

export interface TransactionCategoryProp {
  id?: number;
  category: string;
}

export class TransactionCategory extends Model<TransactionCategoryProp> {
  static buildTransactionType(
    attrs: TransactionCategoryProp
  ): TransactionCategory {
    return new TransactionCategory(
      new Attributes<TransactionCategoryProp>(attrs),
      new Events(),
      new Sync<TransactionCategoryProp>(`${rootUrl}/transactions_types`)
    );
  }
}
