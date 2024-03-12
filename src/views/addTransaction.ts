import { error } from "jquery";
import { rootUrl } from "../Config";
import { Transaction, TransactionProp } from "../models/Transaction";
import { SimpleView } from "./SimpleView";
import { Attributes } from "../models/Attributes";
import { Sync } from "../models/Sync";
import { Events } from "../models/Events";

type FormData = {
  date?: string;
  amount?: string;
  comment?: string;
  user?: string;
  data?: string;
};

type ValidTransactionData = Omit<TransactionProp, "id">;

export class AddTransaction extends SimpleView {
  eventMap(): { [key: string]: () => void } {
    return {
      "click:#save": this.onSave,
    };
  }

  validTransactionData(data: FormData): ValidTransactionData {
    if (
      !!data.date == false ||
      !!data.amount === false ||
      !!data.comment === false ||
      !!data.user === false
    ) {
      alert("Date, amount, comment and user are required!");
      throw error;
    }
    const floatAmont = parseFloat(data.amount);
    if (!!floatAmont === false) {
      alert("Amount must be a numeric value!");
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

    const events = new Events();
    const syncronization = new Sync<TransactionProp>(`${rootUrl}/transactions`);
    try {
      const attrs = this.validTransactionData(formData);
      const attributes = new Attributes<TransactionProp>(attrs);
      const transaction = new Transaction(attributes, events, syncronization);
      transaction.save();
      setTimeout(() => {
        window.location.href = `http://${window.location.host}`;
      }, 500);
    } catch {}
  };

  templete(): string {
    return `
        <h1>Add a transaction</h1>
        <div style="text-align: center;">
          <a href="/"><button class="btn btn-outline-primary">Back to Transaction list</button></a>
        </div>
        <br/>
        <div class="form-container">
                <div class="form-group"><label>Date:</label><input type="date" name="date"></div>
                <div class="form-group"><label>Amount:</label><input type="text" name="amount"></div>
                <div class="form-group"><label>Comment:</label><input type="text" name="comment"></div>
                <div class="form-group"><label>Additional data:</label><input type="text" name="data"></div>
                <div class="form-group">
                    <label>Who?</label>
                        <select name="user">
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
