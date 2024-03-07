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

    const events = new Events();
    const syncronization = new Sync<TransactionProp>(`${rootUrl}/transactions`);

    const attrs = this.validTransactionData(formData);
    const attributes = new Attributes<TransactionProp>(attrs);
    const transaction = new Transaction(attributes, events, syncronization);

    transaction.save();
    window.location.href = `http://${window.location.host}`;
  };

  templete(): string {
    return `
        <h1>Add a transaction</h1>
        <div>
                <div><label>Date:</label><input type="date" name="date"></div>
                <div><label>Amount:</label><input type="text" name="amount"></div>
                <div><label>Commento:</label><input type="text" name="comment"></div>
                <div><label>Additional data:</label><input type="text" name="data"></div>
                <div>
                    <label>Chi?</label>
                        <select name="user">
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
