import React, {
  createContext, useContext, useMemo, useState,
} from 'react';

const MessageContext = createContext<{
  message: string,
  setMessage:(message: string) => void,
  isLoading: boolean,
  setIsLoading: (isLoading: boolean) => void,
}>({
      message: '',
      isLoading: false,
      setMessage: () => null,
      setIsLoading: () => null,
    });

export function StatusProvider({
  children,
}: { children: JSX.Element | JSX.Element[] }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const providerValues = useMemo(() => ({
    message,
    setMessage,
    isLoading,
    setIsLoading,
  }), [message, setMessage, isLoading, setIsLoading]);

  return (
    <MessageContext.Provider value={providerValues}>
      {children}
    </MessageContext.Provider>
  );
}

export function useStatusProvider() {
  const {
    message,
    setMessage,
    isLoading,
    setIsLoading,
  } = useContext(MessageContext);
  return {
    message,
    setMessage,
    isLoading,
    setIsLoading,
  };
}
