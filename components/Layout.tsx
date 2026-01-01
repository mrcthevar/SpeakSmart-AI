import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-10 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;