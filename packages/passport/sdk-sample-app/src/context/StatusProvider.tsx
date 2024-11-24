import React, {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import { PassportError } from '@imtbl/passport';

const MessageContext = createContext<{
  messages: string[],
  addMessage:(operation: string, ...messages: any[]) => void,
  clearMessages: () => void,
  isLoading: boolean,
  setIsLoading: (isLoading: boolean) => void,
}>({
      messages: [],
      isLoading: false,
      addMessage: () => null,
      clearMessages: () => null,
      setIsLoading: () => null,
    });

export function StatusProvider({
  children,
}: { children: JSX.Element | JSX.Element[] }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((operation: string, ...args: any[]) => {
    let messageString: string;
    if (!args?.length) {
      messageString = operation;
    } else if (args[0] instanceof PassportError) {
      messageString = `${operation}: ${args[0].type} - ${args[0].message}`;
    } else {
      messageString = `${operation}: ${args.map((arg) => {
        if (arg instanceof Error) {
          return arg.toString();
        }
        return JSON.stringify(arg, null, 2);
      }).join(' - ')}`;
    }
    setMessages((prevMessages) => [...prevMessages, messageString]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const providerValues = useMemo(() => ({
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading,
  }), [messages, addMessage, clearMessages, isLoading, setIsLoading]);

  return (
    <MessageContext.Provider value={providerValues}>
      {children}
    </MessageContext.Provider>
  );
}

export function useStatusProvider() {
  const {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading,
  } = useContext(MessageContext);
  return {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading,
  };
}
