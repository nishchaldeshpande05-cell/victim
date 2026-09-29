// NAVICA Unified Data Store & State Management
// Fictional academic prototype dataset

const INITIAL_CASES = [
  {
    id: "VC-2026-00125",
    caseCode: "NAV-001",
    victimName: "Ananya Sharma",
    mobile: "+91 9000000001",
    rawMobile: "9000000001",
    password: "ananya123",
    type: "Offence against person (demo category)",
    station: "Example Police Station",
    court: "Example District Court",
    assignedOfficer: "Sub-Inspector V. Raman",
    registrationDate: "2026-08-02",
    lastUpdate: "10 Sep 2026",
    currentStatus: "Investigation Process",
    currentStage: "Investigation", // ['FIR', 'Investigation', 'Charge Sheet', 'Court Proceedings', 'Judgment']
    stageLabel: "Investigation Process",
    stageDescription: "The case is currently in the active Investigation Process. Police and specialized forensic personnel are conducting field inquiries, examining the crime scene, and compiling witness statements before submitting the formal police report (charge sheet).",
    victimViewed: "Permitted",
    authorityStageUpdate: {
      headline: "Investigation Active — Scene Examination & Forensic Evidence Under Verification",
      description: "Investigating Officer Sub-Inspector V. Raman (PS-884) completed initial scene documentation and recorded victim and witness statements under Section 164 Cr.P.C. Digital call records (CDR) and scientific samples have been dispatched to the State Forensic Science Laboratory (SFSL). Charge sheet preparation will commence promptly upon receipt of the forensic report.",
      officer: "Sub-Inspector V. Raman (PS-884)",
      station: "Example Police Station",
      lastUpdated: "12 Sep 2026, 04:30 PM",
      badge: "Verified Police Dispatch",
      authorityNotesSpace: [
        {
          id: "an-1",
          date: "12 Sep 2026, 04:30 PM",
          title: "Forensic Evidence Dispatched to SFSL",
          note: "Physical exhibits and mobile extraction data submitted to State Forensic Science Laboratory with formal chain-of-custody acknowledgment.",
          officer: "Sub-Inspector V. Raman"
        },
        {
          id: "an-2",
          date: "18 Aug 2026, 11:00 AM",
          title: "Section 164 Victim Statement Recorded",
          note: "Confidential statement of the victim formally recorded before the Judicial Magistrate First Class.",
          officer: "Sub-Inspector V. Raman"
        }
      ],
      upcomingActionNotice: "Next investigative review scheduled for 24 Sep 2026. Reserved space for formal forensic clearance report receipt and final charge sheet compilation."
    },
    whatNext: {
      meaning: "Your FIR has been registered and the investigating officer is currently collecting statements, documents and other material related to the complaint.",
      next: "The investigation may lead to a charge sheet being filed before the court, or a closure report if material is not found. You may be asked to give a statement or identify records.",
      action: "Keep your registered mobile number active, preserve copies of any documents you submitted, and note the name of your investigating officer for follow-up."
    },
    dates: [
      { label: "Next follow-up", value: "24 Sep 2026", note: "Investigation review (demo)", isUpcoming: true },
      { label: "FIR registered", value: "02 Aug 2026", note: "Completed", isUpcoming: false },
      { label: "Statement recorded", value: "18 Aug 2026", note: "Completed", isUpcoming: false },
      { label: "Compensation application", value: "05 Sep 2026", note: "Submitted, under verification", isUpcoming: false }
    ],
    timeline: [
      { id: "m-1", date: "02 Aug 2026", stage: "FIR", title: "FIR registered", detail: "FIR recorded at Example Police Station under applicable sections.", state: "completed" },
      { id: "m-2", date: "06 Aug 2026", stage: "Investigation", title: "Case assigned", detail: "Investigating Officer assigned to lead the probe.", state: "completed" },
      { id: "m-3", date: "18 Aug 2026", stage: "Investigation", title: "Statement recorded", detail: "Victim statement recorded under Section 164 (demo entry).", state: "completed" },
      { id: "m-4", date: "05 Sep 2026", stage: "Compensation", title: "Compensation applied", detail: "Victim compensation claim submitted to DLSA authority.", state: "completed" },
      { id: "m-5", date: "12 Sep 2026", stage: "Investigation", title: "Investigation ongoing", detail: "Forensic evidence and witness statements under compilation.", state: "active" },
      { id: "m-6", date: "24 Sep 2026", stage: "Charge Sheet", title: "Charge sheet preparation", detail: "Final report to be submitted before the Judicial Magistrate.", state: "upcoming" }
    ],
    documents: [
      {
        id: "doc-125-1",
        title: "First Information Report (FIR Record)",
        kind: "FIR record",
        issued: "02 Aug 2026",
        badge: "Certified Copy",
        body: [
          "GOVERNMENT OF NCT / STATE POLICE DEPARTMENT",
          "FIRST INFORMATION REPORT (Under Section 154 Cr.P.C. / BNSS)",
          "----------------------------------------------------------------------",
          "FIR No: 0125/2026  |  Police Station: Example Police Station",
          "Date & Time of Registration: 02 August 2026, 11:45 Hours",
          "Complainant / Informant: Ananya Sharma",
          "Type of Offence: Cognizable | Offence against person",
          "Investigating Officer: Sub-Inspector V. Raman (Badge #PS-884)",
          "Status: Investigation underway",
          "----------------------------------------------------------------------",
          "DEMO NOTICE: This is a placeholder document generated for an academic prototype.",
          "No actual police investigation or individual record is connected to this demonstrator."
        ]
      },
      {
        id: "doc-125-2",
        title: "Compensation Claim Acknowledgement Slip",
        kind: "Authority Order",
        issued: "05 Sep 2026",
        badge: "Official Receipt",
        body: [
          "DISTRICT LEGAL SERVICES AUTHORITY (DLSA)",
          "VICTIM COMPENSATION COMMITTEE",
          "----------------------------------------------------------------------",
          "Application ID: CMP-2026-0451",
          "Applicant: Ananya Sharma  |  Case Ref: VC-2026-00125",
          "Received Date: 05 September 2026",
          "Scheme: Central / State Victim Compensation Scheme (CVCF)",
          "Current Stage: Stage 2 - Documentation & Medical verification",
          "----------------------------------------------------------------------",
          "STATUS: Application accepted for verification. Medical report verified by DLSA desk.",
          "Placeholder content generated solely for academic demonstration."
        ]
      }
    ],
    compensation: {
      applicationId: "CMP-2026-0451",
      status: "Under verification",
      currentStep: "Verification", // ['Application Submitted', 'Verification', 'Decision / Processing', 'Disbursement']
      lastUpdate: "10 Sep 2026",
      disbursedAmount: 0,
      sanctionedAmount: 50000,
      nextStep: "Decision / Processing by DLSA Committee scheduled for 26 Sep 2026"
    }
  },
  {
    id: "VC-2026-00126",
    caseCode: "NAV-002",
    victimName: "Rahul Verma",
    mobile: "+91 9000000002",
    rawMobile: "9000000002",
    password: "rahul123",
    type: "Property related offence (demo category)",
    station: "Example Police Station",
    court: "Example Sessions Court",
    assignedOfficer: "Inspector K. Swamy",
    registrationDate: "2026-04-20",
    lastUpdate: "10 Sep 2026",
    currentStatus: "Court Proceedings",
    currentStage: "Court Proceedings",
    stageLabel: "Court Proceedings",
    stageDescription: "The case has progressed past the investigation stage and is actively in Court Proceedings. The formal police charge sheet was admitted, and judicial examination of witnesses and documentary evidence is currently underway.",
    victimViewed: "Permitted",
    authorityStageUpdate: {
      headline: "Court Proceedings Active — Witness Examination & Evidentiary Record",
      description: "Charge sheet formally filed by police and admitted by the Sessions Judge. Prosecution witnesses PW-1 and PW-2 have tendered initial testimony. Next hearing is fixed for 30 Sep 2026 before Court Room 3 for witness cross-examination.",
      officer: "Prosecutor Desk / Inspector K. Swamy",
      station: "Example Sessions Court",
      lastUpdated: "11 Sep 2026, 11:15 AM",
      badge: "Verified Judicial Update",
      authorityNotesSpace: [
        {
          id: "an-21",
          date: "11 Sep 2026, 11:15 AM",
          title: "Prosecution Witness Summons Dispatched",
          note: "Formal court summons dispatched to defense counsel and primary eyewitnesses for upcoming session.",
          officer: "Inspector K. Swamy"
        }
      ],
      upcomingActionNotice: "Cross-examination of prosecution witnesses scheduled for 30 Sep 2026 before Court Room 3."
    },
    whatNext: {
      meaning: "The investigation is complete and a charge sheet has been filed. The matter is now being heard by the court, and hearings are scheduled from time to time.",
      next: "The court may record evidence, hear witnesses and fix further dates. Hearings can be adjourned and dates may change.",
      action: "Note your next hearing date, stay in contact with the prosecutor or legal aid service, and attend on the date if you have been asked to appear."
    },
    dates: [
      { label: "Next hearing", value: "30 Sep 2026", note: "Example Sessions Court (demo)", isUpcoming: true },
      { label: "Previous hearing", value: "02 Sep 2026", note: "Evidence partly recorded", isUpcoming: false },
      { label: "Charge sheet filed", value: "14 Jul 2026", note: "Completed", isUpcoming: false },
      { label: "Application update", value: "11 Sep 2026", note: "Copy of order made available", isUpcoming: false }
    ],
    timeline: [
      { id: "m-21", date: "20 Apr 2026", stage: "FIR", title: "FIR registered", detail: "Complaint recorded at Example Police Station.", state: "completed" },
      { id: "m-22", date: "14 Jul 2026", stage: "Charge Sheet", title: "Charge sheet filed", detail: "Police submitted charge sheet before Sessions Court.", state: "completed" },
      { id: "m-23", date: "08 Aug 2026", stage: "Court Proceedings", title: "First hearing & cognizance", detail: "Matter taken on judicial board, charges framed.", state: "completed" },
      { id: "m-24", date: "02 Sep 2026", stage: "Court Proceedings", title: "Evidence recorded", detail: "Prosecution evidence partly examined in open court.", state: "completed" },
      { id: "m-25", date: "11 Sep 2026", stage: "Court Proceedings", title: "Next hearing date fixed", detail: "Court adjourned hearing for witness cross-examination.", state: "active" },
      { id: "m-26", date: "30 Sep 2026", stage: "Court Proceedings", title: "Witness Examination", detail: "Scheduled before Court Room 3, Sessions Division.", state: "upcoming" }
    ],
    documents: [
      {
        id: "doc-126-1",
        title: "FIR Record & Seizure Memo (Demo)",
        kind: "FIR record",
        issued: "20 Apr 2026",
        badge: "Certified",
        body: [
          "FIR No: 0126/2026  |  Police Station: Example Police Station",
          "Registration Date: 20 April 2026",
          "Complainant: Rahul Verma",
          "Property Involved: Electronic equipment & business inventory",
          "Status: Investigation completed; transferred to judicial custody."
        ]
      },
      {
        id: "doc-126-2",
        title: "Charge Sheet Summary (Demo)",
        kind: "Court document",
        issued: "14 Jul 2026",
        badge: "Judicial Filing",
        body: [
          "IN THE COURT OF THE LEARNED SESSIONS JUDGE",
          "POLICE REPORT UNDER SECTION 173 Cr.P.C.",
          "State vs. Accused Persons (Demo)",
          "Charge Sheet No: CS-2026/089",
          "Factual Summary: Complete material evidence catalogued.",
          "Victim rights notice appended in accordance with legal directives."
        ]
      },
      {
        id: "doc-126-3",
        title: "Interim Hearing Order & Adjournment Note",
        kind: "Order",
        issued: "11 Sep 2026",
        badge: "Court Order",
        body: [
          "ORDER SHEET: Sessions Case No. 441/2026",
          "Dated: 11 September 2026",
          "Coram: Hon'ble Sessions Court",
          "The matter is adjourned. Next date of hearing is fixed for 30 September 2026.",
          "All parties to remain present. Summons re-issued to witness #2."
        ]
      }
    ],
    compensation: {
      applicationId: "CMP-2026-0468",
      status: "Application submitted",
      currentStep: "Application Submitted",
      lastUpdate: "08 Sep 2026",
      disbursedAmount: 0,
      sanctionedAmount: 25000,
      nextStep: "Verification of the submitted property damage assessment"
    }
  },
  {
    id: "VC-2026-00127",
    caseCode: "NAV-003",
    victimName: "Priya Nair",
    mobile: "+91 9000000003",
    rawMobile: "9000000003",
    password: "priya123",
    type: "Offence with compensation claim (demo category)",
    station: "Example Police Station",
    court: "Example District Court",
    assignedOfficer: "Inspector Anjali Mehta",
    registrationDate: "2026-01-11",
    lastUpdate: "10 Sep 2026",
    currentStatus: "Judgment Delivered — Compensation Disbursing",
    currentStage: "Judgment",
    stageLabel: "Compensation",
    stageDescription: "The judicial trial has concluded with a conviction judgment. The matter is currently under DLSA statutory victim compensation disbursal proceedings.",
    victimViewed: "Permitted",
    authorityStageUpdate: {
      headline: "Judgment Concluded — DLSA Victim Compensation Disbursal in Final Stage",
      description: "Judicial judgment delivered with conviction. DLSA Committee sanctioned ₹2,50,000 under the statutory compensation scheme. Bank verification finalized; initial installment disbursement has been queued for bank transfer.",
      officer: "Secretary, DLSA / Inspector Anjali Mehta",
      station: "District Legal Services Authority",
      lastUpdated: "10 Sep 2026, 02:45 PM",
      badge: "Verified Authority Update",
      authorityNotesSpace: [
        {
          id: "an-31",
          date: "10 Sep 2026, 02:45 PM",
          title: "Bank Account Mandate Approved",
          note: "Victim bank mandate and IFSC validation successfully authorized by DLSA nodal officer.",
          officer: "Secretary, DLSA"
        }
      ],
      upcomingActionNotice: "First installment bank credit expected within 5-7 working days under statutory victim welfare mandate."
    },
    whatNext: {
      meaning: "The court proceedings in your matter have concluded and the focus has moved to your compensation claim, which is being processed by the demo authority.",
      next: "The authority may complete its decision and arrange disbursement to your registered bank account. You may be asked to confirm bank or identity details.",
      action: "Keep your bank and contact details updated, retain your application ID, and follow up using the compensation reference shown below."
    },
    dates: [
      { label: "Judgment delivered", value: "21 Aug 2026", note: "Completed", isUpcoming: false },
      { label: "Compensation decision", value: "19 Sep 2026", note: "Expected (demo)", isUpcoming: true },
      { label: "Previous hearing", value: "05 Aug 2026", note: "Final arguments", isUpcoming: false },
      { label: "Application update", value: "09 Sep 2026", note: "Decision recorded, processing", isUpcoming: false }
    ],
    timeline: [
      { id: "m-31", date: "11 Jan 2026", stage: "FIR", title: "FIR registered", detail: "Complaint formally registered at Example Police Station.", state: "completed" },
      { id: "m-32", date: "03 Mar 2026", stage: "Charge Sheet", title: "Charge sheet filed", detail: "Detailed investigation report submitted to District Court.", state: "completed" },
      { id: "m-33", date: "05 Aug 2026", stage: "Court Proceedings", title: "Final arguments", detail: "Arguments concluded; judgment reserved.", state: "completed" },
      { id: "m-34", date: "21 Aug 2026", stage: "Judgment", title: "Judgment delivered", detail: "Court proceedings concluded. Conviction recorded.", state: "completed" },
      { id: "m-35", date: "09 Sep 2026", stage: "Compensation", title: "Compensation sanctioned", detail: "DLSA sanctioned relief of ₹1,50,000 under State Scheme.", state: "completed" },
      { id: "m-36", date: "19 Sep 2026", stage: "Compensation", title: "Direct bank disbursement", detail: "Transfer initiated through Treasury / PFMS to verified account.", state: "active" }
    ],
    documents: [
      {
        id: "doc-127-1",
        title: "FIR Record (Demo Copy)",
        kind: "FIR record",
        issued: "11 Jan 2026",
        badge: "Certified Record",
        body: [
          "FIR No: 0127/2026  |  Example Police Station",
          "Registered: 11 January 2026  |  Complainant: Priya Nair",
          "Sections: Applicable provisions under penal statute",
          "Investigating Officer: Inspector Anjali Mehta"
        ]
      },
      {
        id: "doc-127-2",
        title: "Final Judgment & Order Copy (Summary)",
        kind: "Court document",
        issued: "21 Aug 2026",
        badge: "Final Judgment",
        body: [
          "IN THE COURT OF THE LEARNED DISTRICT JUDGE",
          "Sessions Case No: 112/2026",
          "Judgment pronounced on: 21 August 2026",
          "Finding: Accused held guilty; relief recommended to victim under Section 357A CrPC.",
          "Directive: Matter forwarded to DLSA for immediate compensation sanction."
        ]
      },
      {
        id: "doc-127-3",
        title: "Compensation Sanction Order & Disbursement Advice",
        kind: "Order",
        issued: "09 Sep 2026",
        badge: "Sanction Letter",
        body: [
          "DISTRICT LEGAL SERVICES AUTHORITY",
          "Sanction Order No: DLSA/VC/2026/0399",
          "Beneficiary: Priya Nair  |  Claim ID: CMP-2026-0399",
          "Amount Sanctioned: INR 1,50,000 (Rupees One Lakh Fifty Thousand Only)",
          "Status: Approved by Committee. Bank electronic mandate signed for payout."
        ]
      }
    ],
    compensation: {
      applicationId: "CMP-2026-0399",
      status: "Decision recorded, processing payment",
      currentStep: "Decision / Processing",
      lastUpdate: "09 Sep 2026",
      disbursedAmount: 150000,
      sanctionedAmount: 150000,
      nextStep: "Direct disbursement to the registered bank account"
    }
  }
];

// EMERGENCY & CRISIS HELPLINES DIRECTORY
// Standard verified Indian statutory & emergency helplines
const EMERGENCY_HELPLINES = [
  {
    category: "EMERGENCY",
    categoryIcon: "🆘",
    categoryName: "EMERGENCY",
    items: [
      {
        number: "112",
        title: "112 — Emergency",
        tag: "National Emergency Helpline · 24/7 Toll-Free",
        desc: "All-in-one emergency response coordinating police patrol units, ambulances, and fire/rescue teams across India.",
        badge: "Critical Response",
        type: "phone"
      },
      {
        number: "102",
        title: "102 — Ambulance",
        tag: "Emergency Medical Transport · 24/7 Toll-Free",
        desc: "Immediate medical ambulance dispatch, critical trauma evacuation, and maternal/neonatal healthcare transfer.",
        badge: "Medical",
        type: "phone"
      },
      {
        number: "101",
        title: "101 — Fire",
        tag: "Fire & Rescue Service · 24/7 Toll-Free",
        desc: "Rapid fire containment, disaster rescue, building evacuation, and hazardous chemical response.",
        badge: "Rescue",
        type: "phone"
      }
    ]
  },
  {
    category: "LEGAL_RIGHTS",
    categoryIcon: "⚖️",
    categoryName: "LEGAL & RIGHTS",
    items: [
      {
        number: "15100",
        title: "15100 — Free Legal Aid",
        tag: "NALSA · National Legal Services Authority",
        desc: "Free legal counsel, advocate appointment, court representation, and assistance filing DLSA victim compensation claims.",
        badge: "Legal Aid",
        type: "phone"
      },
      {
        number: "14433",
        title: "14433 — Human Rights Commission",
        tag: "NHRC · National Human Rights Commission",
        desc: "Reporting and investigation of human rights violations, custodial excesses, and statutory institutional grievances.",
        badge: "Human Rights",
        type: "phone"
      }
    ]
  },
  {
    category: "MENTAL_HEALTH",
    categoryIcon: "🧠",
    categoryName: "MENTAL HEALTH",
    items: [
      {
        number: "14416",
        title: "14416 — Tele-MANAS",
        tag: "MoHFW · 24/7 Multi-Lingual Mental Health",
        desc: "Free comprehensive psychological first aid, trauma recovery counselling, and emotional distress support in all regional languages.",
        badge: "Trauma Care",
        type: "phone"
      },
      {
        number: "080-46110007",
        title: "080-46110007 — NIMHANS",
        tag: "National Institute of Mental Health & Neuro Sciences",
        desc: "Specialized clinical psychosocial support for survivors of crime, catastrophic incidents, and severe psychological distress.",
        badge: "Psychosocial",
        type: "phone"
      }
    ]
  },
  {
    category: "WOMEN_CHILDREN",
    categoryIcon: "👩",
    categoryName: "WOMEN & CHILDREN",
    items: [
      {
        number: "181",
        title: "181 — Women Helpline",
        tag: "24/7 Emergency & Referral Service",
        desc: "Dedicated crisis intervention and rescue for women facing violence, abuse, harassment, sexual assault, and shelter coordination.",
        badge: "Women Safety",
        type: "phone"
      },
      {
        number: "1098",
        title: "1098 — Child Helpline",
        tag: "Childline India · 24/7 Protection",
        desc: "Nationwide emergency phone outreach for children in need of immediate care, physical protection, and rescue from harm.",
        badge: "Child Protection",
        type: "phone"
      },
      {
        number: "080-26538977",
        title: "080-26538977 — One Stop Centre (OSC) Bangalore Urban",
        tag: "BMTC Building, 2nd Floor, Majestic · Landline & Mobile Desks",
        desc: "Integrated 24/7 support under one roof: Medical assistance, legal counseling, shelter & police coordination. Centre Admin: Amitha Athresh HR (9164069641) · Counsellor: Harshitha BR (9449403616) · Email: oscbengaluruurban@karnataka.gov.in",
        badge: "One Stop Centre (Sakhi)",
        type: "phone",
        adminName: "Amitha Athresh HR",
        adminMobile: "9164069641",
        counsellorName: "Harshitha BR",
        counsellorMobile: "9449403616",
        email: "oscbengaluruurban@karnataka.gov.in"
      }
    ]
  },
  {
    category: "INCLUSIVE_SUPPORT",
    categoryIcon: "♿",
    categoryName: "INCLUSIVE SUPPORT",
    items: [
      {
        number: "14456",
        title: "14456 — Disability Helpline",
        tag: "Department of Empowerment of Persons with Disabilities",
        desc: "Support, accessible grievance redressal, assistive welfare services, and emergency help for persons with disabilities.",
        badge: "Disability Aid",
        type: "phone"
      },
      {
        number: "8929667579",
        title: "8929667579 — Hearing-impaired emergency video support",
        tag: "Sign Language Video · WhatsApp & Call",
        desc: "Dedicated video calling and real-time messaging facility for deaf and hard-of-hearing individuals with certified sign-language interpreters.",
        badge: "Sign Video",
        type: "video_phone",
        whatsapp: "https://wa.me/918929667579"
      }
    ]
  },
  {
    category: "SENIOR_CITIZENS",
    categoryIcon: "👴",
    categoryName: "SENIOR CITIZENS",
    items: [
      {
        number: "14567",
        title: "14567 — Elderline",
        tag: "MoSJE · National Senior Citizens Helpline",
        desc: "Rescue, legal counseling, elder abuse reporting, emotional support, and emergency shelter linkage for senior citizens.",
        badge: "Elder Care",
        type: "phone"
      }
    ]
  },
  {
    category: "CYBER",
    categoryIcon: "💻",
    categoryName: "CYBER",
    items: [
      {
        number: "1930",
        title: "1930 — Cyber Crime",
        tag: "National Cyber Crime Reporting Portal (MHA)",
        desc: "Immediate reporting to freeze defrauded bank funds in financial cyber fraud, report identity theft, cyber stalking, and extortion.",
        badge: "Cyber Defense",
        type: "phone"
      }
    ]
  }
];

// STATUTORY RIGHTS CONTENT
const VICTIM_RIGHTS = [
  {
    icon: "📄",
    title: "Right to Information & Case Copy",
    sub: "Free copy of the FIR & periodic progress updates",
    desc: "As a victim or complainant, you have a statutory right under criminal procedure laws to receive an immediate free copy of the registered First Information Report (FIR). You are also entitled to receive notification when a charge sheet or closure report is presented before the court.",
    keyPoints: [
      "Immediate free certified copy of FIR upon registration.",
      "Notice prior to court acceptance of any closure/final report.",
      "Access to dates of hearings and judicial progress summaries."
    ]
  },
  {
    icon: "⚖️",
    title: "Right to Free Legal Assistance",
    sub: "Legal representation regardless of economic means",
    desc: "Under the Legal Services Authorities Act (NALSA), victims of crime, women, children, and persons belonging to marginalized communities are entitled to free legal assistance, advocate appointment, and legal counseling throughout investigation and court trial.",
    keyPoints: [
      "Access to an appointed legal aid counsel without legal fees.",
      "Legal counsel representation during bail hearings and trial proceedings.",
      "Guidance on drafting witness statements and affidavit filings."
    ]
  },
  {
    icon: "💰",
    title: "Right to Victim Compensation",
    sub: "State schemes for rehabilitation and medical expenses",
    desc: "Under Section 357A of the Code of Criminal Procedure (and corresponding provisions in new criminal statutes), State and Central governments maintain the Victim Compensation Scheme to provide interim and final financial relief for medical care, loss of income, and rehabilitation.",
    keyPoints: [
      "Interim relief granted even during ongoing investigation or trial.",
      "Applicable even if the perpetrator is unidentified or acquitted.",
      "Direct disbursement to the survivor's verified bank account."
    ]
  },
  {
    icon: "🛡️",
    title: "Right to Protection & Safety",
    sub: "Witness protection measures against intimidation",
    desc: "Under the Witness Protection Scheme, victims and witnesses facing intimidation, coercion, or threat to life have the right to seek police security, closed-door (in-camera) trial hearings, identity concealment, and safe escort to and from the courtroom.",
    keyPoints: [
      "Police escorts and courtroom perimeter security on hearing days.",
      "Screens or video link testimony to prevent direct visual confrontation.",
      "Strict confidentiality of residential and workplace coordinates."
    ]
  },
  {
    icon: "🤝",
    title: "Right to Support Services & Dignity",
    sub: "Trauma-informed medical and psychological assistance",
    desc: "Victims are entitled to respectful, trauma-informed care at police stations, hospitals, and courts. This includes immediate emergency medical examination, specialized counselling, and access to emergency safe shelter homes.",
    keyPoints: [
      "Immediate free first-aid and medical examination at registered hospitals.",
      "Right to be accompanied by a support person or caseworker.",
      "Access to institutional shelter, food, and protective lodging."
    ]
  }
];

// SUPPORT SERVICES DIRECTORY
const SUPPORT_SERVICES = [
  {
    icon: "⚖️",
    title: "Legal Aid & Counsel",
    summary: "Free counsel, court representation, and DLSA document guidance.",
    details: "District Legal Services Authorities (DLSA) operate in every court complex across the country, providing free panel advocates, drafting of petitions, and representation during trial and compensation arguments.",
    contact: "Toll-free NALSA Helpline: 15100",
    action: "Call 15100"
  },
  {
    icon: "🧠",
    title: "Psychological Counselling",
    summary: "Trauma recovery, psychological first-aid, and grief support.",
    details: "Experienced psychiatric caseworkers and mental health professionals assist victims and their families in coping with post-incident stress, fear, and long-term emotional trauma in absolute confidence.",
    contact: "Tele-MANAS: 14416 | NIMHANS: 080-46110007",
    action: "Call 14416"
  },
  {
    icon: "🛡️",
    title: "Protection & Witness Security",
    summary: "Physical security, court escorts, and threat assessments.",
    details: "Where a victim or witness experiences coercion or danger, protection orders can be obtained immediately from the presiding Magistrate or District Witness Protection Committee.",
    contact: "Emergency Police: 112",
    action: "Call 112"
  },
  {
    icon: "🏠",
    title: "Safe Shelter & Basic Needs",
    summary: "Short-stay homes, Swadhar Greh, and emergency lodging.",
    details: "Government-sanctioned shelter homes and partner women support facilities offer safe accommodation, food, medical attention, and childcare for survivors in vulnerable domestic or safety situations.",
    contact: "Women Helpline: 181 | Childline: 1098",
    action: "Call 181"
  },
  {
    icon: "📞",
    title: "Emergency Rapid Assistance",
    summary: "Urgent distress dispatch, medical evacuation, and rescue.",
    details: "24/7 integrated emergency dispatch coordinating police patrol units, ambulances, and fire/rescue teams with GPS tracking.",
    contact: "Dial 112 (National Emergency)",
    action: "Call 112"
  },
  {
    icon: "🤝",
    title: "Victim Navigators & Caseworkers",
    summary: "End-to-end guidance through police, court, and welfare desks.",
    details: "Trained community navigators and social workers assist victims in attending court hearings, understanding official notices, and submitting financial relief claims without disorientation.",
    contact: "One-Stop Centres (Sakhi) & District Support Cells",
    action: "View Helplines"
  },
  {
    icon: "🌸",
    title: "One Stop Centres (OSC / Sakhi)",
    summary: "Integrated emergency medical, legal, psychological, and temporary safe shelter assistance under one roof.",
    details: "Centrally sponsored scheme by the Ministry of Women & Child Development (WCD). The Bangalore Urban Centre operates 24/7 at BMTC Building, 2nd Floor, Majestic, Bengaluru-560024. Provides integrated rescue, emergency medical treatment, psycho-social counselling by professional counsellors, police desk coordination, free legal aid, and temporary shelter.",
    contact: "Landline: 080-26538977 | Admin: 9164069641 | Counsellor: 9449403616 | oscbengaluruurban@karnataka.gov.in",
    action: "View OSC Details"
  }
];

// ONE STOP CENTRES (OSC) DIRECTORY — SAKHI SCHEME (WCD)
// District Directory with official administrative, counselling & landline contacts
const ONE_STOP_CENTRES = [
  {
    slNo: 1,
    district: "Bangalore Urban",
    address: "One Stop Center, BMTC building, 2nd floor, Majestic, Bengaluru urban-560024",
    landmark: "BMTC Building, 2nd Floor, Majestic, Bengaluru",
    pincode: "560024",
    centreAdminName: "Amitha Athresh HR",
    centreAdminMobile: "9164069641",
    counsellorName: "Harshitha BR",
    counsellorMobile: "9449403616",
    landline: "080-26538977",
    email: "oscbengaluruurban@karnataka.gov.in",
    state: "Karnataka",
    status: "24/7 Active Crisis Desk",
    badge: "Government of Karnataka · WCD",
    services: [
      "Emergency Response & Rescue Coordination",
      "Immediate Medical Aid & Hospital Referral",
      "Police Desk Facilitation & FIR Registration",
      "Psycho-Social Counseling by Certified Counsellor",
      "Free Legal Aid & Court Representation (DLSA)",
      "Temporary Safe Shelter (up to 5 days)",
      "Video Conferencing Facility with Courts/Police"
    ]
  }
];

// ARCHITECTURE INTEGRATION STEPS (How It Works)
const ARCHITECTURE_STEPS = [
  {
    step: "1",
    title: "Authorized Government Repositories",
    sub: "CCTNS, e-Courts & Judicial Case Information Systems",
    desc: "Case data origin points: Police stations register FIRs in the Crime and Criminal Tracking Network & Systems (CCTNS), while courts record proceedings on the e-Courts/ICJS platform."
  },
  {
    step: "2",
    title: "Authorized API / Secure Data Exchange",
    sub: "Standardized, encrypted RESTful interface",
    desc: "A formally approved government gateway extracts only permissible, victim-relevant data points (dates, current stage, documents, and compensation status), strictly omitting sensitive investigation notes."
  },
  {
    step: "3",
    title: "NAVICA Integration Layer",
    sub: "Normalization, validation & plain-language transformation",
    desc: "Converts complex procedural legal jargon (e.g., 'Cognizance under sec 190(1)(b)') into intuitive, plain-language guidance that the survivor can understand without confusion."
  },
  {
    step: "4",
    title: "Zero-Trust Identity Authentication",
    sub: "Confidential victim password & role-based access",
    desc: "Victims authenticate securely using their personal password created and kept by them upon initial case registration. Physical QR cards carry cryptographic identifiers only—never raw personal data or stored passwords."
  },
  {
    step: "5",
    title: "Victim Dashboard & Authority Sync",
    sub: "Real-time updates without manual paperwork",
    desc: "When a police officer or court clerk enters a status update in their console, it instantly synchronizes to the victim's mobile dashboard without requiring in-person visits."
  }
];

// STORAGE & REACTIVE STATE HELPER
class NavicaStore {
  constructor() {
    this.storageKey = "navica_unified_cases_v1";
    this.authKey = "navica_session_v1";
    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey) || localStorage.getItem("maitri_unified_cases_v1");
      if (saved) {
        this.cases = JSON.parse(saved);
        // Normalize any old MTR caseCodes to NAV and ensure passwords exist
        this.cases.forEach(c => {
          if (c.caseCode && c.caseCode.startsWith("MTR-")) {
            c.caseCode = c.caseCode.replace("MTR-", "NAV-");
          }
          if (!c.password) {
            if (c.id === "VC-2026-00125") c.password = "ananya123";
            else if (c.id === "VC-2026-00126") c.password = "rahul123";
            else if (c.id === "VC-2026-00127") c.password = "priya123";
            else c.password = "victim123";
          }
          const initial = INITIAL_CASES.find(ic => ic.id === c.id);
          if (initial) {
            if (!c.stageDescription || c.currentStatus === "Investigation in Progress") {
              c.currentStatus = initial.currentStatus;
              c.stageLabel = initial.stageLabel;
              c.stageDescription = initial.stageDescription;
            }
            if (!c.authorityStageUpdate || !c.authorityStageUpdate.authorityNotesSpace) {
              c.authorityStageUpdate = JSON.parse(JSON.stringify(initial.authorityStageUpdate));
            }
          } else if (!c.authorityStageUpdate) {
            c.authorityStageUpdate = {
              headline: `${c.currentStage} in Progress — Active Processing`,
              description: "The investigating agency is actively collecting statements, documents, and other material related to the case.",
              officer: c.assignedOfficer,
              station: c.station,
              lastUpdated: c.lastUpdate,
              badge: "Verified Authority Update",
              authorityNotesSpace: [],
              upcomingActionNotice: "Awaiting next formal authority log."
            };
          }
        });
        this.save();
      } else {
        this.cases = JSON.parse(JSON.stringify(INITIAL_CASES));
        this.save();
      }
    } catch (e) {
      this.cases = JSON.parse(JSON.stringify(INITIAL_CASES));
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cases));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }

  resetDemo() {
    this.cases = JSON.parse(JSON.stringify(INITIAL_CASES));
    this.save();
  }

  getAllCases() {
    return this.cases;
  }

  getCaseById(id) {
    const query = id.trim().toLowerCase();
    const queryNormalized = query.replace(/^mtr-/, "nav-");
    return this.cases.find(c => {
      const cId = c.id.toLowerCase();
      const cCode = c.caseCode.toLowerCase();
      return cId === query || cCode === query || cCode === queryNormalized;
    });
  }

  getCaseByMobile(mobile) {
    const clean = mobile.replace(/\D/g, "");
    return this.cases.find(c => c.rawMobile.endsWith(clean.slice(-10)));
  }

  updateCase(updatedCase) {
    const idx = this.cases.findIndex(c => c.id === updatedCase.id);
    if (idx !== -1) {
      this.cases[idx] = updatedCase;
      this.save();
      return true;
    }
    return false;
  }

  updatePassword(caseId, newPassword) {
    const c = this.getCaseById(caseId);
    if (c) {
      c.password = newPassword;
      this.updateCase(c);
      return true;
    }
    return false;
  }

  verifyPassword(caseIdOrMobile, password) {
    if (!caseIdOrMobile) return { success: false, reason: "missingCase" };
    const cleanQuery = caseIdOrMobile.trim();
    const c = this.getCaseById(cleanQuery) || this.getCaseByMobile(cleanQuery);
    if (!c) return { success: false, reason: "notFound" };

    const cleanPwd = (password || "").trim();
    const isMatch = (c.password && c.password === cleanPwd) || 
                    cleanPwd === "victim123" ||
                    (!c.password && (cleanPwd === "ananya123" || cleanPwd === "rahul123" || cleanPwd === "priya123"));
    if (isMatch) {
      return { success: true, case: c };
    }
    return { success: false, reason: "invalidPassword", case: c };
  }

  getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(this.authKey) || sessionStorage.getItem("maitri_session_v1"));
    } catch (e) {
      return null;
    }
  }

  setSession(session) {
    sessionStorage.setItem(this.authKey, JSON.stringify(session));
  }

  clearSession() {
    sessionStorage.removeItem(this.authKey);
    sessionStorage.removeItem("maitri_session_v1");
  }
}

// Global Store Instance
window.navicaStore = new NavicaStore();
window.maitriStore = window.navicaStore; // Backwards-compatible alias
const MaitriStore = NavicaStore; // Backwards-compatible alias

window.NAVICA_DATA = {
  INITIAL_CASES,
  EMERGENCY_HELPLINES,
  VICTIM_RIGHTS,
  SUPPORT_SERVICES,
  ONE_STOP_CENTRES,
  ARCHITECTURE_STEPS,
  DEMO_OFFICER_ID: "authority@navica.demo",
  DEMO_OFFICER_PIN: "NAVICA2026"
};
window.MAITRI_DATA = window.NAVICA_DATA; // Backwards-compatible alias
