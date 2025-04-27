export class Router {
  routes: { [key: string]: (params: { [key: string]: string }) => void };

  constructor() {
    this.routes = {};
    window.addEventListener("popstate", this.handleRootChange);
  }

  addRoute(
    path: string,
    callback: (params: { [key: string]: string }) => void
  ) {
    this.routes[path] = (params: { [key: string]: string }) => {
      callback(params);
    };
  }

  navigate(path: string) {
    history.pushState(null, "", path);
    this.handleRootChange();
  }

  handleRootChange = () => {
    const currentPath = window.location.pathname;
    for (const routePath in this.routes) {
      const params: { [key: string]: string } = {};
      const routeSegments = routePath.split("/");
      const currentSegments = currentPath.split("/");
      if (routeSegments.length === currentSegments.length) {
        let isMatch = true;
        for (let i = 0; i < routeSegments.length; i++) {
          const routeSegment = routeSegments[i];
          const currentSegment = currentSegments[i];
          if (routeSegment.startsWith("{") && routeSegment.endsWith("}")) {
            const paramName = routeSegment.slice(1, -1);
            params[paramName] = currentSegment;
          } else if (routeSegment !== currentSegment) {
            isMatch = false;
            break;
          }
        }
        if (isMatch) {
          this.routes[routePath](params);
          return;
        }
      }
    }
  };
}
