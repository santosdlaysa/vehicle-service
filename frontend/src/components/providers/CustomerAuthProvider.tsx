'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { customerApi, setCustomerToken, clearCustomerToken } from '@/lib/customerApi';
import { Customer } from '@/types';

interface CustomerAuthContextValue {
  customer: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      setLoading(false);
      return;
    }
    customerApi
      .get<{ customer: Customer }>('/customer/auth/me')
      .then((res) => setCustomer(res.customer))
      .catch(() => clearCustomerToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await customerApi.post<{ token: string; customer: Customer }>('/customer/auth/login', {
      email,
      password,
    });
    setCustomerToken(res.token);
    setCustomer(res.customer);
  }

  async function register(data: { name: string; email: string; phone: string; password: string }) {
    const res = await customerApi.post<{ token: string; customer: Customer }>(
      '/customer/auth/register',
      data,
    );
    setCustomerToken(res.token);
    setCustomer(res.customer);
  }

  function logout() {
    clearCustomerToken();
    setCustomer(null);
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
