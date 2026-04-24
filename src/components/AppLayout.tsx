import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  headerRight?: ReactNode;
}

export const AppLayout = ({ children, title, headerRight }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {(title || headerRight) && (
          <header className="flex items-center justify-between px-7 h-14 border-b border-border/40 bg-background/70 backdrop-blur-sm sticky top-0 z-20 shrink-0">
            {title && <h1 className="text-base font-bold">{title}</h1>}
            {headerRight && <div className="flex items-center gap-3">{headerRight}</div>}
          </header>
        )}
        <main className="flex-1 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
