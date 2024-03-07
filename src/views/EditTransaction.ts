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
      alert("Amount must be a numeric value!");
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
    try {
      const attrs = this.validTransactionData(formData);
      this.model.set(attrs);
      this.model.save();
      window.location.href = `http://${window.location.host}`;
    } catch {}
  };

  templete(): string {
    return `
        <h1>Edit a transaction</h1>
        <div style="text-align: center;">
          <a href="/"><button class="btn btn-outline-primary">Back to Transaction list</button></a>
        </div>
        <br/>
        <div class="form-container">
                <div><label>Date:</label><input type="date" name="date" value="${this.model.get(
                  "date"
                )}"></div>
                <div><label>Amount:</label><input type="text" name="amount" value="${this.model.get(
                  "amount"
                )}"></div>
                <div><label>Comment:</label><input type="text" name="comment" value="${this.model.get(
                  "comment"
                )}"></div>
                <div><label>Additional data:</label><input type="text" name="data" value="${this.model.get(
                  "data"
                )}"></div>
                <div>
                    <label>Who?</label>
                        <select name="user" value="${this.model.get("user")}">
                            <option value="user1">User1</option>
                            <option value="user2">User2</option>
                            <option value="user3">User3</option>
                    </select>
                </div>
                <button id="save" class="btn btn-outline-success">Save</button>
        </div>
        `;
  }
}
