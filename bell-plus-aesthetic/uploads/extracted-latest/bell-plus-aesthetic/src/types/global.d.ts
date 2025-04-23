/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="next" />
/// <reference types="next/font/google" />

declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const content: any;
  export default content;
}

// Add declaration for ClientBody
declare module "./ClientBody" {
  import { ReactNode } from "react";
  
  export interface ClientBodyProps {
    children: ReactNode;
  }
  
  const ClientBody: React.FC<ClientBodyProps>;
  export default ClientBody;
}

// Add declaration for ErrorBoundary
declare module "../components/ErrorBoundary" {
  import { ReactNode } from "react";
  
  export interface ErrorBoundaryProps {
    children: ReactNode;
  }
  
  const ErrorBoundary: React.FC<ErrorBoundaryProps>;
  export default ErrorBoundary;
}
