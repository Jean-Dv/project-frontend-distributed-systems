import { InputHTMLAttributes, ReactNode } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: string;
    headerRight?: ReactNode;
    rightElement?: ReactNode;
    state?: 'default' | 'error' | 'success';
    helperText?: string;
}

export default function InputField({
    id,
    label,
    icon,
    headerRight,
    rightElement,
    state = 'default',
    helperText,
    ...inputProps
}: InputFieldProps) {
    const baseInputStyles = "w-full pl-12 pr-12 py-3.5 bg-surface-container-low rounded text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm";
    
    const stateStyles = {
        default: "outline outline-1 outline-outline-variant/50",
        error: "outline outline-1 outline-error focus:ring-error text-error",
        success: "outline outline-1 outline-secondary focus:ring-secondary text-secondary"
    };

    const iconColors = {
        default: "text-outline group-focus-within:text-primary",
        error: "text-error",
        success: "text-secondary"
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center ml-1">
                <label
                    htmlFor={id}
                    className={`text-label-caps ${state === 'error' ? 'text-error' : state === 'success' ? 'text-secondary' : 'text-on-surface-variant'}`}
                >
                    {label}
                </label>
                {headerRight}
            </div>
            <div className="relative group">
                <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors ${iconColors[state]}`}>
                    {icon}
                </span>
                <input
                    id={id}
                    name={id}
                    className={`${baseInputStyles} ${stateStyles[state]}`}
                    {...inputProps}
                />
                {rightElement && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
            {helperText && (
                <span className={`text-body-sm ml-1 ${state === 'error' ? 'text-error' : state === 'success' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                    {helperText}
                </span>
            )}
        </div>
    );
}