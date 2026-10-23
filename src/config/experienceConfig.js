// src/config/experienceConfig.js
// One place that describes the three "Local Experiences". The public page,
// the admin panel and the home-page cards all read from here, so adding a
// fourth experience later means adding one entry.

import GuidedWalksImg from "../assets/Guided-Walks.jpg";
import KokaniFoodImg from "../assets/Kokani-Food.jpg";
import CommunityInteractionImg from "../assets/Community-interaction.jpg";

export const EXPERIENCES = {
  "guided-walks": {
    slug: "guided-walks",
    route: "/experiences/guided-walks",
    title: "Guided Walks",
    noun: "walk",
    nounPlural: "walks",
    cardBlurb: "Local guides lead you through forts, markets and coastal trails.",
    tagline: "Walk the fort, the market and the coast with someone who grew up here.",
    intro:
      "Every walk is led by a local guide who knows which lane has the best view, which stall opens early and which stretch of beach is best left to the fishermen. Pick a route, check the timings and turn up.",
    cover: GuidedWalksImg,
    labels: {
      location: "Starting point",
      duration: "Duration",
      price: "Price per person",
      season: "Best time",
    },
  },
  "konkani-food": {
    slug: "konkani-food",
    route: "/experiences/konkani-food",
    title: "Konkani Food",
    noun: "dish",
    nounPlural: "dishes",
    cardBlurb: "Taste solkadhi, fish curry-rice and other Malvani classics.",
    tagline: "Solkadhi, fish thali, modak and the stories behind them.",
    intro:
      "Konkan cooking runs on coconut, kokum and the day's catch. These are the dishes worth planning a meal around, and the kitchens, homestays and eateries where locals say they are made properly.",
    cover: KokaniFoodImg,
    labels: {
      location: "Where to try it",
      duration: "Meal",
      price: "Typical price",
      season: "Season",
    },
  },
  "community-interaction": {
    slug: "community-interaction",
    route: "/experiences/community-interaction",
    title: "Community Interaction",
    noun: "activity",
    nounPlural: "activities",
    cardBlurb: "Meet fisherfolk, farmers and artisans in their own villages.",
    tagline: "Spend a morning with the people who keep the Konkan running.",
    intro:
      "Haul in a net with fisherfolk, walk a mango orchard with the family that planted it, or watch an artisan at work. These visits are arranged with the villages, and what you pay stays there.",
    cover: CommunityInteractionImg,
    labels: {
      location: "Village",
      duration: "Time needed",
      price: "Contribution",
      season: "Best time",
    },
  },
};

export const EXPERIENCE_LIST = Object.values(EXPERIENCES);
