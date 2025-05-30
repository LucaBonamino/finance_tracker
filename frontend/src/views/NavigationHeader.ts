export interface NavigationLink {
  href: string;
  label: string;
  className?: string;
}

export class NavigationHeader {
  constructor(private links: readonly NavigationLink[]) {}

  getNavigationHeader(): string {
    const fileInput = `<input type="file" id="fileInput" />`;
    const buttons = this.links
      .map(
        ({ href, label, className }) =>
          `<a href="${href}">
             <button class="${className ?? "btn"}">${label}</button>
           </a>`
      )
      .join("\n");

    return `<div>
      ${fileInput}
      ${buttons}
    </div>`;
  }
}
