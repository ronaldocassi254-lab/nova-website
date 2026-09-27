/* ==========================================================================
   Viva Nova — catalogue & content
   Edit products, prices, sports and nutrition here. Every page reads from this file.
   ========================================================================== */
window.VN = window.VN || {};

/* ---------- Flavours ----------
   c = brand colour, d = deep shade, tint = light background, t = text on brand colour */
VN.FLAVOURS = [
  {
    id: 'citrus-surge', name: 'Citrus Surge', c: '#C8FF1A', d: '#4F7A00', tint: '#F1FFD1', t: '#0E0E14',
    tagline: 'Sharp. Zesty. Wide awake.',
    notes: 'Zesty lemon and lime with a sharp, clean finish.',
    description: 'Our original flavour and the one that started it all. Citrus Surge hits with squeezed lemon up front and finishes with a clean lime snap. It is bright enough to wake you up on a 6am run and light enough to drink all session.',
    tags: ['Zesty', 'Sharp', 'Refreshing'],
    profile: { Sweetness: 2, Tartness: 5, Intensity: 4 },
    colour: 'safflower and spirulina concentrate',
    sports: ['running', 'cycling'],
  },
  {
    id: 'blue-voltage', name: 'Blue Voltage', c: '#1FB6FF', d: '#0050A8', tint: '#DDF3FF', t: '#0E0E14', badge: 'Bestseller',
    tagline: 'Sweet, tart and fully charged.',
    notes: 'Electric blue raspberry. Sweet, tart and wired.',
    description: 'Blue raspberry turned all the way up. Blue Voltage is sweet on the first sip and tart on the finish, with an icy edge that makes it dangerously easy to drink. Our bestseller for a reason.',
    tags: ['Sweet', 'Tart', 'Icy'],
    profile: { Sweetness: 4, Tartness: 3, Intensity: 5 },
    colour: 'spirulina concentrate',
    sports: ['football', 'court'],
  },
  {
    id: 'tropical-rush', name: 'Tropical Rush', c: '#FF9A1F', d: '#B83A00', tint: '#FFEBD2', t: '#0E0E14',
    tagline: 'A sunset in a can.',
    notes: 'Mango and passionfruit. A sunset in a can.',
    description: 'Ripe mango meets tangy passionfruit. Tropical Rush is smooth, juicy and a little bit exotic. It is the flavour you reach for when the sun is out and the session is long.',
    tags: ['Juicy', 'Smooth', 'Exotic'],
    profile: { Sweetness: 4, Tartness: 2, Intensity: 3 },
    colour: 'carrot concentrate',
    sports: ['football', 'cycling'],
  },
  {
    id: 'berry-blitz', name: 'Berry Blitz', c: '#FF2E88', d: '#990046', tint: '#FFDCEB', t: '#0E0E14',
    tagline: 'Three berries. Full throttle.',
    notes: 'Raspberry, blackberry and strawberry at full throttle.',
    description: 'Raspberry, blackberry and strawberry in one bold hit. Berry Blitz is deep and punchy with a tart bite that cuts through the hardest sets.',
    tags: ['Bold', 'Punchy', 'Berry'],
    profile: { Sweetness: 3, Tartness: 4, Intensity: 5 },
    colour: 'black carrot concentrate',
    sports: ['gym', 'recovery'],
  },
  {
    id: 'watermelon-sprint', name: 'Watermelon Sprint', c: '#FF5468', d: '#A30F26', tint: '#FFE0E3', t: '#0E0E14',
    tagline: 'Juicy up front. Cool on the finish.',
    notes: 'Juicy watermelon with a cool mint kick.',
    description: 'Summer watermelon with a cool hint of mint on the finish. Watermelon Sprint is the most thirst-quenching can in the range, made for hot days and post-session cool-downs.',
    tags: ['Juicy', 'Cooling', 'Light'],
    profile: { Sweetness: 3, Tartness: 1, Intensity: 3 },
    colour: 'beetroot concentrate',
    sports: ['running', 'recovery'],
  },
  {
    id: 'glacier-grape', name: 'Glacier Grape', c: '#8B5CFF', d: '#35139E', tint: '#E9E1FF', t: '#FFFFFF', badge: 'New',
    tagline: 'Dark grape. Ice cold.',
    notes: 'Dark grape served ice-cold. Refreshing to the last drop.',
    description: 'Deep, dark grape with a glacial chill. Glacier Grape is rich without being heavy, and it is the newest member of the line-up.',
    tags: ['Rich', 'Icy', 'Smooth'],
    profile: { Sweetness: 4, Tartness: 2, Intensity: 4 },
    colour: 'purple carrot concentrate',
    sports: ['gym', 'court'],
  },
];

/* ---------- Formats ----------
   Every flavour comes in each format listed in VN.PACKS.flavour. The first format is the default. */
VN.FORMATS = {
  can: { label: 'Can', unit: 'can', units: 'cans', blurb: 'Slim 500ml can', dir: 'cans' },
  bottle: { label: 'Bottle', unit: 'bottle', units: 'bottles', blurb: '500ml sports-cap bottle', dir: 'bottles' },
};

/* ---------- Packs & pricing (GBP), by product type then format ---------- */
VN.PACKS = {
  flavour: {
    can: [
      { size: 1, label: 'Single can', price: 2.29 },
      { size: 4, label: '4-pack', price: 8.49 },
      { size: 12, label: '12-pack', price: 23.99, tag: 'Most popular' },
      { size: 24, label: '24-pack', price: 43.99, tag: 'Best value' },
    ],
    // Placeholder bottle pricing — replace with confirmed prices.
    bottle: [
      { size: 1, label: 'Single bottle', price: 2.49 },
      { size: 6, label: '6-pack', price: 13.99 },
      { size: 12, label: '12-pack', price: 25.99, tag: 'Most popular' },
      { size: 24, label: '24-pack', price: 47.99, tag: 'Best value' },
    ],
  },
  variety: {
    can: [
      { size: 6, label: '6-pack', price: 13.49 },
      { size: 12, label: '12-pack', price: 24.99, tag: 'Most popular' },
      { size: 24, label: '24-pack', price: 45.99, tag: 'Best value' },
    ],
  },
};
VN.SUB_DISCOUNT = 0.15;     // subscribe & save
VN.SUB_MIN_PACK = 12;       // subscriptions available on 12- and 24-packs
VN.FREE_SHIPPING = 30;

VN.VARIETY = {
  id: 'variety', type: 'variety', name: 'The Variety Pack', badge: 'Try them all',
  notes: "Every flavour in one box. Can't pick one? Take them all.",
};

/* ---------- Nutrition (per 500ml can or bottle) — replace with lab-verified values ---------- */
VN.NUTRITION = [
  ['Energy', '105kJ / 25kcal', '21kJ / 5kcal'],
  ['Fat', '0g', '0g'],
  ['Carbohydrate', '6.0g', '1.2g'],
  ['of which sugars', '3.0g', '0.6g'],
  ['Protein', '0g', '0g'],
  ['Salt', '0.90g', '0.18g'],
  ['Potassium', '200mg (10% NRV)', '40mg'],
  ['Magnesium', '60mg (16% NRV)', '12mg'],
  ['Calcium', '40mg (5% NRV)', '8mg'],
  ['Niacin (B3)', '8.0mg (50% NRV)', '1.6mg'],
  ['Vitamin B6', '0.70mg (50% NRV)', '0.14mg'],
  ['Vitamin B12', '1.25µg (50% NRV)', '0.25µg'],
];
VN.ingredients = (f) =>
  `Water, coconut water from concentrate (10%), acid (citric acid), electrolytes (sodium citrate, potassium citrate, magnesium lactate, calcium lactate, sodium chloride), natural ${f.name.toLowerCase()} flavourings, sweetener (steviol glycosides), antioxidant (ascorbic acid), colour (${f.colour}), vitamins (niacin, vitamin B6, vitamin B12).`;

/* ---------- Sports ---------- */
VN.SPORTS = [
  {
    id: 'running', name: 'Running', kicker: 'Road · Trail · Track', c: '#1FB6FF', t: '#0E0E14',
    tagline: 'Every mile, fully fuelled.',
    intro: 'Long runs, hot days and race-day nerves all drain fluid fast. Viva Nova replaces the sodium and potassium you sweat out, so your legs stay in the race right to the line.',
    stats: [
      ['Up to 1.5L', 'Sweat you can lose per hour on a warm long run'],
      ['2%', 'Body-weight fluid loss where performance starts to dip'],
      ['5', 'Electrolytes in every can'],
    ],
    challenges: [
      ['Cramp', 'Sodium losses add up with every kilometre. Topping up before and during long runs helps keep muscles firing.'],
      ['Heat', 'Summer miles can double your sweat rate. Cold electrolytes help you stay comfortable for longer.'],
      ['The late fade', 'Most runners feel it in the final third. Staying hydrated early means more left for the finish.'],
    ],
    plan: [
      ['Before', '30–45 min out', 'One can before any run over an hour or on race morning.'],
      ['During', 'Every 20 min', 'On long runs, sip 150–250ml from a soft flask or a planned stop.'],
      ['After', 'Within 30 min', 'Finish a can, then keep sipping water through the afternoon.'],
    ],
    tips: [
      'Weigh yourself before and after a long run to learn your personal sweat rate.',
      'Practise your race-day drinking plan in training, not on the day.',
      'White salt marks on your kit mean you are a salty sweater and may need more electrolytes.',
      'Keep a can in the fridge for when you get home. Cold drinks go down easier after a hard effort.',
    ],
    flavours: ['citrus-surge', 'watermelon-sprint'],
  },
  {
    id: 'football', name: 'Football', kicker: 'Match day · Training · Five-a-side', c: '#C8FF1A', t: '#0E0E14',
    tagline: '90 minutes. Full tank.',
    intro: 'Sprints, tackles and non-stop changes of pace. The second half is where games are won, so stay sharp when everyone else is fading.',
    stats: [
      ['10km+', 'Covered by outfield players in a full match'],
      ['90+', 'Minutes of stop-start, high-intensity running'],
      ['25', 'Calories per can. No sugar slump at half-time'],
    ],
    challenges: [
      ['Second-half fade', 'Decision-making and sprint speed drop as fluid levels fall. Half-time is your chance to reset.'],
      ['Summer tournaments', 'Back-to-back games in the heat need a proper rehydration plan between matches.'],
      ['Training load', 'Midweek sessions plus match day add up. Recover properly so you are fresh for Saturday.'],
    ],
    plan: [
      ['Before', 'Warm-up', 'One can in the 45 minutes before kick-off.'],
      ['During', 'Half-time', 'Half a can, even if you do not feel thirsty yet.'],
      ['After', 'Full-time', 'Rehydrate in the changing room, especially before back-to-back games.'],
    ],
    tips: [
      'Grab a 24-pack for the squad kit bag. It works out cheaper per can.',
      'Bring your own can to every drinks break in hot weather.',
      'Tournament day? Drink between every game, not just at the end.',
      'Goalkeepers sweat too. Everyone on the team needs a hydration plan.',
    ],
    flavours: ['blue-voltage', 'tropical-rush'],
  },
  {
    id: 'gym', name: 'Gym', kicker: 'Strength · HIIT · Circuits', c: '#FF6A1F', t: '#0E0E14',
    tagline: 'Heavy sets. Heavy sweat.',
    intro: 'Lifting, HIIT and circuits push your heart rate and sweat rate right up. Keep your focus sharp between sets without loading up on sugar.',
    stats: [
      ['3g', 'Sugar per can, easy to fit into any nutrition plan'],
      ['0mg', 'Caffeine, so it works for a 6am or a 9pm session'],
      ['5', 'Electrolytes to support muscle function'],
    ],
    challenges: [
      ['Losing focus', 'Even mild dehydration can make the last sets feel harder than they should.'],
      ['Hot, busy gyms', 'Packed classes and warm rooms push sweat rates higher than you expect.'],
      ['Tracking macros', 'At 25 calories, Viva Nova hydrates without eating into your daily numbers.'],
    ],
    plan: [
      ['Before', 'On the way in', 'Sip a can on your commute or while you warm up.'],
      ['During', 'Between blocks', 'A few mouthfuls between supersets or rounds.'],
      ['After', 'Post-workout', 'Finish it alongside your post-training meal or shake.'],
    ],
    tips: [
      'Leave a can in your gym bag so you never train on empty.',
      'Doing HIIT? Keep a can in reach. Short rests go quickly.',
      'Caffeine-free means you can pair it with your usual pre-workout.',
      'Drink before you feel thirsty. Thirst lags behind what your body needs.',
    ],
    flavours: ['berry-blitz', 'glacier-grape'],
  },
  {
    id: 'cycling', name: 'Cycling', kicker: 'Road · Gravel · Indoor', c: '#FF2E88', t: '#0E0E14',
    tagline: 'Long climbs. Steady tank.',
    intro: 'Hours in the saddle, with the wind hiding how much you are really sweating. Keep electrolytes steady from the first kilometre to the café stop.',
    stats: [
      ['2–5hrs', 'A typical weekend ride'],
      ['Up to 1L', 'Fluid you can lose per hour in warm conditions'],
      ['500ml', 'Pours straight into a standard bottle'],
    ],
    challenges: [
      ['Hidden sweat', 'Airflow evaporates sweat quickly, so riders often underestimate how much they lose.'],
      ['Long climbs', 'Low speed and high effort on climbs means sweat rates spike.'],
      ['Indoor sessions', 'No wind on the turbo. Indoor riders can lose even more fluid than outside.'],
    ],
    plan: [
      ['Before', 'With breakfast', 'One can with your pre-ride meal.'],
      ['During', 'Every 15 min', 'Pour into your bottle and take small, regular sips.'],
      ['After', 'Café stop', 'One can to start recovering on the way home.'],
    ],
    tips: [
      'Set a 15-minute timer on your bike computer as a drink reminder.',
      'Indoor riding? Put a fan on and double your usual fluid.',
      'On long rides, carry one bottle of water and one of Viva Nova.',
      'Chill your bottles overnight for hot summer rides.',
    ],
    flavours: ['tropical-rush', 'citrus-surge'],
  },
  {
    id: 'court', name: 'Court', kicker: 'Tennis · Padel · Basketball', c: '#8B5CFF', t: '#FFFFFF',
    tagline: 'Fast feet need fluid.',
    intro: 'Explosive side-steps, short rests and long rallies. Use every changeover and timeout to top up and keep your first step quick.',
    stats: [
      ['90 sec', 'A tennis changeover, all you need to top up'],
      ['0mg', 'Caffeine, so no jitters on match point'],
      ['5', 'Electrolytes to keep your legs firing'],
    ],
    challenges: [
      ['Long matches', 'Three-set matches and tie-breaks can run well past two hours.'],
      ['Hot courts', 'Hard courts radiate heat and indoor halls get stuffy fast.'],
      ['Short rests', 'You only get seconds between points, so hydration has to be planned.'],
    ],
    plan: [
      ['Before', 'Warm-up', 'One can while you hit up or shoot around.'],
      ['During', 'Changeovers', 'A few sips at every changeover or timeout.'],
      ['After', 'Handshake', 'Finish a can before you pack your bag.'],
    ],
    tips: [
      'Pack two cans for matches that might go to a third set.',
      'Padel in the evening? Caffeine-free means you will still sleep.',
      'Sip, do not gulp, at changeovers to avoid feeling heavy.',
      'Tournament day? Rehydrate fully between rounds.',
    ],
    flavours: ['glacier-grape', 'blue-voltage'],
  },
  {
    id: 'recovery', name: 'Recovery', kicker: 'Rest days · Cool-downs · Mobility', c: '#2EE6C5', t: '#0E0E14',
    tagline: 'Rest day. Reset day.',
    intro: 'What you do after training matters as much as the session itself. Rehydrate properly so you are ready to go again tomorrow.',
    stats: [
      ['150%', 'Of the fluid you sweat out is a good rehydration target'],
      ['30 min', 'After training is the ideal time to start'],
      ['25', 'Calories per can, light on rest days'],
    ],
    challenges: [
      ['Next-day heaviness', 'Starting the next session under-hydrated makes everything feel harder.'],
      ['Sleep', 'Caffeine-free hydration fits into evening routines without keeping you up.'],
      ['Hot days', 'Even on rest days, summer heat keeps drawing on your fluid levels.'],
    ],
    plan: [
      ['Before', 'Cool-down', 'Crack a can as you stretch or foam roll.'],
      ['During', 'Rest day', 'Sip through the day alongside plenty of water.'],
      ['After', 'Evening', 'Caffeine-free, so it works right up until bedtime.'],
    ],
    tips: [
      'Check your urine colour. Pale straw means you are well hydrated.',
      'Pair Viva Nova with a protein-rich meal after hard sessions.',
      'Hot bath or sauna? Replace the fluid you lose there too.',
      'Keep a few cans at home for rest-day hydration.',
    ],
    flavours: ['watermelon-sprint', 'berry-blitz'],
  },
];

/* ---------- Lookups ---------- */
VN.flavourById = (id) => VN.FLAVOURS.find((f) => f.id === id);
VN.sportById = (id) => VN.SPORTS.find((s) => s.id === id);
VN.productImg = (id, fmt = 'can', view = 'front') => `images/${VN.FORMATS[fmt].dir}/${id}-${view}.webp`;
VN.canImg = (id, view = 'front') => VN.productImg(id, 'can', view);
VN.flavourUrl = (id, fmt) => `flavour.html?f=${id}${fmt && fmt !== 'can' ? `&fmt=${fmt}` : ''}`;
VN.sportUrl = (id) => `sport.html?s=${id}`;
