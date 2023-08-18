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

import scemoviesocial1 from "./assets/portfolio/SceMovieSocial/secmoviesocial1.png";
import scemoviesocial2 from "./assets/portfolio/SceMovieSocial/secmoviesocial2.png";
import scemoviesocial3 from "./assets/portfolio/SceMovieSocial/secmoviesocial3.png";
import scemoviesocial4 from "./assets/portfolio/SceMovieSocial/secmoviesocial4.png";
import scemoviesocial5 from "./assets/portfolio/SceMovieSocial/secmoviesocial5.png";
import scemoviesocial6 from "./assets/portfolio/SceMovieSocial/secmoviesocial6.png";
import lowerscemoviesocial1 from "./assets/portfolio/SceMovieSocial/lowerscemoviesocial1.png";
import lowerscemoviesocial2 from "./assets/portfolio/SceMovieSocial/lowerscemoviesocial2.png";
import lowerscemoviesocial3 from "./assets/portfolio/SceMovieSocial/lowerscemoviesocial3.png";
import lowerscemoviesocial4 from "./assets/portfolio/SceMovieSocial/lowerscemoviesocial4.png";
import lowerscemoviesocial5 from "./assets/portfolio/SceMovieSocial/lowerscemoviesocial5.png";
import lowerscemoviesocial6 from "./assets/portfolio/SceMovieSocial/lowerscemoviesocial6.png";

import crwnclothing from "./assets/portfolio/CrwnClothing.png";
import travelagency from "./assets/portfolio/TravelAgency.png";
import gatsbyblog from "./assets/portfolio/Gatsbyblog.png";
import passwordmanager from "./assets/portfolio/PasswordManager.png";

const portfolios = [
  {
    id: 1,
    src: lowerscemoviesocial1,
    title: "SCE-MOVIE-SOCIAL",
    techs: ["React", "Context", "styled", "Firebase", "TMDB's api", "Jira"],
    details: {
      introduction:
        "SCE-MOVIE-SOCIAL is a web application that allows students of SCE - Shamoon College of Engineering to discover and interact with movies and TV series. It is built using React and utilizes the TMDB API for fetching movie and series data. The Firebase platform is used as the backend and database solution.",
      pictures: [
        { lower: lowerscemoviesocial1, big: scemoviesocial1 },
        { lower: lowerscemoviesocial2, big: scemoviesocial2 },
        { lower: lowerscemoviesocial3, big: scemoviesocial3 },
        { lower: lowerscemoviesocial4, big: scemoviesocial4 },
        { lower: lowerscemoviesocial5, big: scemoviesocial5 },
        { lower: lowerscemoviesocial6, big: scemoviesocial6 },
      ],
      thirdTitle: "Features",
      thirdText:
        "The app provides features such as User authentication and profile management, Search for movies and TV series, Viewing detailed information about movies/series,Create and manage a watchlist, Rate and review movies/series and more. It aims to provide a social platform for movie enthusiasts among the students of SCE to share their thoughts and discover new content.",
      videos: [
        "https://www.youtube.com/embed/87ueDmQ7244",
        "https://www.youtube.com/embed/ZB8rvraHG8w",
        "https://www.youtube.com/embed/roXx_AiKKOY",
        "https://www.youtube.com/embed/wTMvYOh-ppY",
      ],
      demo: "https://sce-movie-social.netlify.app/",
      git: "https://github.com/michaelilkanayev1997/SCE-MOVIE-SOCIAL",
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
        "This is a third person Desktop game that was made in UNREAL ENGINE 5 as a personal project by me. Most of the programming was made with C++ in VISUAL STUDIO and all the rest in a combination of BLUEPRINTS with C++. 'Game of Death' takes inspiration from Bruce lee's 'GAME OF DEATH' movie in 1978. The players's main purpose is to go through three stages (floors) of bosses and challenges,where each stage is more difficult that the previous one.",
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
      videos: [
        "https://www.youtube.com/embed/PMsAm4yWlOA",
        "https://www.youtube.com/embed/I3zeBO-5zX0",
        "https://www.youtube.com/embed/zsyrcr0M_a8",
      ],
      download:
        "https://drive.google.com/file/d/1c6KBDMeUnWDJ3G6rZSkvV6xHV5xjscsN/view",
      git: "https://github.com/michaelilkanayev1997/Game-Of-Death",
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
