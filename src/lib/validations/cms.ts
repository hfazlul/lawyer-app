import { z } from "zod"

export const heroSlideSchema = z.object({
  titleEn: z.string().min(1),
  titleBn: z.string().min(1),
  descriptionEn: z.string(),
  descriptionBn: z.string(),
  image: z.string().min(1),
  ctaTextEn: z.string().optional(),
  ctaTextBn: z.string().optional(),
  ctaLink: z.string().optional(),
  sortOrder: z.number().int(),
})

export const navItemSchema = z.object({
  labelEn: z.string().min(1),
  labelBn: z.string().min(1),
  href: z.string().min(1),
  sortOrder: z.number().int(),
  status: z.enum(["active", "archived"]).default("active"),
})

export const siteSettingSchema = z.object({
  logo: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  siteNameEn: z.string().optional().nullable(),
  siteNameBn: z.string().optional().nullable(),
  defaultLanguage: z.enum(["en", "bn"]).default("en"),
  searchEnabled: z.boolean().default(true),
  footerTextEn: z.string().optional().nullable(),
  footerTextBn: z.string().optional().nullable(),
  copyrightEn: z.string().optional().nullable(),
  copyrightBn: z.string().optional().nullable(),
  footerPhone: z.string().optional().nullable(),
  footerEmail: z.string().optional().nullable(),
  footerAddressEn: z.string().optional().nullable(),
  footerAddressBn: z.string().optional().nullable(),
  themeNavy: z.string().optional().nullable(),
  themeGold: z.string().optional().nullable(),
  layoutFullWidth: z.boolean().default(false),
  layoutMargin: z.number().int().min(0).max(48).default(16),
})

export const homeIntroSchema = z.object({
  titleEn: z.string().min(1),
  titleBn: z.string().min(1),
  descriptionEn: z.string(),
  descriptionBn: z.string(),
  lawyerImage: z.string().optional().nullable(),
  degreeEn: z.string().optional().nullable(),
  degreeBn: z.string().optional().nullable(),
  ctaTextEn: z.string().optional().nullable(),
  ctaTextBn: z.string().optional().nullable(),
  ctaLink: z.string().optional().nullable(),
})

export const featuredServiceSchema = z.object({
  icon: z.string().optional().nullable(),
  titleEn: z.string().min(1),
  titleBn: z.string().min(1),
  descriptionEn: z.string().default(""),
  descriptionBn: z.string().default(""),
  linkToService: z.string().optional().nullable(),
  sortOrder: z.number().int(),
})

export const successStatSchema = z.object({
  number: z.number().int().min(0),
  titleEn: z.string().min(1),
  titleBn: z.string().min(1),
})

export const activitySchema = z.object({
  image: z.string().min(1),
  titleEn: z.string().min(1),
  titleBn: z.string().min(1),
  captionEn: z.string().optional().nullable(),
  captionBn: z.string().optional().nullable(),
})

export const testimonialSchema = z.object({
  clientName: z.string().min(1),
  reviewEn: z.string().min(1),
  reviewBn: z.string().min(1),
  rating: z.number().int().min(1).max(5).default(5),
})

export const servicePageSchema = z.object({
  titleEn: z.string().min(1),
  titleBn: z.string().min(1),
  contentEn: z.string().default(""),
  contentBn: z.string().default(""),
  icon: z.string().optional().nullable(),
  bannerTitleEn: z.string().optional().nullable(),
  bannerTitleBn: z.string().optional().nullable(),
  bannerSubtitleEn: z.string().optional().nullable(),
  bannerSubtitleBn: z.string().optional().nullable(),
  sortOrder: z.number().int(),
})

export const servicesSettingSchema = z.object({
  bannerTitleEn: z.string().min(1),
  bannerTitleBn: z.string().min(1),
  bannerSubtitleEn: z.string().optional().nullable(),
  bannerSubtitleBn: z.string().optional().nullable(),
})

export const appointmentSettingSchema = z.object({
  bannerTitleEn: z.string().min(1),
  bannerTitleBn: z.string().min(1),
  bannerSubtitleEn: z.string().optional().nullable(),
  bannerSubtitleBn: z.string().optional().nullable(),
  officeHoursEn: z.string(),
  officeHoursBn: z.string(),
  mapImage: z.string().optional().nullable(),
  mapQuery: z.string().optional().nullable(),
  mapEmbedUrl: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
})

export const contactSettingSchema = z.object({
  bannerTitleEn: z.string().min(1),
  bannerTitleBn: z.string().min(1),
  bannerSubtitleEn: z.string().optional().nullable(),
  bannerSubtitleBn: z.string().optional().nullable(),
  officeHoursEn: z.string(),
  officeHoursBn: z.string(),
  mapImage: z.string().optional().nullable(),
  mapQuery: z.string().optional().nullable(),
  mapEmbedUrl: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  addressEn: z.string().optional().nullable(),
  addressBn: z.string().optional().nullable(),
})

export const aboutPageSchema = z.object({
  bannerTitleEn: z.string().optional().nullable(),
  bannerTitleBn: z.string().optional().nullable(),
  bannerSubtitleEn: z.string().optional().nullable(),
  bannerSubtitleBn: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  bioEn: z.string().optional().nullable(),
  bioBn: z.string().optional().nullable(),
  experienceEn: z.string().optional().nullable(),
  experienceBn: z.string().optional().nullable(),
  educationEn: z.string().optional().nullable(),
  educationBn: z.string().optional().nullable(),
  missionEn: z.string().optional().nullable(),
  missionBn: z.string().optional().nullable(),
  valuesEn: z.string().optional().nullable(),
  valuesBn: z.string().optional().nullable(),
})
