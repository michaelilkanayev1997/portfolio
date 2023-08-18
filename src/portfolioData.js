import gameofdeath0 from "./assets/portfolio/GameOfDeath/gameofdeath0.png";
import gameofdeath1 from "./assets/portfolio/GameOfDeath/gameofdeath1.png";
import gameofdeath2 from "./assets/portfolio/GameOfDeath/gameofdeath2.png";
import gameofdeath3 from "./assets/portfolio/GameOfDeath/gameofdeath3.png";
import gameofdeath4 from "./assets/portfolio/GameOfDeath/gameofdeath4.png";
import gameofdeath5 from "./assets/portfolio/GameOfDeath/gameofdeath5.png";
import gameofdeath6 from "./assets/portfolio/GameOfDeath/gameofdeath6.png";
import lowergameofdeath1 from "./assets/portfolio/GameOfDeath/lowergameofdeath1.png";
import lowergameofdeath2 from "./assets/portfolio/GameOfDeath/lowergameofdeath2.png";
import lowergameofdeath3 from "./assets/portfolio/GameOfDeath/lowergameofdeath3.png";
import lowergameofdeath4 from "./assets/portfolio/GameOfDeath/lowergameofdeath4.png";
import lowergameofdeath5 from "./assets/portfolio/GameOfDeath/lowergameofdeath5.png";
import lowergameofdeath6 from "./assets/portfolio/GameOfDeath/lowergameofdeath6.png";

import scemoviesocial from "./assets/portfolio/SceMovieSocial.png";
import crwnclothing from "./assets/portfolio/CrwnClothing.png";
import travelagency from "./assets/portfolio/TravelAgency.png";
import gatsbyblog from "./assets/portfolio/Gatsbyblog.png";
import passwordmanager from "./assets/portfolio/PasswordManager.png";

const portfolios = [
  {
    id: 1,
    src: scemoviesocial,
    title: "SCE-MOVIE-SOCIAL",
    techs: ["React", "Context", "styled", "Firebase", "TMDB's api"],
    details: {
      introduction:
        "'Game of Death' stands not only as a personal project but also as a testament to my journey of self-improvement as a software engineer. This large and immersive third-person game, was built in Unreal Engine 5, with C++ and Blueprint scripting.",
      pictures: [
        { lower: gameofdeath0, big: gameofdeath0 },
        { lower: lowergameofdeath1, big: gameofdeath1 },
        { lower: lowergameofdeath2, big: gameofdeath2 },
        { lower: lowergameofdeath3, big: gameofdeath3 },
        { lower: lowergameofdeath4, big: gameofdeath4 },
        { lower: lowergameofdeath5, big: gameofdeath5 },
        { lower: lowergameofdeath6, big: gameofdeath6 },
      ],
      secondTitle: "Crafting the Experience",
      secondText:
        "Drawing inspiration from Bruce Lee's 'Game of Death', I embarked on crafting an engaging gaming experience. The game features three progressively challenging stages, each presenting unique bosses and obstacles. Through rigorous learning and experimentation, I brought these levels to life, enhancing my problem-solving skills in the process.",
      thirdTitle: "Unique Features",
      thirdText:
        "The project boasts diverse features, including enemies with random pickups, bosses with unique attacks, and character progression through collectibles. I incorporated health, stamina systems, and coin-based upgrades, demonstrating my ability to merge creative storytelling with complex mechanics.",
      fourthTitle: "Conclusion",
      fourthText:
        "'Game of Death' for me is more than a game; it's a narrative of personal evolution. Through traversing the landscapes of C++ programming, software architecture, and creative problem-solving, I've unlocked a newfound proficiency. As the project reaches its conclusion, I'm left with not just a game, but a skill set that empowers me to create innovative solutions and bring imaginative concepts to life in the realm of software development.",
      videos: [
        "https://www.youtube.com/embed/PMsAm4yWlOA",
        "https://www.youtube.com/embed/I3zeBO-5zX0",
        "https://www.youtube.com/embed/zsyrcr0M_a8",
      ],
      download:
        "https://drive.google.com/file/d/1c6KBDMeUnWDJ3G6rZSkvV6xHV5xjscsN/view",
    },
  },
  {
    id: 2,
    src: crwnclothing,
    title: "Crwn-Clothing",
    techs: ["React", "Redux", "GraphQl", "Firebase", "Stripe api"],
    details: [],
  },
  {
    id: 3,
    src: gameofdeath0,
    title: "Game-Of-Death",
    techs: ["Unreal-Engine 5", "C++", "BluePrints"],
    details: {
      introduction:
        "'Game of Death' stands not only as a personal project but also as a testament to my journey of self-improvement as a software engineer. This large and immersive third-person game, was built in Unreal Engine 5, with C++ and Blueprint scripting.",
      pictures: [
        gameofdeath0,
        gameofdeath1,
        gameofdeath2,
        gameofdeath3,
        gameofdeath4,
        gameofdeath5,
      ],
      secondTitle: "Crafting the Experience",
      secondText:
        "Drawing inspiration from Bruce Lee's 'Game of Death', I embarked on crafting an engaging gaming experience. The game features three progressively challenging stages, each presenting unique bosses and obstacles. Through rigorous learning and experimentation, I brought these levels to life, enhancing my problem-solving skills in the process.",
      thirdTitle: "Unique Features",
      thirdText:
        "The project boasts diverse features, including enemies with random pickups, bosses with unique attacks, and character progression through collectibles. I incorporated health, stamina systems, and coin-based upgrades, demonstrating my ability to merge creative storytelling with complex mechanics.",
      fourthTitle: "Conclusion",
      fourthText:
        "'Game of Death' for me is more than a game; it's a narrative of personal evolution. Through traversing the landscapes of C++ programming, software architecture, and creative problem-solving, I've unlocked a newfound proficiency. As the project reaches its conclusion, I'm left with not just a game, but a skill set that empowers me to create innovative solutions and bring imaginative concepts to life in the realm of software development.",
      videos: [
        "https://www.youtube.com/watch?v=PMsAm4yWlOA",
        "https://www.youtube.com/watch?v=I3zeBO-5zX0",
        "https://www.youtube.com/watch?v=zsyrcr0M_a8",
      ],
      download:
        "https://drive.google.com/file/d/1c6KBDMeUnWDJ3G6rZSkvV6xHV5xjscsN/view",
    },
  },
  {
    id: 4,
    src: travelagency,
    title: "Travel-Agency",
    techs: ["React", "styled", "Firebase", "PayPal api"],
    details: [],
  },
  {
    id: 5,
    src: gatsbyblog,
    title: "Gatsby-blog",
    techs: ["Gatsby", "React", "styled", "GraphQl"],
    details: [],
  },
  {
    id: 6,
    src: passwordmanager,
    title: "Password-Manager",
    techs: ["Java", "GUI", "AES encryption", "Excel"],
    details: [],
  },
];

export default portfolios;
