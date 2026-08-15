# Renewise: Smart Subscription Guardian

Create an appp on   working process would be 

the app would ask to allow permissions for: 

email and screentime 

we would require the api for both email and screentime   FlowWatch – Smart Subscription & Renewal Management System

1. Project Overview

FlowWatch is a smart mobile application that helps users manage recurring subscriptions, free trials, and renewal payments. Instead of asking users to manually enter expenses, the application securely scans Gmail (with the user's permission) to identify payment-related emails. It extracts important information such as the merchant name, payment amount, renewal date, and billing frequency, then reminds users before they are charged. The goal is to reduce unnecessary recurring expenses and help users make better financial decisions.

2. Problem Statement

Many users forget to cancel free trials, continue paying for unused subscriptions, or miss insurance and membership renewal dates because important emails get buried under promotional messages. Existing budgeting apps mainly track past expenses but do not help users avoid future recurring payments.

3. Proposed Solution

FlowWatch automatically discovers subscriptions from Gmail using simple pattern matching (Regex). It stores only the required information, displays upcoming payments on a dashboard, sends reminders before renewals, and provides links to manage or cancel subscriptions.

4. System Workflow

Step 1: User signs in using Google Login and grants Gmail access.

Step 2: Gmail API searches for payment-related emails using keywords like 'receipt', 'subscription', 'renewal', 'invoice', 'payment successful', and 'trial'.

Step 3: Regex extracts the merchant name, amount, renewal date, and billing frequency. Personal email content is not stored.

Step 4: The extracted information is saved in Firebase Firestore.

Step 5: A Flutter dashboard displays active subscriptions, upcoming renewals, monthly/yearly spending, and charts.

Step 6: Firebase Cloud Messaging (FCM) sends reminders 3 days before renewal.

Step 7: Users can open the official subscription management page to keep or cancel the subscription.

Step 8: The app calculates yearly subscription costs and shows the total recurring spending.

Step 9: The optional 'Trial Shark' feature reminds users before free trials expire.

5. Technologies Used

• Flutter – Mobile application

• Gmail API – Read payment-related emails

• Regex – Extract merchant, amount, and renewal date

• Firebase Firestore – Store subscription details

• Firebase Cloud Messaging – Push notifications

• Google Sign-In – User authentication

6. Modules

1. User Authentication

2. Gmail Scanner

3. Subscription Information Extractor

4. Dashboard & Analytics

5. Reminder & Notification Module

6. Subscription Management

7. Advantages

• No manual expense entry

• Helps avoid unnecessary recurring payments

• Secure and privacy-friendly

• Easy-to-use dashboard

• Useful for students and working professionals

8. Future Enhancements

• Multiple Gmail account support

• Bank statement integration

• AI-based spending insights

• Family subscription sharing

• Budget alerts

9. Expected Outcome

FlowWatch helps users discover all recurring subscriptions in one place, receive timely renewal reminders, understand their yearly subscription expenses, and reduce unnecessary financial loss. The project combines Gmail integration, Regex-based extraction, Firebase services, and a simple Flutter interface to provide a practical and user-friendly financial management solution.      give me the app with backend everything to be connected and launcged   rchitecture

                +--------------------+

                |   Flutter App      |

                +---------+----------+

                          |

                          |

                 Google Sign-In

                          |

                          v

                 +----------------+

                 | Google Account |

                 +----------------+

                          |

              Gmail OAuth Permission

                          |

                          v

                 Gmail API (Read Only)

                          |

                          |

                 Cloud Function / Backend

                          |

                Regex Extraction Engine

                          |

                          |

               Firebase Firestore Database

                          |

        +-----------------+----------------+

        |                                  |

 Dashboard                    Notification Service

        |                                  |

        |                           Firebase Cloud Messaging

        |                                  |

        +-----------------+----------------+

                          |

                    Mobile Notifications

Complete Tech Stack

Frontend

 Flutter

 Dart

Backend

 Firebase Authentication

 Firebase Firestore

 Firebase Cloud Functions

 Firebase Cloud Messaging

APIs

 Gmail API

 Google OAuth

Extraction

 Regex

 Optional AI extraction later

Features

Login

 Google Sign In

Permission screen

 Gmail Read Only

 Notification Permission

Dashboard

Shows

Netflix

₹649/month

Renews Aug 5

Spotify

₹119/month

Amazon Prime

₹1499/year

Google One

Insurance

Gym Membership

Disney+

YouTube Premium

Charts

Monthly spending

Pie chart

Yearly spending

Upcoming renewals

Free trials

Gmail Scanner

Search query

receipt

invoice

subscription

renewal

trial

payment successful

auto debit

membership

Example Gmail Query

label:inbox (

subscription OR

receipt OR

invoice OR

renewal OR

payment successful

)

Regex extraction

Extract

Merchant

Netflix

Spotify

Adobe

Google

Microsoft

Amount

₹649

$12.99

₹1499

Renewal Date

August 15

15 Aug 2026

2026-08-15

Billing

Monthly

Quarterly

Yearly

Firestore Structure

users

    userId

        subscriptions

            subscriptionId

                merchant

                amount

                renewalDate

                frequency

                category

                gmailMessageId

                trial

                active

Notification Module

Automatically

7 days before

3 days before

1 day before

Renewal day

Example

Spotify renews tomorrow.

Amount

₹119

Trial Shark

Detect

Free Trial

Trial Ends

Start your free month

Enjoy 30 days free

Reminder

Your Canva trial expires in 2 days.

Analytics

Monthly spending

Yearly spending

Category

Entertainment

Education

Software

Insurance

Gaming

Cloud Storage

Settings

Dark mode

Backup

Export CSV

Delete Account

Manage Permissions

Rescan Gmail

Backend

Cloud Function

1.

User signs in

↓

2.

Get OAuth Token

↓

3.

Read Gmail

↓

4.

Extract subscriptions

↓

5.

Save Firestore

↓

6.

Trigger Notifications

↓

7.

Update Dashboard

Security

Use OAuth only.

Read-only Gmail access.

Do not store email body.

Store only

Merchant

Amount

Renewal Date

Frequency

Encrypt sensitive information.

Firestore security rules.

Folder Structure

flowwatch/

lib/

screens/

widgets/

services/

models/

providers/

utils/

firebase/

cloud_functions/

functions/

regex/

firestore/

notifications/

assets/

Estimated Size

Approximately:

 Flutter frontend: 12,000–18,000 lines

 Firebase Cloud Functions: 2,000–4,000 lines

 Regex engine: 1,000+ lines

 Authentication and Gmail integration: 1,500+ lines

 Notifications and analytics: 2,000+ lines

Overall, this is roughly a 20,000–30,000 line production application.

One important consideration

Your proposal mentions requesting Screen Time permission. This is platform-specific:

Android: You can approximate app usage by asking the user to grant the Usage Access permission (PACKAGE_USAGE_STATS). This requires special user approval in Settings and has limitations.

iOS: There is no general-purpose Screen Time API available for all apps. Access is restricted through Apple's Family Controls and Device Activity frameworks and requires special entitlements. You cannot freely read a user's screen time for arbitrary apps.

So the Gmail integration is straightforward with OAuth, but screen-time tracking must be designed differently for Android and iOS.

Deployment

To launch the app publicly, you'll also need:

 A Firebase project configured with Authentication, Firestore, Cloud Functions, and Cloud Messaging.

 A Google Cloud project with the Gmail API enabled and OAuth consent configured.

 Android signing keys and/or Apple Developer credentials.

 Privacy policy and terms of service describing Gmail data usage.

 Play Store and/or App Store developer accounts.

I can help you build all of this, but it needs to be developed incrementally rather than generated as one complete, deployable application in a single response.

build and give me full app with codes

I can absolutely help you build the entire application, but I can't provide a complete production-ready app (20,000–30,000+ lines of code across dozens of files) in a single chat response.

A full app like FlowWatch includes:

 Flutter frontend (40–70 files)

 Firebase backend

 Cloud Functions

 Gmail OAuth integration

 Gmail API implementation

 Regex extraction engine

 Firestore database

 Push notifications (FCM)

 Analytics dashboard

 Charts

 Google Cloud configuration

 Firebase configuration

 Android & iOS setup

 Testing and deployment configuration

That's far beyond what can fit in one response.

What I can do instead

I can generate the entire project module by module until it's complete, including:

 ✅ Flutter project

 ✅ All Dart source code

 ✅ Firebase backend

 ✅ Cloud Functions

 ✅ Gmail API integration

 ✅ Authentication

 ✅ Firestore models

 ✅ Notification service

 ✅ Regex parser

 ✅ Dashboard UI

 ✅ Settings

 ✅ Android & iOS configuration

 ✅ Deployment instructions   our app name ids renewise and create aaa beautiful and veery unique and with lot of fetaures this appppp i have already amde authentication firebase link google sign in i want the app dashboards nd all features uniquelty and beaiutifully shownwith createive way of dispalying       i amde this app integration of google sgn in and ll using flutter dart so i wnat the ui ux and the app working properly with backend soooo the backend shud be from rela wolrd things and also i wanttt a uniqueeeeeeeeeeeeeeeeeee the best design of this appppppp with alll features and special features also including it

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://smart-renewal-guard.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/898d19f8-08a1-43ad-bee5-5552df372c7e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
