declare module "*.jsx" {
  import type { ComponentType } from "react";
  const Component: ComponentType<any>;
  export default Component;
}

declare module "../components/LaserFlow" {
  import type { ComponentType } from "react";
  const LaserFlow: ComponentType<any>;
  export default LaserFlow;
}
