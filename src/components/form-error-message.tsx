type Props = {
  message: string;
};

const FormErrorMessage = ({ message }: Props) => {
  return <p className="text-red-500 text-sm mb-2">{message}</p>;
};

export default FormErrorMessage;
