import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

export const links = [
  {
    id: 1,
    child: (
      <>
        LinkedIn <FaLinkedin size={30} />
      </>
    ),
    href: "https://www.linkedin.com/in/michael-ilkanayev/",
    style: "rounded-tr-md",
  },
  {
    id: 2,
    child: (
      <>
        GitHub <FaGithub size={30} />
      </>
    ),
    href: "https://github.com/michaelilkanayev1997",
  },
  {
    id: 3,
    child: (
      <>
        Mail <HiOutlineMail size={30} />
      </>
    ),
    href: "mailto:michaelilkanayev@gmail.com",
  },
  {
    id: 4,
    child: (
      <>
        YouTube <FaYoutube size={30} />
      </>
    ),
    href: "https://www.youtube.com/@michaelilkanayev9593",
    style: "rounded-br-md",
  },
];
