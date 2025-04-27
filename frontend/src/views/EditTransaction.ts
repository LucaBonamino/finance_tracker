import { error } from "jquery";
import { Transaction, TransactionProp } from "../models/Transaction";
import { TransactionTypeProp } from "../models/TransactionType";
import { TransactionCategoryProp } from "../models/TransactionCategory";
import { View } from "./View";
import axios from "axios";
import { rootUrl } from "../Config";
import { AccountOwnerProp } from "../models/AccountOwner";

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

export class EditTransaction extends View<Transaction, TransactionProp> {
  private transactionTypes: TransactionTypeProp[] = [];
  private transactionCategories: TransactionCategoryProp[] = [];
  private accountOwners: AccountOwnerProp[] = [];
  private showOther: boolean;
  private showOtherAccountOwner: boolean;
  private currentSelection: string;
  private currentSelectedAccount: string;

  constructor(parent: Element, model: Transaction) {
    super(parent, model);
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
    EditTransaction.getTransactionTypes()
      .then((types) => {
        this.transactionTypes = types;
        this.render();
      })
      .catch((err) => {
        console.error("Failed to load transaction types", err);
      });
  }

  private loadCategory(): void {
    EditTransaction.getTransactionCategories()
      .then((category) => {
        this.transactionCategories = category;
        this.render();
      })
      .catch((err) => {
        console.error("Failed to load transaction types", err);
      });
  }

  private loadAccountOwners(): void {
    EditTransaction.getAccountOwners()
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
      "change:select[name='account_owner']": this.onTypeChange,
    };
  }

  validTransactionData(data: FormData): ValidTransactionData {
    if (!!data.date == false) {
      data.date = this.model.get("date");
    }
    if (!!data.date == false || !!data.quantity === false) {
      throw error;
    }
    const floatAmont = parseFloat(data.quantity);
    if (!!floatAmont === false) {
      throw error;
    }
    return {
      date: data.date,
      quantity: floatAmont,
      comment: data.comment!,
      account_owner: data.account_owner!,
      type: data.type,
      category: data.category,
    };
  }

  onSave = (): void => {
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
    if (formData["type"] === "other" && formData["otherType"]) {
      formData["type"] = formData["otherType"];
    }

    if (formData["account_owner"] === "other" && formData["otherAccountName"]) {
      formData["account_owner"] = formData["otherAccountName"];
    }

    // You can also delete 'otherType' if you want clean data:
    delete formData["otherType"];
    delete formData["otherAccountName"];

    const attrs = this.validTransactionData(formData);
    this.model.set(attrs);
    this.model.save(
      () => (window.location.href = `http://${window.location.host}`)
    );
  };

  private onTypeChange = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    const name = select.getAttribute("name");
    if (name === "type") {
      this.currentSelection = select.value;
      this.showOther = select.value === "other";
    }
    if (name === "account_owner") {
      this.currentSelectedAccount = select.value;
      this.showOtherAccountOwner = select.value === "other";
    }
    this.render();
  };

  templete(): string {
    if (this.currentSelection == null) {
      const selectedTypeRaw = this.model.get("type");
      this.currentSelection = String(selectedTypeRaw);
    }

    const options = this.transactionTypes.length
      ? this.transactionTypes
          .map((t) => {
            const val = t.type;
            const isSel = val === this.currentSelection;
            return `<option value="${val}"${isSel ? " selected" : ""}>${
              t.type
            }</option>`;
          })
          .join("")
      : `<option disabled>Loading types…</option>`;
    const otherSel = this.currentSelection === "other";
    const otherOption = `<option value="other"${
      otherSel ? " selected" : ""
    }>other</option>`;

    if (this.currentSelectedAccount == null) {
      const selectedAccountRaw = this.model.get("account_owner");
      this.currentSelectedAccount = String(selectedAccountRaw);
    }

    const accountOwnerOptions = this.accountOwners.length
      ? this.accountOwners
          .map((t) => {
            const val = t.account_owner;
            const isSel = val === this.currentSelectedAccount;
            return `<option value="${val}"${isSel ? " selected" : ""}>${
              t.account_owner
            }</option>`;
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
            const isSel = val === this.model.get("category");
            return `<option value="${val}"${isSel ? " selected" : ""}>${
              c.category
            }</option>`;
          })
          .join("")
      : `<option disabled>Loading types…</option>`;

    return `
        <h1>Edit a transaction</h1>
        <div style="text-align: center;">
          <a href="/"><button class="btn btn-outline-primary">Back to Transaction list</button></a>
        </div>
	      <br/>
	      <div  class="form-container">
        <div>
          <label>Date:</label><input type="date" name="date" value="${this.model.get(
            "date"
          )}">
        </div>
        <div>
          <label>Amount:</label><input type="text" name="quantity" value="${this.model.get(
            "quantity"
          )}">
        </div>
        <div>
          <label>Type:</label>
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
          <input type="text" id="otherType" name="otherType" value="${
            this.model.get("type") || ""
          }" placeholder="Enter new type">
        </div>
        `
              : ""
          }
            <div>
                 <label>Category:</label>
                <select name="category">
                  ${transactioncategoryOptions}
                </select>
            </div>
                <div>
                  <label>Additional data:</label>
                  <input type="text" name="data" value="${
                    this.model.get("data") ?? ""
                  }">
                </div>
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
                  <input type="text" id="otherType" name="otherAccountName" value="${
                    this.model.get("account_owner") || ""
                  }" placeholder="Enter new account owner">
              </div>
              `
                    : ""
                }
                <button id="save" class="btn btn-outline-success">Save</button>
        </div>
        `;
  }
}
