import { error } from "jquery";
import { rootUrl } from "../Config";
import { Transaction, TransactionProp } from "../models/Transaction";
import { SimpleView } from "./SimpleView";
import { Attributes } from "../models/Attributes";
import { Sync } from "../models/Sync";
import { Events } from "../models/Events";
import { TransactionTypeProp } from "../models/TransactionType";
import { TransactionCategoryProp } from "../models/TransactionCategory";
import { AccountOwnerProp } from "../models/AccountOwner";
import axios from "axios";

type FormData = {
  date?: string;
  quantity?: string;
  comment?: string;
  account_owner?: string;
  data?: string;
  category?: string;
  type?: string;
};

type ValidTransactionData = Omit<TransactionProp, "id">;

export class AddTransaction extends SimpleView {
  private transactionTypes: TransactionTypeProp[] = [];
  private transactionCategories: TransactionCategoryProp[] = [];
  private accountOwners: AccountOwnerProp[] = [];
  private showOther: boolean;
  private showOtherAccountOwner: boolean;
  private currentSelection: string;
  private currentSelectedAccount: string;

  constructor(parent: Element) {
    super(parent);
    this.loadTypes();
    this.loadCategory();
    this.loadAccountOwners();
  }

  static getTransactionCategories(): Promise<TransactionCategoryProp[]> {
    return axios
      .get<TransactionCategoryProp[]>(`${rootUrl}/transaction_categories`)
      .then((resp) => resp.data)
      .catch((err) => {
        console.error("Error fetching types", err);
        return [];
      });
  }

  static getTransactionTypes(): Promise<TransactionTypeProp[]> {
    return axios
      .get<TransactionTypeProp[]>(`${rootUrl}/transaction_types`)
      .then((resp) => resp.data)
      .catch((err) => {
        console.error("Error fetching types", err);
        return [];
      });
  }

  static getAccountOwners(): Promise<AccountOwnerProp[]> {
    return axios
      .get<AccountOwnerProp[]>(`${rootUrl}/account_owners`)
      .then((resp) => resp.data)
      .catch((err) => {
        console.error("Error fetching types", err);
        return [];
      });
  }

  private loadTypes(): void {
    AddTransaction.getTransactionTypes()
      .then((types) => {
        this.transactionTypes = types;
        this.render();
      })
      .catch((err) => {
        console.error("Failed to load transaction types", err);
      });
  }

  private loadCategory(): void {
    AddTransaction.getTransactionCategories()
      .then((category) => {
        this.transactionCategories = category;
        this.render();
      })
      .catch((err) => {
        console.error("Failed to load transaction types", err);
      });
  }

  private loadAccountOwners(): void {
    AddTransaction.getAccountOwners()
      .then((accountOwner) => {
        this.accountOwners = accountOwner;
        this.render();
      })
      .catch((err) => {
        console.error("Failed to load transaction types", err);
      });
  }

  eventMap(): { [key: string]: (...args: any[]) => void } {
    return {
      "click:#save": this.onSave,
      "change:select[name='type']": this.onTypeChange,
      "change:select[name='accountOwner']": this.onTypeChange,
    };
  }

  private onTypeChange = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    const name = select.getAttribute("name");
    if (name === "type") {
      this.showOther = select.value === "other";
      if (this.showOther == true) {
        this.render();
      }
    }
    if (name === "accountOwner") {
      this.showOtherAccountOwner = select.value === "other";
      if (this.showOtherAccountOwner == true) {
        this.render();
      }
    }
  };

  validTransactionData(data: FormData): ValidTransactionData {
    if (!!data.date == false || !!data.quantity === false) {
      throw error;
    }
    const floatAmount = parseFloat(data.quantity);
    if (!!floatAmount === false) {
      throw error;
    }
    return {
      date: data.date,
      quantity: floatAmount,
      comment: data.comment!,
      account_owner: data.account_owner!,
      type: data.type!,
      category: data.category!,
    };
  }

  onSave = () => {
    const inputs = this.parent.querySelectorAll("input, select");
    const formData: FormData = {};

    inputs.forEach((input) => {
      const name = input.getAttribute("name");
      const value =
        input instanceof HTMLInputElement
          ? input.value
          : (input as HTMLSelectElement).value;

      if (name) {
        formData[name] = value;
      }
    });

    const events = new Events();
    const synchronization = new Sync<TransactionProp>(
      `${rootUrl}/transactions`
    );

    try {
      console.log(formData);
      const validData = this.validTransactionData(formData);
      console.log(validData);
      const attributes = new Attributes<TransactionProp>(validData);
      const transaction = new Transaction(attributes, events, synchronization);

      transaction.save(); // Wait for the save operation to complete
      setTimeout(() => {
        window.location.href = `http://${window.location.host}`;
      }, 500);
    } catch (error) {
      console.error("Error saving transaction:", error);
      // Handle error appropriately
    }
  };

  templete(): string {
    const options = this.transactionTypes.length
      ? this.transactionTypes
          .map((t) => {
            const val = t.type;
            return `<option value="${val}"}>${t.type}</option>`;
          })
          .join("")
      : `<option disabled>Loading types…</option>`;
    const otherSel = this.currentSelection === "other";
    const otherOption = `<option value="other"${
      otherSel ? " selected" : ""
    }>other</option>`;

    const accountOwnerOptions = this.accountOwners.length
      ? this.accountOwners
          .map((t) => {
            const val = t.account_owner;
            return `<option value="${val}"}>${t.account_owner}</option>`;
          })
          .join("")
      : `<option disabled>Loading types…</option>`;
    const otherAccountOwnerSel = this.currentSelectedAccount === "other";
    const otherAccountOwnerOption = `<option value="other"${
      otherAccountOwnerSel ? " selected" : ""
    }>other</option>`;

    const transactioncategoryOptions = this.transactionCategories.length
      ? this.transactionCategories
          .map((c) => {
            const val = c.category;
            return `<option value="${val}"}>${c.category}</option>`;
          })
          .join("")
      : `<option disabled>Loading types…</option>`;
    return `
        <h1>Add a transaction</h1>
        <div style="text-align: center;">
          <a href="/"><button class="btn btn-outline-primary">Back to Transaction list</button></a>
        </div>
	<br/>
	<div class="form-container">
                <div><label class="form-label">Date:</label><input type="date" name="date"></div>
                <div><label class="form-label">Amount:</label><input type="text" name="quantity"></div>
                <div>
                  <label class="form-label">Type:</label>
                  <select name="type">
                    ${options}
                    ${otherOption}
                  </select>
                </div>
                ${
                  this.showOther
                    ? `
                <div id="otherTypeContainer" style="margin-top:8px;">
                  <label>Specify other:</label>
                  <input type="text" id="otherType" name="otherType"placeholder="Enter new type">
                </div>
                `
                    : ""
                }
                <div><label class="form-label">Additional data:</label><input type="text" name="data"></div>
                <div>
                    <label>Account owner</label>
                        <select name="account_owner">
                          ${accountOwnerOptions}
                          ${otherAccountOwnerOption}
                    </select>
                </div>
                ${
                  this.showOtherAccountOwner
                    ? `
              <div id="otherTypeContainer" style="margin-top:8px;">
                <label>Specify other:</label>
                  <input type="text" id="otherType" name="otherType" placeholder="Enter new account owner">
              </div>
              `
                    : ""
                }
                <button id="save" class="btn btn-outline-success">Save</button>
        </div>
        `;
  }
}
