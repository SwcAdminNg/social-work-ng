/**
 * Photographs used on the public site. All are real photographs published
 * under the Unsplash licence; the people shown are not service users or
 * learners of Social Work Consultancy Ltd. `place` is only set where the
 * photographer stated it.
 */
export type Photo = {
  src: string;
  alt: string;
  by: string;
  /** Unsplash photo id, for the credit link. */
  ref: string;
  place?: string;
  width: number;
  height: number;
};

const p = (
  file: string,
  width: number,
  height: number,
  by: string,
  ref: string,
  alt: string,
  place?: string,
): Photo => ({ src: `/images/ng/${file}.webp`, width, height, by, ref, alt, place });

export const photos = {
  portraitJoy: p("portrait-joy", 2000, 1333, "Kona Studios", "fUfhxViXi9s",
    "A young woman with natural hair laughs, looking off to one side, outdoors."),
  practitioner: p("practitioner", 2000, 1333, "Blessing Olarewaju", "78akGVck7EY",
    "A young woman with braided hair stands with her arms folded, smiling, on the walkway of a public building."),
  readingTea: p("reading-tea", 2000, 1600, "Ayodeji Alabi", "4q1gW_VEfgA",
    "A woman in glasses and a striped kaftan reads a newspaper over a cup of tea."),
  atWork: p("at-work-laptop", 1500, 2000, "Francis Odeyemi", "Xq-RY9z8VY4",
    "A woman in a headscarf and glasses sits at a table with a tablet, smiling."),
  teamMeeting: p("team-meeting", 2000, 1333, "Ninthgrid", "d6-bg-lCvZY",
    "Colleagues sit around a meeting table while one of them speaks."),
  learningTogether: p("learning-together", 2000, 1333, "Ninthgrid", "zbpxU4BMigs",
    "Two colleagues look at a laptop together."),
  manWorkspace: p("man-workspace", 2000, 1500, "Francis Odeyemi", "AN-KeZQcGTE",
    "A man smiles up from his laptop at a café table."),
  embraceLagos: p("embrace-lagos", 1333, 2000, "Ben Iwara", "mtxAknmiGBg",
    "Two women in bright traditional dress laugh and embrace on a street.", "Lagos"),
  manLaugh: p("man-laugh", 1377, 2000, "Abraham George", "0Ftgn7-a4dc",
    "A young man laughs, holding his phone to his chest."),
  durbarSmile: p("durbar-smile", 2000, 1333, "Samuel Adeleke", "Q3oCYTlBU60",
    "A man in a blue babban riga and embroidered cap smiles in a green doorway.", "Zaria, Kaduna"),
  herder: p("herder", 2000, 1333, "Fatima Yusuf", "p993yxPpTks",
    "A woman herder in a maroon hijab stands smiling among white cattle, staff in hand."),
  elderSeated: p("elder-seated", 1257, 2000, "John Onaeko", "FCw0x_0Lh5M",
    "An older man sits on a wall with his hands clasped, a town behind him."),
  marketSmile: p("market-smile", 1333, 2000, "Muhammad-Taha Ibrahim", "7CWzZ_3Z04s",
    "A woman in a red headscarf smiles behind bunches of bananas at a market stall.", "Abuja"),
  bodijaMarket: p("bodija-market", 1601, 2000, "Tunde Buremo", "cnVn4Gg4b00",
    "A trader arranges tomatoes and peppers under umbrellas at an open-air market.", "Bodija Market, Ibadan"),
  lagosMarina: p("lagos-marina", 1125, 2000, "Namnso Ukpanah", "vvQW-3yfuos",
    "Yellow buses and market stalls fill a street below a tower block.", "Lagos Marina"),
  lagosTowers: p("lagos-towers", 1333, 2000, "Fahd Aminu", "i4No07Qvhl4",
    "Tower blocks rise over crowded streets beside the lagoon.", "Lagos"),
  rooftopsSunset: p("rooftops-sunset", 2000, 1500, "Namnso Ukpanah", "6UqJTfoXIq8",
    "The sun sets in an orange sky over the rooftops of a town."),
  villageHill: p("village-hill", 2000, 1333, "Ovinuchi Ejiohuo", "q4U9Pyfz-vQ",
    "Colourful rooftops spread across a plain towards distant hills."),
  redRoad: p("red-road", 2000, 1500, "Joshua Oluwagbemiga", "if1IPTI_iYc",
    "A motorcycle travels a wide red-earth road into town under heavy clouds."),
  clayHouse: p("clay-house", 1500, 2000, "Tope A. Asokere", "AjZemCyw_0g",
    "A red earth house with a tin roof stands in a swept yard.", "Abeokuta, Ogun"),
  openHands: p("open-hands", 2000, 1500, "HisArt Photos", "beoXJAaoAiA",
    "Two open hands held palms up as water runs over them."),
  edoAerial: p("edo-aerial", 2000, 1123, "Paul Edesemi", "niElH29LKjw",
    "A road runs through forest to a riverside community, seen from the air.", "Inikorogha, Edo"),
  zariaSerene: p("zaria-serene", 1333, 2000, "Muhammad-Taha Ibrahim", "DWcGIvmI30Y",
    "A young woman in a pink headscarf rests against a tree with her eyes closed, smiling.", "Zaria, Kaduna"),
  youngMan: p("young-man", 1333, 2000, "Adeboro Odunlami", "ZfanC6Eg9nE",
    "A young man in a white kaftan stands in a village market."),
  watermelon: p("watermelon", 1334, 2000, "Tunde Buremo", "jsRtk72ZgKQ",
    "A trader in bright green arranges cut watermelon on a wheelbarrow in a town square."),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

export const photoCreditUrl = (photo: Photo) => `https://unsplash.com/photos/${photo.ref}`;
