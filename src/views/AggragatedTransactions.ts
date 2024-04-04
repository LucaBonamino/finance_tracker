import { Transaction, TransactionProp } from "../models/Transaction";
import { CollectionView } from "./CollectionView";
import { Transactions } from "../models/Transactions";
import * as $ from "jquery";

export class AggragatedTransactions extends CollectionView<
  Transaction,
  TransactionProp
> {
  eventMap(): { [key: string]: (event: Event | undefined) => void } {
    return {
      "click:.edit": this.onEdit,
      "click:.delete": this.onDelete,
      "click:.show": this.onshow,
    };
  }

  onDelete = (event: Event | undefined) => {
    if (event) {
      const button = event.target as HTMLButtonElement;
      const index = parseInt(button.dataset.id!);
      const model = this.collection.models[index];
      model.delete();
      this.collection.models.splice(index, 1);
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

  onshow(event: Event | undefined) {
    if (event) {
      const button = event.target as HTMLButtonElement;
      const index = button.dataset.id!;
      const table = document.getElementById(`dataTableMount${index}`);
      if (table) {
        if (table.style.display === "none") {
          table.style.display = "";
          $(function () {
            $(`#dataTableMount${index}`).DataTable().destroy();
            $(`#dataTableMount${index}`).DataTable({ order: [[0, "desc"]] });
          });
        } else {
          table.style.display = "none";
          $(`#dataTableMount${index}`).DataTable().destroy();
        }
      }
    } else {
      console.log("Do nothing");
    }
  }

  templete(): string {
    const cummulatedAmounts = Transactions.aggragateTransactionObj(
      this.collection.models
    );

    return `
    <h1>Aggragated View</h1>
    <div>
      <a href="/add"><button id="save" class="btn btn-outline-success">Add Transaction</button></a>
      <a href="/"><button id="save" class="btn btn-outline-primary">Back to all transaction</button></a>
    </div>
    </br>
    <div>
        ${Object.entries(cummulatedAmounts)
          .map(
            ([month, transactions]) => `
              <div>
              <div class="border rounded mb-3 d-inline-block">
              <button class="show" data-id="${month}">${month} - ${Transactions.formatDate(
              month
            )} - Total ${Transactions.calculateCumulatedAmount(
              transactions
            )} (${transactions.length}) ></button>
            </div>
                <table id="dataTableMount${month}" class="table table-striped hidden" style="width:100%;text-align:center;display: none;">
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
                  ${transactions
                    .map(
                      (transactionObj) => `
                    <tr>
                      <td>${transactionObj.transaction.get("date")}</td>
                      <td>${transactionObj.transaction.get("amount")}</td>
                      <td>${transactionObj.transaction.get("comment")}</td>
                      <td>${transactionObj.transaction.get("user")}</td>
                      <td>
                        <button class="edit btn btn-outline-primary" data-id="${
                          transactionObj.index
                        }">Edit</button>
                        <button class="delete btn btn-outline-danger" data-id="${
                          transactionObj.index
                        }">Delete</button>
                      </td>
                    </tr>
                    `
                    )
                    .join("")}
                </tbody>
                </table>
            `
          )
          .join("")}
          </div>
    </div>
    `;
  }
}
