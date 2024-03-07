import "datatables.net";
import { Row } from "./models/Row";
import { Router } from "./models/Router";
import { Transaction, TransactionProp } from "./models/Transaction";
import { rootUrl } from "./Config";
import { TableView } from "./views/TableView";
import { Transactions } from "./models/Transactions";
import { AddTransaction } from "./views/addTransaction";
import { EditTransaction } from "./views/EditTransaction";

const router = new Router();

router.addRoute("/", () => {
  const transactions = new Transactions(`${rootUrl}/transactions`, (json) =>
    Transaction.buidTransaction(json)
  );
  transactions.on("change", () => {
    const root = document.getElementById("content");
    console.log("triggered");
    if (root) {
      const table = new TableView(root, transactions);
      table.render();
    } else {
      const contentDiv = document.getElementById("content");
      if (contentDiv) {
        contentDiv.innerHTML = "<p>This is the home page.</p>";
      }
    }
  });
  transactions.fetch();
});

router.addRoute("/add", () => {
  const root = document.getElementById("content");
  if (root) {
    const addView = new AddTransaction(root);
    addView.render();
  }
});

router.addRoute("/edit/{transaction_id}", (params) => {
  const { transaction_id } = params;
  const fetched = Transaction.fetchById<TransactionProp>(
    parseInt(transaction_id)
  )
    .then((result: TransactionProp | null) => {
      if (result) {
        const root = document.getElementById("content");
        if (root) {
          const transaction = Transaction.buidTransaction(result);
          console.log(transaction);
          const view = new EditTransaction(root, transaction);
          view.render();
        }
      }
    })
    .catch((error) => {
      throw error;
    });

  // Use transaction_id to fetch specific transaction data or render an edit view
});

router.navigate(window.location.href);
