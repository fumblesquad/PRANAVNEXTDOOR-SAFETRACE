import { createContext, useContext } from 'react';

export const PageNavContext = createContext(null);
export const usePageNav = () => useContext(PageNavContext);
