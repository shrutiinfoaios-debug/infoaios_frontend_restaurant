import { useState, useEffect } from 'react';

export const Footer = () => {
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      const userDetails = JSON.parse(storedUserDetails);
      setRestaurantName(userDetails.restaurantName || '');
    }
  }, []);

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm py-6 px-6 mt-auto">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p className="font-medium">© 2025 InfoAiOs PVT LTD. All rights reserved.</p>

      </div>
    </footer>
  );
};
