import { Transaction, TransactionProp } from "../models/Transaction";
import { CollectionView } from "./CollectionView";
import { Transactions } from "../models/Transactions";
import { NavigationHeader } from "./NavigationHeader";
import * as $ from "jquery";
import Chart from "chart.js/auto";

const aggregatedLinks = [
  {
    href: "/add",
    label: "Add Transaction",
    className: "btn btn-outline-success",
  },
  {
    href: "/aggregated",
    label: "Aggregated View",
    className: "btn btn-outline-primary",
  },
] as const;

export class TableView extends CollectionView<Transaction, TransactionProp> {
  private showFileUpload = false;

  toggleFileUpload = () => {
    this.showFileUpload = !this.showFileUpload;
    this.render();
  };

  private header = new NavigationHeader(aggregatedLinks, {
    onImportClick: this.toggleFileUpload,
  });

  eventMap(): { [key: string]: (event: Event | undefined) => void } {
    return {
      "click:.edit": this.onEdit,
      "click:.delete": this.onDelete,
      "click:#importButton": this.header.handleImportClick,
      "change:#fileInput": this.header.onFileChange,
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

  render(): void {
    $(function () {
      $("#dataTable").DataTable({ order: [[0, "desc"]] });
    });
    setTimeout(() => {
      this.initializePieChart();
    }, 0);
    super.render();
  }

  initializePieChart(): void {
    // Compute the aggregated data again (or you could store the amounts globally)
    const aggregatedByType = Transactions.aggregateTransactionsByType(
      this.collection.models
    );
    const amounts = Object.entries(aggregatedByType).map(
      ([transactionType, transactions]) => ({
        transactionType,
        quantity: Transactions.calculateCumulatedAmount(transactions),
      })
    );

    // Extract labels and data arrays from amounts
    const labels = amounts.map((item) => item.transactionType);
    const data = amounts.map((item) => item.quantity);

    // Define colors (adjust as needed)
    const backgroundColors = [
      "rgba(255, 99, 132, 0.2)",
      "rgba(54, 162, 235, 0.2)",
      "rgba(255, 206, 86, 0.2)",
      "rgba(75, 192, 192, 0.2)",
      "rgba(153, 102, 255, 0.2)",
      "rgba(255, 159, 64, 0.2)",
    ];

    const borderColors = [
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
    ];

    // Get the canvas element and its 2D context
    const canvas = document.getElementById("pieChart") as HTMLCanvasElement;
    if (!canvas) {
      console.error("Pie chart canvas element not found");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("2D context not available on pie chart canvas");
      return;
    }
    // Create the pie chart (Chart.js must be loaded on your page)
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Transaction Quantities",
            data: data,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderColor: borderColors.slice(0, labels.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Transactions by Category",
          },
        },
      },
    });
  }

  templete(): string {
    const header = this.header.getNavigationHeader(this.showFileUpload);
    return `
    <h1>All Transactions</h1>
    ${header}
    </br>
    <table id="dataTable" class="table table-striped" style="width:100%;text-align:center;">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Category</th>
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
              <td>${data.get("quantity")}</td>
              <td>${data.get("type")}</td>
              <td>${data.get("category")}</td>
              <td>${data.get("account_owner")}</td>
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
      <div style="width: 400px; height: 400px;">
      <!-- Pie Chart Canvas -->
      <canvas id="pieChart" width="400" height="400"></canvas>
    </div>
      <div>
    </div>
    `;
  }
}
