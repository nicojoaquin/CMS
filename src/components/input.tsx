import { InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
};

const Input = ({ name, label, ...props }: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block font-medium text-[#5D4037] mb-1">
        {label}
      </label>
      <input
        {...register(name)}
        {...props}
        id={name}
        className="w-full p-2 border border-[#D7CCC8] rounded-md shadow-sm text-[#3E2723] font-medium focus:ring-[#8D6E63] focus:border-[#8D6E63] focus:outline-none transition-colors"
      />
      {errors[name] && (
        <p className="text-[#C62828] text-sm mt-1 font-medium">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

export default Input;
