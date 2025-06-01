export interface NavigationLink {
  href: string;
  label: string;
  className?: string;
}

export class NavigationHeader {
  constructor(
    private links: readonly NavigationLink[],
    private callbacks: {
      onImportClick: () => void;
    }
  ) {}

  getNavigationHeader(showFileUpload: boolean): string {
    return `
      <div>
        <button id="importButton" class="btn btn-outline-info">Import from file</button>
        ${
          showFileUpload
            ? '<input type="file" id="fileInput" /> <button class="submitFile btn btn-outline-primary">Submit</button></br>'
            : ""
        }
        ${this.links
          .map(
            ({ href, label, className }) =>
              `<a href="${href}">
                 <button class="${className ?? "btn"}">${label}</button>
               </a>`
          )
          .join("")}
      </div>`;
  }

  handleImportClick = () => {
    this.callbacks.onImportClick();
  };
}
