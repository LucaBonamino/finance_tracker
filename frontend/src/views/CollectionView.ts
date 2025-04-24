import { CollectionModel } from "../models/CollectionModel";

export abstract class CollectionView<T, K> {
  constructor(
    public parent: Element,
    public collection: CollectionModel<T, K>
  ) {}

  abstract templete(data?: any[]): string;

  eventMap(): { [key: string]: (event: Event | undefined) => void } {
    return {};
  }

  bindEvent(fragment: DocumentFragment): void {
    const eventMap = this.eventMap();

    for (let eventKey in eventMap) {
      const [eventName, selector] = eventKey.split(":");

      fragment.querySelectorAll(selector).forEach((element) => {
        element.addEventListener(eventName, eventMap[eventKey]);
      });
    }
  }

  render(): void {
    this.parent.innerHTML = "";
    const templateElement = document.createElement("template");
    templateElement.innerHTML = this.templete();

    this.bindEvent(templateElement.content);

    this.parent.append(templateElement.content);
  }
}
