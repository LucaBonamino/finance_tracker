import { rootUrl } from "../Config";
import { Attributes } from "./Attributes";
import { Model } from "./Model";
import { Sync } from "./Sync";
import { Events } from "./Events";

export interface AccountOwnerProp {
  id?: number;
  account_owner: string;
}

export class AccountOwner extends Model<AccountOwnerProp> {
  static buildTransactionType(attrs: AccountOwnerProp): AccountOwner {
    return new AccountOwner(
      new Attributes<AccountOwnerProp>(attrs),
      new Events(),
      new Sync<AccountOwnerProp>(`${rootUrl}/account_owners`)
    );
  }
}
