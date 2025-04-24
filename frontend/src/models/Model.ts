import { AxiosPromise, AxiosResponse } from "axios";
import { OwnsId } from "./OwnsId";
import { rootUrl } from "../Config";
import * as SyncAlias from "./Sync";

interface ModelProp<T> {
  set(value: T): void;
  getAll(): T;
  get<K extends keyof T>(key: K): T[K];
}
interface Sync<T> {
  fetch(id: number): AxiosPromise;
  save(data: T): AxiosPromise;
  delete(id: number): AxiosPromise;
}

interface Events {
  on(eventName: string, callback: () => {}): void;
  trigger(eventName: string): void;
}

export class Model<T extends OwnsId> {
  constructor(
    private attributes: ModelProp<T>,
    private events: Events,
    private syncronization: Sync<T>
  ) {}

  static fetchById<T extends OwnsId>(id: number): Promise<T | null> {
    const sync = new SyncAlias.Sync<T>(`${rootUrl}/transactions`);
    return sync
      .fetch(id)
      .then((response) => {
        return response.data as T;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        return null;
      });
  }

  on = this.events.on;
  trigger = this.events.trigger;
  get = this.attributes.get;

  set(updateObject: T): void {
    this.attributes.set(updateObject);
    this.events.trigger("update");
  }

  fetch(): void {
    const id = this.attributes.get("id");
    if (typeof id !== "number") {
      throw new Error("Cannot fetch without an id");
    }

    this.syncronization.fetch(id).then((response: AxiosResponse): void => {
      this.set(response.data);
    });
  }

  delete() {
    const id = this.attributes.get("id");
    if (typeof id !== "number") {
      throw new Error("Cannot fetch without an id");
    } else {
      this.syncronization.delete(id).then((response: AxiosResponse): void => {
        this.events.trigger("delete");
      });
    }
  }

  save(callback?: () => void): void {
    console.log("save");
    this.syncronization
      .save(this.attributes.getAll())
      .then((response: AxiosResponse) => {
        if (callback !== undefined) {
          callback();
        }
        this.events.trigger("save");
      })
      .catch(() => {
        this.events.trigger("error");
      });
  }
}
