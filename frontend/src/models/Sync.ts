import axios, { AxiosPromise } from "axios";
import { OwnsId } from "./OwnsId";

export class Sync<T extends OwnsId> {
  constructor(public url: string) {}

  fetch(id: number): AxiosPromise {
    return axios.get(`${this.url}/${id}`);
  }

  delete(id: number): AxiosPromise {
    return axios.delete(`${this.url}/${id}`);
  }

  save(data: T): AxiosPromise {
    const { id } = data;
    if (id) {
      return axios.put(`${this.url}/${id}`, data);
    } else {
      return axios.post(this.url, data);
    }
  }
}
