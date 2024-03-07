import { error } from "jquery";
import { Transaction, TransactionProp } from "../models/Transaction";
import { View } from "./View";

type FormData = {
  date?: string;
  amount?: string;
  comment?: string;
  user?: string;
  data?: string;
};

type ValidTransactionData = Omit<TransactionProp, "id">;

export class EditTransaction extends View<Transaction, TransactionProp> {
  eventMap(): { [key: string]: () => void } {
    return {
      "click:#save": this.onSave,
    };
  }

  validTransactionData(data: FormData): ValidTransactionData {
    if (!!data.date == false) {
      data.date = this.model.get("date");
    }
    if (
      !!data.date == false ||
      !!data.amount === false ||
      !!data.comment === false ||
      !!data.user === false
    ) {
      throw error;
    }
    const floatAmont = parseFloat(data.amount);
    if (!!floatAmont === false) {
      throw error;
    }
    return {
      date: data.date,
      amount: floatAmont,
      comment: data.comment,
      user: data.user,
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
    console.log(formData);
    const attrs = this.validTransactionData(formData);
    this.model.set(attrs);
    this.model.save();
    window.location.href = `http://${window.location.host}`;
  };

  templete(): string {
    return `
        <h1>Edit a transaction</h1>
        <div>
                <div><label>Date:</label><input type="date" name="date" value="${this.model.get(
                  "date"
                )}"></div>
                <div><label>Amount:</label><input type="text" name="amount" value="${this.model.get(
                  "amount"
                )}"></div>
                <div><label>Commento:</label><input type="text" name="comment" value="${this.model.get(
                  "comment"
                )}"></div>
                <div><label>Additional data:</label><input type="text" name="data" value="${this.model.get(
                  "data"
                )}"></div>
                <div>
                    <label>Chi?</label>
                        <select name="user" value="${this.model.get("user")}">
                            <option value="both">Both</option>
                            <option value="luca">Luca</option>
                            <option value="chiara">Chiara</option>
                    </select>
                </div>
                <button id="save" class="btn btn-outline-success">Save</button>
        </div>
        `;
  }
}
