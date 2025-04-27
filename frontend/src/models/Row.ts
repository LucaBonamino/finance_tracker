import { faker } from "@faker-js/faker";

export interface RowProp {
  amount: number;
  comment: string;
  user: string;
}

export class Row {
  people: Array<string> = ["Luca", "Chiara", "Both"];
  constructor(private size: number) {}

  getRandomElement(arrayOfNames): string {
    const index: number = Math.floor(Math.random() * arrayOfNames.length);
    return arrayOfNames[index];
  }

  generateData() {
    let dataSet: string[][] = [];
    for (let i = 0; i < this.size; i++) {
      dataSet.push([
        `${faker.datatype.float({
          min: 10,
          max: 100,
          precision: 0.001,
        })} \u20ac`,
        faker.random.words(),
        this.getRandomElement(this.people),
        "action",
      ]);
    }
    return dataSet;
  }
}
