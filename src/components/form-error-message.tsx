type Props = {
  message: string;
};

const FormErrorMessage = ({ message }: Props) => {
  return (
    <div className="bg-[#FFEBEE] text-[#B71C1C] p-3 rounded-md mb-4 font-medium text-sm">
      {message}
    </div>
  );
};

export default FormErrorMessage;
