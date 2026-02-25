import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiReplit } from "react-icons/si";

export default function AuthPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to ELEGANCE
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Please sign in to continue to your account
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin} 
            className="w-full flex items-center justify-center gap-2 py-6 text-lg"
          >
            <SiReplit className="w-5 h-5" />
            Login with Replit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
