import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, ArrowLeft } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen bg-background text-foreground flex items-center justify-center aura">
    <div className="text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Brain className="w-10 h-10 text-primary" />
      </div>
      <p className="text-7xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">404</p>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard">
        <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-white border-0">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </Link>
    </div>
  </div>
);

export default NotFound;
