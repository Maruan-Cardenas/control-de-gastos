'use client';

import React from 'react';
import { 
  ShoppingCart, 
  Home, 
  HeartHandshake, 
  UtensilsCrossed, 
  Car, 
  Stethoscope, 
  Sparkles, 
  Dumbbell, 
  Tv, 
  Gamepad2, 
  Cpu, 
  Gift, 
  Ticket, 
  Plane, 
  Wrench, 
  Receipt, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  switch (name) {
    case 'ShoppingCart':
      return <ShoppingCart className={className} size={size} />;
    case 'Home':
      return <Home className={className} size={size} />;
    case 'HeartHandshake':
      return <HeartHandshake className={className} size={size} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed className={className} size={size} />;
    case 'Car':
      return <Car className={className} size={size} />;
    case 'Stethoscope':
      return <Stethoscope className={className} size={size} />;
    case 'Sparkles':
      return <Sparkles className={className} size={size} />;
    case 'Dumbbell':
      return <Dumbbell className={className} size={size} />;
    case 'Tv':
      return <Tv className={className} size={size} />;
    case 'Gamepad2':
      return <Gamepad2 className={className} size={size} />;
    case 'Cpu':
      return <Cpu className={className} size={size} />;
    case 'Gift':
      return <Gift className={className} size={size} />;
    case 'Ticket':
      return <Ticket className={className} size={size} />;
    case 'Plane':
      return <Plane className={className} size={size} />;
    case 'Wrench':
      return <Wrench className={className} size={size} />;
    case 'Receipt':
      return <Receipt className={className} size={size} />;
    case 'AlertTriangle':
      return <AlertTriangle className={className} size={size} />;
    default:
      return <HelpCircle className={className} size={size} />;
  }
};
