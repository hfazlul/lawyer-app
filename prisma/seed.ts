import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const BROKEN_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1589829545855-d10d557cf95f?w=1200&q=80"
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=85&auto=format&fit=crop"
const LAWYER_IMAGE = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1920&q=85&auto=format&fit=crop"
const MAP_IMAGE = "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"

async function main() {
  console.log("Seeding database...")

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteNameEn: "Musa & Associates",
      siteNameBn: "মুসা অ্যান্ড অ্যাসোসিয়েটস",
      defaultLanguage: "en",
      searchEnabled: true,
      footerTextEn: "Trusted legal counsel with decades of courtroom experience across civil, criminal, and corporate law.",
      footerTextBn: "দেড় দশকের আদালতি অভিজ্ঞতা নিয়ে নাগরিক, ফৌজদারি ও কর্পোরেট আইনে বিশ্বস্ত আইনি পরামর্শ।",
      copyrightEn: "© 2026 Musa & Associates. All rights reserved.",
      copyrightBn: "© ২০২৬ মুসা অ্যান্ড অ্যাসোসিয়েটস। সর্বস্বত্ব সংরক্ষিত।",
      footerPhone: "+880 1XXX-XXXXXX",
      footerEmail: "info@musaassociates.example",
      footerAddressEn: "123 Justice Avenue, Dhaka 1000, Bangladesh",
      footerAddressBn: "১২৩ জাস্টিস অ্যাভিনিউ, ঢাকা ১০০০, বাংলাদেশ",
      facebook: "https://facebook.com",
      youtube: "https://youtube.com",
      themeNavy: "220 52% 16%",
      themeGold: "38 42% 58%",
    },
  })

  const navCount = await prisma.navItem.count()
  if (navCount === 0) {
    await prisma.navItem.createMany({
      data: [
        { labelEn: "Home", labelBn: "হোম", href: "/", sortOrder: 1 },
        { labelEn: "Services", labelBn: "সেবাসমূহ", href: "/services", sortOrder: 2 },
        { labelEn: "Appointment", labelBn: "অ্যাপয়েন্টমেন্ট", href: "/appointment", sortOrder: 3 },
        { labelEn: "About", labelBn: "পরিচিতি", href: "/about", sortOrder: 4 },
        { labelEn: "Contact", labelBn: "যোগাযোগ", href: "/contact", sortOrder: 5 },
      ],
    })
  }

  const slideCount = await prisma.heroSlide.count()
  if (slideCount === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          titleEn: "Justice with Integrity",
          titleBn: "সততার সাথে ন্যায়বিচার",
          descriptionEn: "Experienced advocates dedicated to protecting your rights in every courtroom.",
          descriptionBn: "প্রতিটি আদালতে আপনার অধিকার রক্ষায় নিবেদিত অভিজ্ঞ আইনজীবী।",
          image: PLACEHOLDER_IMAGE,
          ctaTextEn: "Our Services",
          ctaTextBn: "আমাদের সেবা",
          ctaLink: "/services",
          sortOrder: 1,
        },
        {
          titleEn: "Schedule a Consultation",
          titleBn: "পরামর্শ নির্ধারণ করুন",
          descriptionEn: "Book an appointment today and get clear guidance on your legal matter.",
          descriptionBn: "আজই অ্যাপয়েন্টমেন্ট নিন এবং আপনার আইনি বিষয়ে স্পষ্ট নির্দেশনা পান।",
          image: LAWYER_IMAGE,
          ctaTextEn: "Book Now",
          ctaTextBn: "এখনই বুক করুন",
          ctaLink: "/appointment",
          sortOrder: 2,
        },
      ],
    })
  }

  await prisma.homeIntro.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      titleEn: "Welcome to Musa & Associates",
      titleBn: "মুসা অ্যান্ড অ্যাসোসিয়েটসে স্বাগতম",
      descriptionEn: "For over 15 years, our firm has represented clients in complex litigation, family disputes, and corporate matters with a commitment to excellence and client care.",
      descriptionBn: "১৫ বছরেরও বেশি সময় ধরে আমাদের ফার্ম জটিল মামলা, পারিবারিক বিবাদ ও কর্পোরেট বিষয়ে উৎকর্ষ ও ক্লায়েন্ট যত্নের প্রতিশ্রুতি নিয়ে ক্লায়েন্টদের প্রতিনিধিত্ব করছে।",
      lawyerImage: LAWYER_IMAGE,
      degreeEn: "LL.B | Advocate, Supreme Court of Bangladesh",
      degreeBn: "এলএলবি | অ্যাডভোকেট, বাংলাদেশ সুপ্রিম কোর্ট",
      ctaTextEn: "Contact Us",
      ctaTextBn: "যোগাযোগ করুন",
      ctaLink: "/contact",
    },
  })

  const featuredCount = await prisma.featuredService.count()
  if (featuredCount === 0) {
    const services = [
      { titleEn: "Civil Litigation", titleBn: "দেওয়ানি মামলা", descriptionEn: "Representation in civil disputes and contract matters.", descriptionBn: "দেওয়ানি বিবাদ ও চুক্তি বিষয়ে প্রতিনিধিত্ব।" },
      { titleEn: "Criminal Defense", titleBn: "ফৌজদারি আইন", descriptionEn: "Skilled defense for criminal charges at all court levels.", descriptionBn: "সকল আদালতে ফৌজদারি মামলায় দক্ষ প্রতিরক্ষা।" },
      { titleEn: "Family Law", titleBn: "পারিবারিক আইন", descriptionEn: "Sensitive handling of divorce, custody, and inheritance.", descriptionBn: "তালাক, অভিভাবকত্ব ও উত্তরাধিকার সংবেদনশীলভাবে পরিচালনা।" },
      { titleEn: "Corporate Law", titleBn: "কর্পোরেট আইন", descriptionEn: "Business formation, compliance, and commercial contracts.", descriptionBn: "ব্যবসা প্রতিষ্ঠা, সম্মতি ও বাণিজ্যিক চুক্তি।" },
      { titleEn: "Property Law", titleBn: "সম্পত্তি আইন", descriptionEn: "Land disputes, title verification, and property transactions.", descriptionBn: "জমি বিবাদ, খতিয়ান যাচাই ও সম্পত্তি লেনদেন।" },
      { titleEn: "Legal Consultation", titleBn: "আইনি পরামর্শ", descriptionEn: "Expert advice before you take legal action.", descriptionBn: "আইনি পদক্ষেপ নেওয়ার আগে বিশেষজ্ঞ পরামর্শ।" },
    ]
    await prisma.featuredService.createMany({
      data: services.map((s, i) => ({
        ...s,
        linkToService: "/services",
        sortOrder: i + 1,
      })),
    })
  }

  const statCount = await prisma.successStat.count()
  if (statCount === 0) {
    await prisma.successStat.createMany({
      data: [
        { number: 500, titleEn: "Cases Won", titleBn: "জিতেছে মামলা" },
        { number: 15, titleEn: "Years Experience", titleBn: "বছরের অভিজ্ঞতা" },
        { number: 1200, titleEn: "Happy Clients", titleBn: "সন্তুষ্ট ক্লায়েন্ট" },
        { number: 50, titleEn: "Expert Lawyers", titleBn: "বিশেষজ্ঞ আইনজীবী" },
      ],
    })
  }

  const activityCount = await prisma.activity.count()
  if (activityCount === 0) {
    await prisma.activity.createMany({
      data: [
        {
          image: PLACEHOLDER_IMAGE,
          titleEn: "Legal Aid Workshop",
          titleBn: "আইনি সহায়তা কর্মশালা",
          captionEn: "Community outreach program for legal awareness",
          captionBn: "আইনি সচেতনতার জন্য কমিউনিটি কর্মসূচি",
        },
        {
          image: LAWYER_IMAGE,
          titleEn: "Bar Association Seminar",
          titleBn: "বার অ্যাসোসিয়েশন সেমিনার",
          captionEn: "Continuing education for practicing advocates",
          captionBn: "চলমান আইনজীবীদের জন্য ক্রমাগত শিক্ষা",
        },
      ],
    })
  }

  const testimonialCount = await prisma.testimonial.count()
  if (testimonialCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          clientName: "Rahim Uddin",
          reviewEn: "Professional, responsive, and achieved a favorable outcome in my property dispute.",
          reviewBn: "পেশাদার, দ্রুত সাড়া দেয় এবং আমার সম্পত্তি বিবাদে অনুকূল ফলাফল এনেছে।",
          rating: 5,
        },
        {
          clientName: "Fatima Begum",
          reviewEn: "They handled my family case with compassion and expertise. Highly recommended.",
          reviewBn: "আমার পারিবারিক মামলা সহানুভূতি ও দক্ষতার সাথে পরিচালনা করেছে। অত্যন্ত সুপারিশকৃত।",
          rating: 5,
        },
        {
          clientName: "Karim Hassan",
          reviewEn: "Clear communication throughout the process. I always knew where my case stood.",
          reviewBn: "পুরো প্রক্রিয়ায় স্পষ্ট যোগাযোগ। আমার মামলা কোথায় আছে সবসময় জানতাম।",
          rating: 5,
        },
      ],
    })
  }

  const servicePageCount = await prisma.servicePage.count()
  const servicePages = [
    {
      titleEn: "Civil Litigation",
      titleBn: "দেওয়ানি মামলা",
      contentEn:
        "We represent clients in civil courts for disputes involving contracts, property, torts, and damages. Our team prepares thorough pleadings, gathers supporting evidence, and advocates effectively at every hearing.\n\nFrom pre-litigation advice to final judgment, we guide you through each stage with clarity and strategic planning.",
      contentBn:
        "চুক্তি, সম্পত্তি, অপকর্ম ও ক্ষতিপূরণ সংক্রান্ত বিবাদে আমরা দেওয়ানি আদালতে ক্লায়েন্টদের প্রতিনিধিত্ব করি। আমাদের দল প্রতিটি শুনানিতে কার্যকরভাবে যুক্তি উপস্থাপন করে।\n\nমামলা দায়েরের আগে পরামর্শ থেকে চূড়ান্ত রায় পর্যন্ত আমরা প্রতিটি ধাপে স্পষ্ট নির্দেশনা দিয়ে থাকি।",
      icon: "https://images.unsplash.com/photo-1589829545855-d10d557cf95f?w=800&q=80",
    },
    {
      titleEn: "Criminal Defense",
      titleBn: "ফৌজদারি আইন",
      contentEn:
        "From bail applications to full trial defense, we protect the rights of the accused at magistrate, sessions, and higher courts.\n\nWe build a strong defense strategy, challenge unlawful evidence, and ensure fair treatment throughout the criminal process.",
      contentBn:
        "জামিন আবেদন থেকে সম্পূর্ণ বিচার পর্যন্ত, আমরা ম্যাজিস্ট্রেট, সেশন ও উচ্চ আদালতে অভিযুক্তের অধিকার রক্ষা করি।\n\nআমরা শক্তিশালী প্রতিরক্ষা কৌশল তৈরি করি এবং ফৌজদারি প্রক্রিয়ায় ন্যায্য আচরণ নিশ্চিত করি।",
      icon: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    },
    {
      titleEn: "Family Law",
      titleBn: "পারিবারিক আইন",
      contentEn:
        "Divorce, maintenance, child custody, and inheritance matters handled with discretion and care.\n\nWe prioritize sensitive family interests while pursuing practical legal solutions that protect your rights and dignity.",
      contentBn:
        "তালাক, ভরণপোষণ, সন্তানের অভিভাবকত্ব ও উত্তরাধিকার বিষয় সতর্কতা ও যত্নের সাথে পরিচালনা করা হয়।\n\nপারিবারিক স্বার্থকে অগ্রাধিকার দিয়ে আমরা আপনার অধিকার রক্ষায় বাস্তবসম্মত আইনি সমাধান খুঁজে বের করি।",
      icon: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80",
    },
    {
      titleEn: "Corporate Law",
      titleBn: "কর্পোরেট আইন",
      contentEn:
        "Business formation, regulatory compliance, shareholder disputes, and commercial contracts for companies of all sizes.\n\nWe help businesses reduce legal risk while supporting growth through sound corporate governance.",
      contentBn:
        "ব্যবসা প্রতিষ্ঠা, নিয়ন্ত্রক সম্মতি, শেয়ারহোল্ডার বিবাদ ও বাণিজ্যিক চুক্তি সব ধরনের প্রতিষ্ঠানের জন্য।\n\nআমরা আইনি ঝুঁকি কমিয়ে শক্তিশালী কর্পোরেট গভর্নেন্সের মাধ্যমে ব্যবসার প্রবৃদ্ধিতে সহায়তা করি।",
      icon: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
    },
    {
      titleEn: "Property Law",
      titleBn: "সম্পত্তি আইন",
      contentEn:
        "Land disputes, title verification, lease agreements, and property transactions handled with meticulous due diligence.\n\nWe protect your ownership rights and help resolve conflicts before they escalate into costly litigation.",
      contentBn:
        "জমি বিবাদ, খতিয়ান যাচাই, লিজ চুক্তি ও সম্পত্তি লেনদেন যত্নসহকারে পরিচালনা করা হয়।\n\nআমরা আপনার মালিকানার অধিকার রক্ষা করি এবং বিবাদ দীর্ঘ মামলায় পরিণত হওয়ার আগে সমাধান করতে সহায়তা করি।",
      icon: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    },
    {
      titleEn: "Legal Consultation",
      titleBn: "আইনি পরামর্শ",
      contentEn:
        "Expert advice before you take legal action — understand your options, risks, and the best path forward.\n\nOur consultations help you make informed decisions with confidence, whether for personal or business matters.",
      contentBn:
        "আইনি পদক্ষেপ নেওয়ার আগে বিশেষজ্ঞ পরামর্শ — আপনার বিকল্প, ঝুঁকি ও সঠিক পথ বুঝে নিন।\n\nব্যক্তিগত বা ব্যবসায়িক যেকোনো বিষয়ে আত্মবিশ্বাসের সাথে সিদ্ধান্ত নিতে আমাদের পরামর্শ সহায়ক।",
      icon: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    },
  ]

  if (servicePageCount === 0) {
    await prisma.servicePage.createMany({
      data: servicePages.map((page, index) => ({ ...page, sortOrder: index + 1 })),
    })
  } else {
    for (let index = 0; index < servicePages.length; index++) {
      const page = servicePages[index]
      const existing = await prisma.servicePage.findFirst({ where: { titleEn: page.titleEn } })
      if (!existing) {
        await prisma.servicePage.create({ data: { ...page, sortOrder: index + 1 } })
      }
    }
  }

  await prisma.appointmentSetting.upsert({
    where: { id: 1 },
    update: {
      mapQuery: "123 Justice Avenue, Dhaka 1000, Bangladesh",
    },
    create: {
      id: 1,
      bannerTitleEn: "Schedule a Consultation",
      bannerTitleBn: "পরামর্শ নির্ধারণ করুন",
      bannerSubtitleEn: "Book a time to discuss your legal needs",
      bannerSubtitleBn: "আপনার আইনি প্রয়োজন নিয়ে আলোচনার জন্য সময় নির্ধারণ করুন",
      officeHoursEn: "Sunday - Thursday, 9:00 AM - 6:00 PM",
      officeHoursBn: "রবিবার - বৃহস্পতিবার, সকাল ৯:০০ - সন্ধ্যা ৬:০০",
      mapImage: MAP_IMAGE,
      mapQuery: "123 Justice Avenue, Dhaka 1000, Bangladesh",
      contactPhone: "+880 1XXX-XXXXXX",
      contactEmail: "appointment@musaassociates.example",
    },
  })

  await prisma.contactSetting.upsert({
    where: { id: 1 },
    update: {
      mapQuery: "District & Sessions Judge Court, Dhaka",
    },
    create: {
      id: 1,
      bannerTitleEn: "Contact Us",
      bannerTitleBn: "যোগাযোগ করুন",
      bannerSubtitleEn: "We are here to answer your questions",
      bannerSubtitleBn: "আপনার প্রশ্নের উত্তর দিতে আমরা এখানে আছি",
      officeHoursEn: "Sunday - Thursday, 9:00 AM - 6:00 PM",
      officeHoursBn: "রবিবার - বৃহস্পতিবার, সকাল ৯:০০ - সন্ধ্যা ৬:০০",
      mapImage: MAP_IMAGE,
      mapQuery: "District & Sessions Judge Court, Dhaka",
      phone: "+880 1XXX-XXXXXX",
      email: "info@musaassociates.example",
      addressEn: "123 Justice Avenue, Dhaka 1000, Bangladesh",
      addressBn: "১২৩ জাস্টিস অ্যাভিনিউ, ঢাকা ১০০০, বাংলাদেশ",
    },
  })

  await prisma.servicesSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      bannerTitleEn: "Our Legal Services",
      bannerTitleBn: "আমাদের আইনি সেবাসমূহ",
      bannerSubtitleEn: "Comprehensive legal solutions with integrity and expertise",
      bannerSubtitleBn: "সততা ও দক্ষতার সাথে বিস্তৃত আইনি সমাধান",
    },
  })

  await prisma.aboutPage.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      bannerTitleEn: "About",
      bannerTitleBn: "পরিচিতি",
      bannerSubtitleEn: "Dedicated to justice, integrity, and client advocacy",
      bannerSubtitleBn: "ন্যায়বিচার, সততা ও ক্লায়েন্ট অ্যাডভোকেসির প্রতি নিবেদিত",
      image: LAWYER_IMAGE,
      bioEn: "Advocate Musa Rahman is a senior lawyer with over 15 years of practice in the High Court Division. He leads Musa & Associates with a focus on client-centered advocacy.",
      bioBn: "অ্যাডভোকেট মুসা রহমান হাইকোর্ট বিভাগে ১৫ বছরেরও বেশি অনুশীলনের একজন সিনিয়র আইনজীবী। তিনি ক্লায়েন্ট-কেন্দ্রিক অ্যাডভোকেসির উপর গুরুত্ব দিয়ে মুসা অ্যান্ড অ্যাসোসিয়েটস পরিচালনা করেন।",
      experienceEn: "Led 500+ cases across civil, criminal, and corporate law. Former panel lawyer for leading financial institutions.",
      experienceBn: "দেওয়ানি, ফৌজদারি ও কর্পোরেট আইনে ৫০০+ মামলা পরিচালনা। শীর্ষ আর্থিক প্রতিষ্ঠানের সাবেক প্যানেল আইনজীবী।",
      educationEn: "LL.B (Hons), University of Dhaka. Enrolled with the Bangladesh Bar Council.",
      educationBn: "এলএল.বি (অনার্স), ঢাকা বিশ্ববিদ্যালয়। বাংলাদেশ বার কাউন্সিলে তালিকাভুক্ত।",
      missionEn: "To deliver accessible, ethical, and effective legal representation for every client.",
      missionBn: "প্রতিটি ক্লায়েন্টের জন্য সুলভ, নৈতিক ও কার্যকর আইনি প্রতিনিধিত্ব প্রদান।",
      valuesEn: JSON.stringify(["Integrity", "Excellence", "Client Focus"]),
      valuesBn: JSON.stringify(["সততা", "উৎকর্ষ", "ক্লায়েন্ট কেন্দ্রিক"]),
    },
  })

  const caseCount = await prisma.case.count()
  if (caseCount === 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const demoCases = [
      {
        serial: 1,
        clientName: "Rahim Uddin",
        caseNo: "JC-2024-101",
        court: "JUDGE_COURT" as const,
        caseType: "Civil Suit",
        onBehalf: "COMPLAINANT" as const,
        contactNo: "01711000001",
        email: "rahim@example.com",
        caseFileLink: "https://drive.google.com/file/d/demo1/view",
        previousDate: lastMonth,
        nextDate: today,
        steps: "Awaiting witness testimony",
        status: "active",
      },
      {
        serial: 2,
        clientName: "Karim Ahmed",
        caseNo: "HC-2024-205",
        court: "HIGH_COURT" as const,
        caseType: "Writ Petition",
        onBehalf: "COMPLAINANT" as const,
        contactNo: "01822000002",
        email: "karim@example.com",
        previousDate: lastMonth,
        nextDate: tomorrow,
        steps: "Submission of affidavit",
        status: "active",
      },
      {
        serial: 3,
        clientName: "Fatima Begum",
        caseNo: "SC-2023-088",
        court: "SUPREME_COURT" as const,
        caseType: "Appeal",
        onBehalf: "ACCUSED" as const,
        contactNo: "01933000003",
        previousDate: lastMonth,
        nextDate: nextWeek,
        steps: "Final hearing scheduled",
        status: "active",
      },
      {
        serial: 4,
        clientName: "Nasir Hossain",
        caseNo: "JC-2023-450",
        court: "JUDGE_COURT" as const,
        caseType: "Criminal",
        onBehalf: "ACCUSED" as const,
        contactNo: "01644000004",
        previousDate: lastMonth,
        nextDate: lastMonth,
        steps: "Case disposed",
        status: "completed",
      },
      {
        serial: 5,
        clientName: "Sultana Akter",
        caseNo: "HC-2022-312",
        court: "HIGH_COURT" as const,
        caseType: "Family",
        onBehalf: "COMPLAINANT" as const,
        contactNo: "01555000005",
        previousDate: lastMonth,
        steps: "Dismissed",
        status: "failed",
      },
      {
        serial: 6,
        clientName: "Jamal Mia",
        caseNo: "JC-2025-012",
        court: "JUDGE_COURT" as const,
        caseType: "Land Dispute",
        onBehalf: "COMPLAINANT" as const,
        contactNo: "01766000006",
        previousDate: today,
        nextDate: tomorrow,
        steps: "Document verification",
        status: "active",
      },
    ]

    for (const c of demoCases) {
      const created = await prisma.case.create({ data: c })
      await prisma.caseHistory.create({
        data: {
          caseId: created.id,
          action: `Case created. Next: ${c.nextDate ? c.nextDate.toLocaleDateString() : "N/A"}`,
          status: c.status,
        },
      })
      if (c.steps) {
        await prisma.caseHistory.create({
          data: { caseId: created.id, action: `Steps: ${c.steps}`, status: c.status },
        })
      }
    }
    console.log(`Seeded ${demoCases.length} demo cases.`)
  }

  const brokenImageFix = await prisma.$transaction([
    prisma.heroSlide.updateMany({
      where: { image: BROKEN_PLACEHOLDER_IMAGE },
      data: { image: PLACEHOLDER_IMAGE },
    }),
    prisma.activity.updateMany({
      where: { image: BROKEN_PLACEHOLDER_IMAGE },
      data: { image: PLACEHOLDER_IMAGE },
    }),
  ])
  if (brokenImageFix[0].count + brokenImageFix[1].count > 0) {
    console.log(`Fixed ${brokenImageFix[0].count + brokenImageFix[1].count} broken image URL(s).`)
  }

  const { syncFeaturedServicesToServicePages } = await import("../src/lib/sync-services")
  await syncFeaturedServicesToServicePages()
  console.log("Synced featured services to service pages.")

  console.log("Seed completed successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
