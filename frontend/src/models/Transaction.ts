import { Model } from "./Model";
import { faker } from "@faker-js/faker";
import { Attributes } from "./Attributes";
import { Events } from "./Events";
import { Sync } from "./Sync";
import { rootUrl } from "../Config";

export enum TransactionType {
  FIXED_EXPENSES = "fixed_expenses",
  LOISIRS = "loisirs",
  CAR = "car",
  SPESA = "spesa",
}

export interface TransactionProp {
  id?: number;
  date: string;
  quantity: number;
  comment: string;
  account_owner: string;
  data?: string;
  type?: string;
  category?: string;
}

const people: Array<string> = ["Luca", "Chiara", "Both"];

export class Transaction extends Model<TransactionProp> {
  static getRandomElement(arrayOfNames): string {
    const index: number = Math.floor(Math.random() * arrayOfNames.length);
    return arrayOfNames[index];
  }

  static buidTransaction(attrs: TransactionProp): Transaction {
    return new Transaction(
      new Attributes<TransactionProp>(attrs),
      new Events(),
      new Sync<TransactionProp>(`${rootUrl}/transactions`)
    );
  }

  static generateData(size: number) {
    let dataSet: string[][] = [];
    for (let i = 0; i < size; i++) {
      dataSet.push([
        `${faker.datatype.float({
          min: 10,
          max: 100,
          precision: 0.001,
        })} \u20ac`,
        faker.random.words(),
        Transaction.getRandomElement(people),
        "action",
      ]);
    }
    return dataSet;
  }
}
