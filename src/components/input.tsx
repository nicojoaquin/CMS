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
      <label htmlFor={name} className="block font-medium mb-1">
        {label}
      </label>
      <input
        {...register(name)}
        {...props}
        id={name}
        className="w-full p-2 border rounded"
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

export default Input;
