import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';

interface UseEmailJSReturn {
  form: React.RefObject<HTMLFormElement>;
  isSending: boolean;
  sendEmail: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const useEmailJS = (): UseEmailJSReturn => {
  const form = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);

  const successEmail = () => {
    toast.success("Email sent successfully!", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const errorEmail = () => {
    toast.error("Failed to send email. Please try again.", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);

    if (form.current) {
      emailjs
        .sendForm(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          form.current,
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        )
        .then(
          (result) => {
            setIsSending(false);
            successEmail();
            (e.target as HTMLFormElement).reset();
          },
          (error) => {
            setIsSending(false);
            errorEmail();
            console.error('EmailJS Error:', error.text);
          }
        );
    }
  };

  return {
    form,
    isSending,
    sendEmail,
  };
};