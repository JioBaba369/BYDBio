
// This list helps prevent username squatting and impersonation.
// It includes generic terms, potential feature names, and names of well-known people/brands.
export const RESERVED_USERNAMES = [
  // Generic & Admin
  'admin', 'administrator', 'root', 'support', 'help', 'contact', 'info',
  'moderator', 'mod', 'staff', 'team', 'system', 'sys', 'dev', 'developer',
  'api', 'auth', 'account', 'accounts', 'profile', 'profiles', 'user', 'users',
  'login', 'logout', 'signin', 'signout', 'signup', 'register',
  'settings', 'dashboard', 'explore', 'search', 'notifications', 'feed',
  'post', 'posts', 'event', 'events', 'job', 'jobs', 'listing', 'listings',
  'offer', 'offers', 'promo', 'promos', 'page', 'pages', 'connect', 'connections',
  'byd', 'byd.bio', 'bydbio', 'biotag',

  // Common sensitive/generic words
  'about', 'blog', 'careers', 'company', 'download', 'faq', 'features',
  'jobs', 'legal', 'press', 'pricing', 'privacy', 'security', 'shop', 'status',
  'terms', 'tos', 'trust',

  // Well-known Brands
  'google', 'apple', 'microsoft', 'amazon', 'facebook', 'meta', 'instagram',
  'twitter', 'x', 'linkedin', 'github', 'gitlab', 'slack', 'discord',
  'netflix', 'spotify', 'airbnb', 'uber', 'tesla', 'spacex',

  // Well-known People (examples)
  'elonmusk', 'billgates', 'jeffbezos', 'markzuckerberg', 'timcook',
  'satyanadella', 'sundarpichai', 'taylorswift', 'beyonce',

  // Potentially problematic
  'anonymous', 'everyone', 'all', 'guest', 'home', 'official',
];
