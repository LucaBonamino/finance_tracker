export abstract class SimpleView {
  constructor(public parent: Element) {}

  abstract templete(data?: any[]): string;

  eventMap(): { [key: string]: () => void } {
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

  onRender(): void {}

  render(): void {
    this.parent.innerHTML = "";
    const templateElement = document.createElement("template");
    templateElement.innerHTML = this.templete();
    this.bindEvent(templateElement.content);

    this.onRender();

    this.parent.append(templateElement.content);
  }
}
