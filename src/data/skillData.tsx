import angular from "../../public/techicons/angular.png";
import bootstrap from "../../public/techicons/bootstrap.png";
import css from "../../public/techicons/css.png";
import firebase from "../../public/techicons/firebase.png";
import github from "../../public/techicons/github.png";
import html from "../../public/techicons/html.png";
import javascript from "../../public/techicons/javascript.png";
import materialui from "../../public/techicons/materialui.png";
import mongo from "../../public/techicons/mongo.png";
import nextjs from "../../public/techicons/nextjs.png";
import node from "../../public/techicons/node.png";
import postgresSQL from "../../public/techicons/postgresSQL.png";
import react from "../../public/techicons/react.png";
import reactnative from "../../public/techicons/reactnative.png";
import sass from "../../public/techicons/sass.png";
import solidity from "../../public/techicons/solidity.png";
import tailwind from "../../public/techicons/tailwind.png";
import ts from "../../public/techicons/ts.png";
import shadcn from "../../public/techicons/shadcn.png";
import ror from "../../public/techicons/ror.png";
import php from "../../public/techicons/php.png";
import wp from "../../public/techicons/wordpress.png";
import supabase from "../../public/techicons/supabase.png";
import nginx from "../../public/techicons/nginx.png";
import openai from "../../public/techicons/openai.png";
import stripe from "../../public/techicons/stripe.png";
import xendit from "../../public/techicons/xendit.png";
import express from "../../public/techicons/express.png";
import symfony from "../../public/techicons/symfony.png";
import aws from "../../public/techicons/aws.png";
import docker from "../../public/techicons/docker.png";
import vercel from "../../public/techicons/vercel.png";
import solana from "../../public/techicons/solana.png";
import eth from "../../public/techicons/eth.png";
import matic from "../../public/techicons/matic.png";

// Define skill interface with category
interface SkillType {
  image: any;
  title: string;
  link: string;
  category: string;
}

export const skillsData: SkillType[] = [
  // Frontend Technologies
  {
    image: html,
    title: "HTML",
    link: "https://developer.mozilla.org/en-US/docs/Glossary/HTML5",
    category: "frontend",
  },
  {
    image: css,
    title: "CSS",
    link: "https://www.w3.org/TR/CSS/#css",
    category: "frontend",
  },
  {
    image: javascript,
    title: "JavaScript",
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    category: "frontend",
  },
  {
    image: ts,
    title: "TypeScript",
    link: "https://www.typescriptlang.org/",
    category: "frontend",
  },
  {
    image: react,
    title: "React",
    link: "https://reactjs.org/",
    category: "frontend",
  },
  {
    image: nextjs,
    title: "Next.js",
    link: "https://nextjs.org/",
    category: "frontend",
  },
  {
    image: angular,
    title: "Angular",
    link: "https://angular.io/",
    category: "frontend",
  },
  {
    image: tailwind,
    title: "Tailwind",
    link: "https://tailwindcss.com/",
    category: "frontend",
  },
  {
    image: bootstrap,
    title: "Bootstrap",
    link: "https://getbootstrap.com/",
    category: "frontend",
  },
  {
    image: sass,
    title: "Sass",
    link: "https://sass-lang.com/",
    category: "frontend",
  },
  {
    image: materialui,
    title: "Material UI",
    link: "https://mui.com/",
    category: "frontend",
  },
  {
    image: shadcn,
    title: "ShadCN",
    link: "https://ui.shadcn.com/",
    category: "frontend",
  },

  // Backend Technologies
  {
    image: node,
    title: "Node",
    link: "https://nodejs.org/en/",
    category: "backend",
  },
  {
    image: express,
    title: "Express",
    link: "https://expressjs.com/",
    category: "backend",
  },
  {
    image: php,
    title: "PHP",
    link: "https://www.php.net/",
    category: "backend",
  },
  {
    image: ror,
    title: "Ruby on Rails",
    link: "https://rubyonrails.org/",
    category: "backend",
  },
  {
    image: symfony,
    title: "Symfony",
    link: "https://symfony.com/",
    category: "backend",
  },
  {
    image: wp,
    title: "WordPress",
    link: "https://wordpress.org/",
    category: "backend",
  },
  {
    image: nginx,
    title: "Nginx",
    link: "https://www.nginx.com/",
    category: "backend",
  },

  // Mobile Technologies
  {
    image: reactnative,
    title: "React Native",
    link: "https://reactnative.dev/",
    category: "mobile",
  },

  // Database Technologies
  {
    image: mongo,
    title: "MongoDB",
    link: "https://www.mongodb.com/",
    category: "database",
  },
  {
    image: postgresSQL,
    title: "PostgreSQL",
    link: "https://www.postgresql.org/",
    category: "database",
  },
  {
    image: supabase,
    title: "Supabase",
    link: "https://supabase.com/",
    category: "database",
  },
  {
    image: firebase,
    title: "Firebase",
    link: "https://firebase.google.com/",
    category: "database",
  },

  // Blockchain & Web3
  {
    image: solidity,
    title: "Solidity",
    link: "https://docs.soliditylang.org/en/v0.8.17/",
    category: "blockchain",
  },
  {
    image: eth,
    title: "Ethereum",
    link: "https://ethereum.org/",
    category: "blockchain",
  },
  {
    image: solana,
    title: "Solana",
    link: "https://solana.com/",
    category: "blockchain",
  },
  {
    image: matic,
    title: "Polygon",
    link: "https://polygon.technology/",
    category: "blockchain",
  },

  // DevOps & Cloud
  {
    image: github,
    title: "GitHub",
    link: "https://github.com/",
    category: "devops",
  },
  {
    image: aws,
    title: "AWS",
    link: "https://aws.amazon.com/",
    category: "devops",
  },
  {
    image: docker,
    title: "Docker",
    link: "https://www.docker.com/",
    category: "devops",
  },
  {
    image: vercel,
    title: "Vercel",
    link: "https://vercel.com/",
    category: "devops",
  },

  // API & Services
  {
    image: openai,
    title: "OpenAI",
    link: "https://openai.com/",
    category: "services",
  },
  {
    image: stripe,
    title: "Stripe",
    link: "https://stripe.com/",
    category: "services",
  },
  {
    image: xendit,
    title: "Xendit",
    link: "https://www.xendit.co/en/",
    category: "services",
  },
];

// Categories for tabs
export const skillCategories = [
  { id: "all", name: "All" },
  { id: "frontend", name: "Frontend" },
  { id: "backend", name: "Backend" },
  { id: "mobile", name: "Mobile" },
  { id: "database", name: "Database" },
  { id: "blockchain", name: "Blockchain" },
  { id: "devops", name: "DevOps" },
  { id: "services", name: "Services" },
];
