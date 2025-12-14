import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UtensilsCrossed, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setEmailSent(true);
    toast({
      title: 'Email Sent',
      description: 'Check your inbox for password reset instructions',
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="premium-card p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-90 group-hover:opacity-100 transition-all duration-300 shadow-glow"></div>
              <UtensilsCrossed className="w-10 h-10 text-primary-foreground relative z-10" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h1>
            <p className="text-muted-foreground text-sm text-center">
              {emailSent
                ? 'Check your email for reset instructions'
                : 'Enter your email to receive reset instructions'}
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl border-border/50 focus:border-primary transition-all duration-300"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl font-semibold shadow-primary hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-primary hover:text-primary-glow inline-flex items-center transition-colors duration-300 font-medium"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-scale-in">
              <div className="bg-success/10 border border-success/30 rounded-xl p-5 backdrop-blur-sm">
                <p className="text-sm text-foreground leading-relaxed">
                  We've sent password reset instructions to <strong className="text-success">{email}</strong>.
                  Please check your inbox and follow the link to reset your password.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 rounded-xl font-medium hover:bg-muted/50 transition-all duration-300"
                onClick={() => setEmailSent(false)}
              >
                Resend Email
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-primary hover:text-primary-glow inline-flex items-center transition-colors duration-300 font-medium"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
