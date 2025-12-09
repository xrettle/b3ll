import React from 'react';

declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>];
  export function useState<T = undefined>(): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>];
  
  export function useEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;
  
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
  ): T;
  
  export interface Dispatch<A> {
    (value: A): void;
  }
  
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type EffectCallback = () => void | (() => void);
  export type DependencyList = ReadonlyArray<any>;
}
