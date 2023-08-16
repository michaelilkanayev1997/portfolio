import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const form = useRef();

  const isValid = name !== "" && email !== "" && message !== "";

  const RestetFields = () => {
    setName("");
    setEmail("");
    setMessage("");
  };

  const sendEmail = (e) => {
    e.preventDefault();

    if (isValid) {
      // Validate email format using regular expression
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!email.match(emailPattern)) {
        toast.error("Please enter a valid email address", {
          position: "bottom-left",
          autoClose: 3900,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            fontFamily: "Arial",
            fontSize: "15px",
            fontWeight: "bold",
            color: "red",
            borderRadius: "5px",
            padding: "10px",
          },
        });
        return;
      }
      setIsLoading(true); // Start loading
      emailjs
        .sendForm(
          process.env.REACT_APP_SERVICE,
          process.env.REACT_APP_TEMPLATE,
          form.current,
          process.env.REACT_APP_KEY
        )
        .then(
          async (result) => {
            RestetFields();
            e.target.reset();
            setIsLoading(false); // Stop loading
            //Your message have been sent !
            await Swal.fire({
              title: "Your message have been sent !",
              text: "Thanks!",
              icon: "success",
              showCloseButton: true,
              showCancelButton: false,
              confirmButtonColor: "#3085d6",
              confirmButtonText: "OK",
            });
          },
          async (error) => {
            console.log(error.text);
            await Swal.fire({
              title: "Error in Email sending",
              text: error.text,
              icon: "error",
              showCloseButton: true,
              showCancelButton: false,
              confirmButtonColor: "#f44336",
              confirmButtonText: "OK",
            });
          }
        );
    } else {
      toast.error("Please enter all fields", {
        position: "bottom-left",
        autoClose: 3900,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          fontFamily: "Arial",
          fontSize: "15px",
          fontWeight: "bold",
          color: "red",
          borderRadius: "5px",
          padding: "10px",
        },
      });
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-black to-gray-800 p-4 text-white pt-40 sm:pt-20 md:pb-0 2xl:pb-unset">
      <div className="flex flex-col p-4 justify-center max-w-screen-lg mx-auto">
        <div className="pb-8">
          <p className="text-4xl font-bold inline border-b-4 border-gray-500 z-10">
            Contact
          </p>
          <p className="py-6  z-10">
            Submit the form below to get in touch with me
          </p>
        </div>

        <div name="contact" className="flex justify-center items-center">
          <form
            ref={form}
            onSubmit={sendEmail}
            className="flex flex-col w-full md:w-1/2"
          >
            <input
              type="text"
              name="user_name"
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
              className="p-2 bg-transparent border-2 rounded-md text-white focus:outline-none z-10"
            />
            <input
              type="text"
              name="user_email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="my-4 p-2 bg-transparent border-2 rounded-md text-white focus:outline-none z-10"
            />
            <textarea
              name="message"
              placeholder="Enter your message"
              rows="6"
              onChange={(e) => setMessage(e.target.value)}
              className="2xl:h-60 p-2 bg-transparent border-2 rounded-md text-white focus:outline-none z-10 resize-none overflow-auto scrollbar-dark"
            ></textarea>

            <button
              type="submit"
              value="Send"
              className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 
            px-6 py-3 my-8 md:mb-0 2xl:mb-10 mx-auto flex items-center rounded-md hover:scale-110 duration-300 z-10 relative"
            >
              Let's talk
              {isLoading && (
                <div className="absolute inset-0 bg-gray-900 opacity-75 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
