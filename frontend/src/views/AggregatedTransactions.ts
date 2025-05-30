import { Transaction, TransactionProp } from "../models/Transaction";
import { CollectionView } from "./CollectionView";
import { Transactions } from "../models/Transactions";
import * as $ from "jquery";
import Chart from "chart.js/auto";
import { NavigationHeader, NavigationLink } from "./NavigationHeader";

const aggregatedLinks = [
  {
    href: "/add",
    label: "Add Transaction",
    className: "btn btn-outline-success",
  },
  {
    href: "/",
    label: "Back to Transaction list",
    className: "btn btn-outline-primary",
  },
] as const;

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
      const month = button.dataset.id!;
      const table = document.getElementById(`dataTableMount${month}`);
      const chartContainer = document.getElementById(`chartContainer-${month}`);
      if (table && chartContainer) {
        if (table.style.display === "none") {
          // Show both table and chart container
          table.style.display = "";
          chartContainer.style.display = "";
          $(function () {
            $(`#dataTableMount${month}`).DataTable().destroy();
            $(`#dataTableMount${month}`).DataTable({ order: [[0, "desc"]] });
          });
        } else {
          // Hide both table and chart container
          table.style.display = "none";
          chartContainer.style.display = "none";
          $(`#dataTableMount${month}`).DataTable().destroy();
        }
      }
    } else {
      console.log("Do nothing");
    }
  }

  templete(): string {
    // Aggregate transactions per month
    const cummulatedAmounts = Transactions.aggragateTransactionObj(
      this.collection.models
    );
    const header = new NavigationHeader(aggregatedLinks).getNavigationHeader();
    return `
      <h1>Aggregated View</h1>
      
      <!-- Summary Charts Section (Month & Year only) -->
      <div id="summaryCharts" style="display: flex; flex-wrap: wrap; justify-content: space-around; margin-bottom: 20px;">
        <div style="width: 400px; height: 400px;">
          <canvas id="summaryChartMonth"></canvas>
        </div>
        <div style="width: 400px; height: 400px;">
          <canvas id="summaryChartYear"></canvas>
        </div>
      </div>
      ${header}
      <br/>
      <div>
        ${Object.entries(cummulatedAmounts)
          .map(
            ([month, transactions]) => `
              <div>
                <div class="border rounded mb-3 d-inline-block">
                  <button class="show" data-id="${month}">
                    ${month} - ${Transactions.formatDate(
              month
            )} - Total ${Transactions.calculateCumulatedAmount(
              transactions
            )} (${transactions.length})
                  </button>
                </div>
                <div>
                  <table id="dataTableMount${month}" class="table table-striped hidden dataTableMount${month}" style="width:100%;text-align:center;display: none;">
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
                      ${transactions
                        .map(
                          (transactionObj) => `
                          <tr>
                            <td>${transactionObj.transaction.get("date")}</td>
                            <td>${transactionObj.transaction.get(
                              "quantity"
                            )}</td>
                            <td>${transactionObj.transaction.get("type")}</td>
                            <td>${transactionObj.transaction.get(
                              "category"
                            )}</td>
                            <td>${transactionObj.transaction.get(
                              "account_owner"
                            )}</td>
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
                </div>
                <!-- Canvas for Pie Chart Aggregated by Type for this month (initially hidden) -->
                <div id="chartContainer-${month}" style="width: 400px; height: 400px; margin-top: 20px; display: none;">
                  <canvas id="pieChartAggregated-${month}"></canvas>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  render(): void {
    // Render the template into the DOM
    super.render();

    // Initialize detailed per‑month pie charts.
    const cummulatedAmounts = Transactions.aggragateTransactionObj(
      this.collection.models
    );
    Object.entries(cummulatedAmounts).forEach(([month, transactions]) => {
      setTimeout(() => {
        this.initializePieChartForMonth(month, transactions);
      }, 0);
    });

    // Initialize the summary charts (grouped by month and year only)
    setTimeout(() => {
      this.initializeSummaryCharts();
    }, 0);
  }

  initializePieChartForMonth(month: string, transactions: any[]): void {
    // For this month, further aggregate transactions by type.
    const aggregatedByType = Transactions.aggregateTransactionsByType(
      transactions.map((t) => t.transaction) as Transaction[]
    );

    const labels = Object.keys(aggregatedByType);
    const data = Object.entries(aggregatedByType).map(([type, trans]) =>
      Transactions.calculateCumulatedAmount(trans)
    );

    console.log(`Month: ${month} - Labels:`, labels, "Data:", data);

    const canvas = document.getElementById(
      `pieChartAggregated-${month}`
    ) as HTMLCanvasElement;
    if (!canvas) {
      console.error(`Canvas for month ${month} not found`);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error(`2D context not available for month ${month}`);
      return;
    }

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

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: `Cumulated Amount per Type for ${month}`,
            data: data,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderColor: borderColors.slice(0, labels.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          title: {
            display: true,
            text: `Aggregated Transactions by Type for ${month}`,
          },
        },
      },
    });
  }

  initializeSummaryCharts(): void {
    // Use the complete collection of transactions for summary charts.
    const models = this.collection.models;

    // ---------- Group by Month ----------
    const aggregatedByMonth = Transactions.aggragateTransactionObj(models);
    const monthLabels = Object.keys(aggregatedByMonth);
    const monthData = monthLabels.map((month) =>
      Transactions.calculateCumulatedAmount(aggregatedByMonth[month])
    );

    const canvasMonth = document.getElementById(
      "summaryChartMonth"
    ) as HTMLCanvasElement;
    if (canvasMonth) {
      const ctxMonth = canvasMonth.getContext("2d");
      if (ctxMonth) {
        new Chart(ctxMonth, {
          type: "pie",
          data: {
            labels: monthLabels,
            datasets: [
              {
                label: "Total Amount by Month",
                data: monthData,
                backgroundColor: [
                  "rgba(255, 99, 132, 0.2)",
                  "rgba(54, 162, 235, 0.2)",
                  "rgba(255, 206, 86, 0.2)",
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(153, 102, 255, 0.2)",
                  "rgba(255, 159, 64, 0.2)",
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                  "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              title: {
                display: true,
                text: "Summary: Total Amount by Month",
              },
            },
          },
        });
      }
    }

    // ---------- Group by Year ----------
    const aggregatedByYear = models.reduce(
      (acc: { [year: string]: any[] }, model) => {
        const dateStr = model.get("date");
        const year = new Date(dateStr).getFullYear().toString();
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(model);
        return acc;
      },
      {}
    );

    const yearLabels = Object.keys(aggregatedByYear);
    const yearData = yearLabels.map((year) =>
      Transactions.calculateCumulatedAmount(aggregatedByYear[year])
    );

    const canvasYear = document.getElementById(
      "summaryChartYear"
    ) as HTMLCanvasElement;
    if (canvasYear) {
      const ctxYear = canvasYear.getContext("2d");
      if (ctxYear) {
        new Chart(ctxYear, {
          type: "pie",
          data: {
            labels: yearLabels,
            datasets: [
              {
                label: "Total Amount by Year",
                data: yearData,
                backgroundColor: [
                  "rgba(255, 99, 132, 0.2)",
                  "rgba(54, 162, 235, 0.2)",
                  "rgba(255, 206, 86, 0.2)",
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(153, 102, 255, 0.2)",
                  "rgba(255, 159, 64, 0.2)",
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                  "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              title: {
                display: true,
                text: "Summary: Total Amount by Year",
              },
            },
          },
        });
      }
    }
  }
}
