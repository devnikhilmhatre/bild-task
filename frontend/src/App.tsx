// src/App.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router';
import { ConfigProvider } from 'antd';
const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider>
      <AppRouter />
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
