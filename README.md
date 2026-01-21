# Atlas
Atlas is a voice-assisted grocery helper that listens to a list of items and opens matching product pages.

This repo contains:
- A small Node/Express server (`script.mjs`) that serves the UI and handles `/receive`.
- A static front end in `public/` that uses the Web Speech API to capture items.
- A MongoDB Atlas search query for product lookups.

## Inspiration
Atlas was inspired by the desire to revolutionize the grocery shopping experience. We aimed to create a platform that not only simplifies the often tedious process of grocery shopping but also makes it accessible to individuals with disabilities. Our inspiration came from the need for a more convenient and inclusive way to order groceries.

## What it does
Atlas is a groundbreaking platform that automates and optimizes the grocery shopping experience. It utilizes AI-driven product analysis to provide personalized shopping recommendations, saving users time and money. Additionally, Atlas ensures accessibility for individuals with disabilities, making it easy for everyone to enjoy a seamless shopping experience.

## How we built it
We built Atlas using a combination of cutting-edge technologies, including AI-powered Speech Detection, Data Analysis, Massive Databases and an interactive and user-friendly UI. We also integrated accessibility features to ensure inclusivity for users with disabilities.

## Challenges we ran into
The challenges we faced were integrating accessibility features, and ensuring the platform catered to all users, particularly those with disabilities. Linking the front end and backend seamlessly demanded meticulous planning and robust architecture. Another hurdle was accessing the database through JavaScript while upholding security standards. 

## Accomplishments that we're proud of
We take pride in creating a platform that not only streamlines grocery shopping but also promotes inclusivity. Atlas's ability to provide personalized recommendations and simplify a traditionally cumbersome process is a significant achievement. We're also proud of the positive feedback from users who have found value in our platform.


## What we learned
Throughout the development of Atlas, we gained valuable insights into the importance of accessibility and personalization in modern technology. We learned how AI can be harnessed to enhance user experiences and simplify complex tasks. This project reinforced our belief in the power of innovation to transform everyday activities.

## What's next for Atlas
The future of Atlas is bright. We plan to expand our platform's offerings, including integration with more grocery retailers and the introduction of additional features to enhance the user experience. We'll continue to refine our AI algorithms and accessibility features to make Atlas even more user-friendly and inclusive. Our goal is to revolutionize grocery shopping for everyone.

## Requirements
- Node.js 18+
- A MongoDB Atlas cluster with the expected `nodupecatalog` search index

## Setup
1) Install dependencies:
```bash
npm install
```
2) Create a `.env` file based on `.env.example` and set `MONGODB_URI`.

## Run
```bash
npm start
```
Then open `http://localhost:3000` in Chrome (Web Speech API is Chrome-only in most environments).

## Data setup
Atlas expects your MongoDB database to include:
- A collection named `vic_catalog_nodupe`.
- An Atlas Search index named `nodupecatalog` on that collection (wildcard text search).

## Notes
- The server expects the UI to be served from the same origin; `public/voicerec.js` posts to `/receive`.
- `manifest.json` is included for a Chrome extension popup, but the current UI lives in `public/`. If you want to load this as an extension, either move `public/index.html` to the extension root or update the manifest to point at the correct path.
