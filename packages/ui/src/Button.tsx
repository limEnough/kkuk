import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  tertiary: 'bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: 'h-14 px-6 text-subtitle rounded-md',
  md: 'h-12 px-5 text-body-1 rounded-md',
  sm: 'h-10 px-4 text-body-2 rounded-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'lg',
      fullWidth,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          font-semibold transition-all active:scale-[0.98]
          disabled:opacity-40 disabled:pointer-events-none
          ${className}
        `}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
