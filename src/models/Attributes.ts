export class Attributes<T extends object> {
  constructor(private data: T) {}

  get = <K extends keyof T>(key: K): T[K] => {
    return this.data[key];
  };

  set(updateData: T): void {
    Object.assign(this.data, updateData);
  }

  getAll(): T {
    return this.data;
  }
}
