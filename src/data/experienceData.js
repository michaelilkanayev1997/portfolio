import html from "../assets/html.webp";
import css from "../assets/css.webp";
import javascript from "../assets/javascript.webp";
import typescript from "../assets/typescript.webp";
import react from "../assets/react.webp";
import reactnative from "../assets/react_native.webp";
import angular from "../assets/angular.webp";
import github from "../assets/github.webp";
import tailwind from "../assets/tailwind.webp";
import mongodb from "../assets/mongodb.webp";
import node from "../assets/node.webp";
import python from "../assets/python.webp";
// TODO: Add the following images to the src/assets folder
import dotnet from "../assets/dotnet.webp";
import postgres from "../assets/postgres.webp";
import mysql from "../assets/mysql.webp";
import jira from "../assets/jira.webp";

const skills = {
  Frontend: [
    { id: 1, src: react, title: "React", style: "shadow-cyan-500", level: "95%" },
    {
      id: 2,
      src: reactnative,
      title: "React Native",
      style: "shadow-indigo-500",
      level: "90%",
    },
    { id: 3, src: javascript, title: "JavaScript", style: "shadow-yellow-500", level: "90%" },
    { id: 4, src: typescript, title: "TypeScript", style: "shadow-blue-500", level: "85%" },
    { id: 8, src: angular, title: "Angular", style: "shadow-pink-400", level: "70%" },
    { id: 9, src: tailwind, title: "Tailwind", style: "shadow-sky-800", level: "90%" },
    { id: 10, src: html, title: "HTML", style: "shadow-orange-500", level: "95%" },
    { id: 11, src: css, title: "CSS", style: "shadow-blue-500", level: "90%" },
  ],
  Backend: [
    { id: 5, src: node, title: "Node.js", style: "shadow-green-500", level: "80%" },
    {
      id: 7,
      src: python,
      title: "Python",
      style: "half-blue-half-yellow-shadow",
      level: "75%",
    },
    { id: 13, src: dotnet, title: ".NET", style: "shadow-purple-500", level: "80%" },
  ],
  Databases: [
    { id: 6, src: mongodb, title: "MongoDB", style: "shadow-green-700", level: "80%" },
    { id: 14, src: postgres, title: "PostgreSQL", style: "shadow-blue-700", level: "80%" },
    { id: 15, src: mysql, title: "MySQL", style: "shadow-orange-700", level: "80%" },
  ],
  Tools: [
    { id: 12, src: github, title: "GitHub", style: "shadow-gray-400", level: "90%" },
    { id: 16, src: jira, title: "Jira", style: "shadow-blue-400", level: "85%" },
  ],
};

export default skills;
