export default function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-wheat text-charcoal font-sans selection:bg-teal selection:text-white">
      {/* Subtle organic pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(circle_at_2px_2px,rgba(0,128,128,0.15)_1px,transparent_0)] bg-[size:32px_32px]"></div>
      
      {/* Gentle vignette for focus */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(229,213,192,0.3)_100%)]"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
