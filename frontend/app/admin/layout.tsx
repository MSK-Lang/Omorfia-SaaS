import React from 'react';
import AgenticSidebar from '@/components/admin/AgenticSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-wheat flex font-sans selection:bg-teal selection:text-white">
      {/* Premium Sidebar */}
      <AgenticSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <div className="p-8 lg:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}
