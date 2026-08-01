export const PUBLIC_CACHE_TAGS = {
  siteSettings: "public:site-settings",
  navItems: "public:nav-items",
  homeSections: "public:home-sections",
  aboutPage: "public:about-page",
  services: "public:services",
  servicesSetting: "public:services-setting",
  appointmentSetting: "public:appointment-setting",
  contactSetting: "public:contact-setting",
  homeIntro: "public:home-intro",
  adminExists: "admin:exists",
} as const

export const ALL_PUBLIC_CACHE_TAGS = Object.values(PUBLIC_CACHE_TAGS)
