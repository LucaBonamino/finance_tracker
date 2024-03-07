import { Transaction, TransactionProp } from "../models/Transaction";
import { CollectionView } from "./CollectionView";
import * as $ from "jquery";

export class TableView extends CollectionView<Transaction, TransactionProp> {
  eventMap(): { [key: string]: (event: Event | undefined) => void } {
    return {
      "click:.edit": this.onEdit,
      "click:.delete": this.onDelete,
    };
  }

  onDelete = (event: Event | undefined) => {
    if (event) {
      const button = event.target as HTMLButtonElement;
      const index = parseInt(button.dataset.id!);
      const model = this.collection.models[index];
      model.delete();
      this.collection.models.splice(index, 1);
      console.log(this.collection);
      this.render();
    } else {
      console.log("Do nothing");
    }
  };

  onEdit = (event: Event | undefined) => {
    if (event) {
      const button = event.target as HTMLButtonElement;
      const index = parseInt(button.dataset.id!);
      const model = this.collection.models[index];
      window.location.href = `http://${window.location.host}/edit/${model.get(
        "id"
      )}`;
    } else {
      console.log("Do nothing");
    }
  };

  render(): void {
    $(function () {
      $("#dataTable").DataTable();
    });
    super.render(); // Call the render method of the parent class first
  }

  templete(): string {
    return `
    <h1>All Transactions</h1>
    <div>
    <a href="/add"><button id="save" class="btn btn-outline-success">Add Transaction</button></a>
    </div>
    </br>
    <table id="dataTable" class="table table-striped" style="width:100%">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Comment</th>
            <th>Who</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${this.collection.models
            .map(
              (data, index) => `
            <tr>
              <td>${data.get("date")}</td>
              <td>${data.get("amount")}</td>
              <td>${data.get("comment")}</td>
              <td>${data.get("user")}</td>
              <td>
                <button class="edit btn btn-outline-primary" data-id="${index}">Edit</button>
                <button class="delete btn btn-outline-danger" data-id="${index}">Delete</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }
}
