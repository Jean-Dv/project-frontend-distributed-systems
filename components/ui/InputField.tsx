import { InputHTMLAttributes, ReactNode } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: string;
    headerRight?: ReactNode;
    rightElement?: ReactNode;
}

export default function InputField({
    id,
    label,
    icon,
    headerRight,
    rightElement,
    ...inputProps
}: InputFieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center ml-1">
                <label
                    htmlFor={id}
                    className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                >
                    {label}
                </label>
                {headerRight}
            </div>
            <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg group-focus-within:text-primary transition-colors">
                    {icon}
                </span>
                <input
                    id={id}
                    name={id}
                    className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-sm outline outline-outline-variant/20"
                    {...inputProps}
                />
                {rightElement && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
        </div>
    );
}