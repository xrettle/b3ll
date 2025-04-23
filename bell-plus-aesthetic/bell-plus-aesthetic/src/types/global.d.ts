import React from 'react';
import ReactDOM from 'react-dom';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';

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
  const content: Record<string, unknown>;
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
