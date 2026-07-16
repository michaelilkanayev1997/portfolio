import {
  useRef,
  useState,
  useCallback,
  memo,
  type FormEvent,
  type ChangeEvent,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useDeferredGsap } from "../hooks/useDeferredGsap";
import { getRevealMotion } from "../utils/motion";

gsap.registerPlugin(ScrollTrigger);

const showValidationError = async (message: string) => {
  const { toast } = await import("react-toastify");
  toast.error(message, {
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
};

const Contact = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useDeferredGsap(
    sectionRef,
    () => {
      const motion = getRevealMotion();
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: motion.headingStart,
          toggleActions: "play none none reverse",
        },
        defaults: { ease: motion.ease, force3D: true },
      });
      tl.from(".contact-heading", {
        y: motion.distance,
        opacity: 0,
        duration: motion.duration,
      })
        .fromTo(
          ".contact-heading-underline",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: motion.underlineDuration,
            ease: "power2.inOut",
          },
          "-=0.3",
        )
        .from(
          ".contact-sub",
          {
            y: motion.isMobile ? 14 : 20,
            opacity: 0,
            duration: motion.shortDuration,
          },
          "-=0.4",
        )
        .from(
          ".contact-field",
          {
            y: motion.isMobile ? 16 : 24,
            opacity: 0,
            duration: motion.shortDuration,
            stagger: motion.stagger,
          },
          "-=0.2",
        )
        .fromTo(
          ".contact-submit",
          { scale: motion.isMobile ? 0.92 : 0.85, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: motion.shortDuration,
            ease: "back.out(1.45)",
            clearProps: "transform,opacity",
          },
          "-=0.2",
        );
    },
    [],
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  const isValid = name !== "" && email !== "" && message !== "";

  const resetFields = useCallback(() => {
    setName("");
    setEmail("");
    setMessage("");
  }, []);

  const sendEmail = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formElement = form.current;
      if (!formElement) return;

      if (isValid) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email.match(emailPattern)) {
          await showValidationError("Please enter a valid email address");
          return;
        }
        setIsLoading(true);
        let alert: typeof import("sweetalert2").default | undefined;
        try {
          const [{ default: emailjs }, { default: Swal }] = await Promise.all([
            import("@emailjs/browser"),
            import("sweetalert2"),
          ]);
          alert = Swal;
          await emailjs.sendForm(
            import.meta.env.VITE_SERVICE,
            import.meta.env.VITE_TEMPLATE,
            formElement,
            import.meta.env.VITE_KEY,
          );
        } catch (error) {
          setIsLoading(false);
          const Swal = alert ?? (await import("sweetalert2")).default;
          await Swal.fire({
            title: "Error in Email sending",
            text: (error as { text?: string }).text ?? "Unable to send message",
            icon: "error",
            showCloseButton: true,
            showCancelButton: false,
            confirmButtonColor: "#f44336",
            confirmButtonText: "OK",
          });
          return;
        }

        resetFields();
        formElement.reset();
        setIsLoading(false);
        await alert!.fire({
          title: "Your message have been sent !",
          text: "Thanks!",
          icon: "success",
          showCloseButton: true,
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
      } else {
        await showValidationError("Please enter all fields");
      }
    },
    [email, isValid, resetFields],
  );

  return (
    <div
      ref={sectionRef}
      className="w-full bg-gradient-to-b from-black to-gray-800 p-4 text-white pt-40 sm:pt-20 md:pb-0 select-none"
    >
      <div className="flex flex-col p-4 justify-center max-w-screen-lg mx-auto">
        <div className="pb-8">
          <span className="relative inline-block contact-heading">
            <p className="text-4xl 2xl:text-5xl font-bold inline z-10">
              Contact
            </p>
            <span
              aria-hidden
              className="contact-heading-underline absolute left-0 -bottom-1 h-1 w-full origin-left bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
          <p className="py-6  z-10 contact-sub">
            Submit the form below to get in touch with me
          </p>
        </div>

        <div id="contact" className="flex justify-center items-center">
          <form
            ref={form}
            onSubmit={sendEmail}
            className="flex flex-col w-full md:w-1/2"
          >
            <input
              type="text"
              name="user_name"
              placeholder="Enter your name"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              className="contact-field p-2 bg-transparent border-2 border-gray-600 focus:border-cyan-400 transition-colors rounded-md text-white focus:outline-none z-10"
            />
            <input
              type="text"
              name="user_email"
              placeholder="Enter your email"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className="contact-field my-4 p-2 bg-transparent border-2 border-gray-600 focus:border-cyan-400 transition-colors rounded-md text-white focus:outline-none z-10"
            />
            <textarea
              name="message"
              placeholder="Enter your message"
              rows={6}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
              className="contact-field 2xl:h-60 p-2 bg-transparent border-2 border-gray-600 focus:border-cyan-400 transition-colors rounded-md text-white focus:outline-none z-10 resize-none overflow-auto scrollbar-dark"
            ></textarea>

            <button
              type="submit"
              value="Send"
              className="contact-submit text-white font-semibold tracking-wide bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500
px-7 py-3 my-8 md:mb-0 2xl:mb-10 mx-auto flex items-center justify-center rounded-full
hover:scale-105 hover:shadow-[0_10px_35px_rgba(56,189,248,0.45)]
active:scale-95 transition-transform duration-300 z-10 relative overflow-hidden"
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

export default memo(Contact);
