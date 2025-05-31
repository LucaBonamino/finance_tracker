import { event } from "jquery";

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
        <button id="importButton" class="btn btn-outline-success">Import from file</button>
        ${showFileUpload ? '<input type="file" id="fileInput" />' : ""}
        ${this.links
          .map(
            ({ href, label, className }) =>
              `<a href="${href}">
                 <button class="${className ?? "btn"}">${label}</button>
               </a>`
          )
          .join("\n")}
      </div>`;
  }

  handleImportClick = () => {
    this.callbacks.onImportClick();
  };

  onFileChange = (event?: Event) => {
    const input = event?.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      console.log("Selected file:", file.name);
    }
  };
}
