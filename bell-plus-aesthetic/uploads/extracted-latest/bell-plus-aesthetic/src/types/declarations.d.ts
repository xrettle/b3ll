// React declarations
declare module 'react' {
  export = React;
  export as namespace React;
  
  namespace React {
    type ReactNode = 
      | React.ReactElement
      | string
      | number
      | boolean
      | null
      | undefined
      | React.ReactNodeArray;
      
    interface ReactNodeArray extends Array<ReactNode> {}
    
    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }
    
    type JSXElementConstructor<P> = 
      | ((props: P) => ReactElement<any, any> | null)
      | (new (props: P) => Component<any, any>);
      
    type Key = string | number;
    
    interface ErrorInfo {
      componentStack: string;
    }
    
    interface CSSProperties {
      [key: string]: any;
    }
    
    class Component<P = {}, S = {}> {
      constructor(props: P);
      props: P;
      state: S;
      setState(state: Partial<S> | ((prevState: S, props: P) => Partial<S>), callback?: () => void): void;
      forceUpdate(callback?: () => void): void;
      render(): ReactNode;
      componentDidMount?(): void;
      componentDidUpdate?(prevProps: P, prevState: S, snapshot?: any): void;
      componentWillUnmount?(): void;
      componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
      static getDerivedStateFromProps?<P, S>(props: P, state: S): Partial<S> | null;
      static getDerivedStateFromError?(error: Error): Partial<any>;
    }
    
    interface FC<P = {}> {
      (props: P): ReactElement<any, any> | null;
      displayName?: string;
    }
    
    interface SVGAttributes<T> {
      [key: string]: any;
    }
  }
}

// Next.js declarations
declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    icons?: {
      icon?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }
}

// Next.js font declarations
declare module 'next/font/google' {
  export function Inter(options: { subsets: string[] }): {
    className: string;
    style: React.CSSProperties;
  };

  export function Fira_Code(options: { 
    subsets: string[];
    weight: string[];
    variable: string;
  }): {
    className: string;
    style: React.CSSProperties;
    variable: string;
  };
}

// Next.js dynamic import
declare module 'next/dynamic' {
  export default function dynamic<P = {}>(
    dynamicOptions: () => Promise<React.ComponentType<P>>,
    options?: {
      loading?: React.ComponentType<any>;
      ssr?: boolean;
      [key: string]: any;
    }
  ): React.ComponentType<P>;
}

// ClientBody module declaration
declare module './ClientBody' {
  import React from 'react';
  
  export interface ClientBodyProps {
    children: React.ReactNode;
  }
  
  const ClientBody: React.FC<ClientBodyProps>;
  export default ClientBody;
}

// ErrorBoundary module declaration
declare module '../components/ErrorBoundary' {
  import React from 'react';
  
  export interface ErrorBoundaryProps {
    children: React.ReactNode;
  }
  
  const ErrorBoundary: React.FC<ErrorBoundaryProps>;
  export default ErrorBoundary;
}
