/* ============================= Supabase ============================= */
// Replace with your project details from Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = "https://api.thesannad.com";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzkwNDU0MTM0LCJleHAiOjE5NDgxMzQxMzR9.8O74oaHNmyzsZz2i4md35He-E3TODOFPOi4hk3j4uK0";

// True once you swap in your real project URL/key. Until then the app runs
// on local in-memory data only, so every button still works — it just won't
// save anywhere or sync between visitors.
const SUPABASE_CONFIGURED = !SUPABASE_URL.includes("YOUR_PROJECT_ID") && !SUPABASE_ANON_KEY.includes("YOUR_ANON_PUBLIC_KEY");

// window.supabase is missing when the CDN script failed to load or failed its integrity check.
if (SUPABASE_CONFIGURED && !window.supabase) {
  console.warn('Sanad: Supabase CDN script failed to load (network/CORS/blocked) — app will run on local data only.');
}
const supabaseClient = SUPABASE_CONFIGURED && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

if (!SUPABASE_CONFIGURED) {
  console.warn("Sanad: Supabase isn't configured yet (still using the placeholder URL/key). Housing and forum posts will only live in this browser tab until you add your real project credentials at the top of the script.");
}

/* Expected schema — see schema.sql in the project root for the full,
   copy-pasteable version (tables, RLS, and the signup_user/login_user
   functions that back the username+password sign-in below). Summary:

   app_users(id, username, password_hash, name, phone, created_at)
   housing_listings(..., poster_user_id references app_users)
   forum_posts(..., poster_user_id references app_users)
   forum_replies(id, post_id references forum_posts, reply_text)
   share_links(id, user_id references app_users, page, code)
   share_clicks(id, share_link_id references share_links)
   buddies(id, user_id references app_users, help_areas, bio, whatsapp)

   housing_listings, forum_posts/forum_replies, share_links/share_clicks,
   and buddies stay publicly readable via RLS (this is a public board).
   app_users is the one exception: it's locked down (no direct anon
   access at all) because password_hash lives there — every read/write
   to it goes through the two SECURITY DEFINER functions instead. */

/* ============================= i18n ============================= */
const translations = {
en: {
  brandName:"Sanad · سند", brandTag:"Your support system in Saudi Arabia",
  navHome:"Home", navGuide:"Guide", navHousing:"Feed", navCommunity:"Community",
  chipAll:"All", chipHousing:"Housing", chipInquiries:"Inquiries", chipGuides:"Tips",
  qnGuideTitle:"Know your rights", qnGuideSub:"Labor law, Qiwa, Iqama & banking, explained simply",
  qnHousingTitle:"Find a room", qnHousingSub:"Shared housing across 6 major cities",
  qnCommunityTitle:"Ask the community", qnCommunitySub:"Real answers from people already living here — not a random Facebook group",
  guideEyebrow:"Knowledge guide hub", guideTitle:"Understand the system before it confuses you",
  guideSub:"Short, plain-language explainers on the things every worker eventually needs.",
  housingEyebrow:"Roommate & shared housing board", housingTitle:"Find your next room",
  housingSub:"Real listings from tenants and property owners. Contact directly on WhatsApp — no middleman.",
  housingPostBtn:"New post",
  lblCity:"City", lblRent:"Monthly rent (SAR)", lblRoomType:"Room type",
  rtShared:"Shared room", rtPrivate:"Private room", rtBed:"Bed space",
  lblGender:"Gender preference", genAny:"Any", genMale:"Men only", genFemale:"Women only",
  lblNationality:"Nationality / language preference", natAny:"Any", natArab:"Arab",
  lblBills:"Electricity & water included", lblDesc:"Description", descPh:"e.g. Close to metro, quiet flat, 3 flatmates already...",
  lblWhatsapp:"WhatsApp number", waInvalid:"Enter a valid WhatsApp number, for example 05XXXXXXXX.", waSaudiInvalid:"Enter a Saudi mobile number: 9 digits starting with 5.",
  filterAllCities:"All cities", filterAnyBudget:"Any budget", filterUnder500:"Under 500", filterBudget500to800:"500 – 800 SAR", filterBudget800to1200:"800 – 1,200 SAR",
  filterAnyNat:"Any nationality pref.",
  perMonth:"/ month", contactWA:"WhatsApp", billsIncluded:"Bills included", billsShared:"Bills shared",
  postedBy:"Posted by",
  communityEyebrow:"Community Q&A", communityTitle:"Ask people who've already figured it out",
  communitySub:"Peer answers on housing, legal questions, jobs, and everyday life.",
  lblCategory:"Category", catHousing:"Housing", catLegal:"Legal", catJobs:"Jobs", catLife:"General life",
  lblQuestion:"Your question", questionPh:"Type your question here...",
  catAll:"All", replies:"replies", viewReplies:"View replies", hideReplies:"Hide replies",
  repliedBy:"Replied by", replyPh:"Write a helpful answer...", replySubmit:"Reply", replySignInHint:"Sign in to answer this question.",
  footNote:"Sanad is a community platform. Always verify official procedures on government portals such as Qiwa, Absher, and Muqeem.",
  emergencyTitle:"Emergency contacts", em911:"Emergency (Police)", em998:"Civil Defense (Fire)", em997:"Ambulance (Red Crescent)", em19911:"Ministry of HR — Labor Inquiries",
  navProfile:"Profile", shareLabel:"Share", copyLink:"Copy link", linkCopied:"Link copied!", shareViaWhatsapp:"Share via WhatsApp", shareThisPage:"Share this page",
  lblName:"Your name", signOutBtn:"Sign out",
  communityTabQA:"Q&A", communityTabBuddies:"Buddies", becomeBuddyBtn:"Become a buddy — help newcomers",
  buddyFormTitle:"Sign up as a buddy", buddyFormHint:"Newcomers will be able to see your profile and reach you on WhatsApp.",
  lblHelpAreas:"What can you help with?", helpHousing:"Finding housing", helpPaperwork:"Paperwork & procedures", helpOrientation:"General orientation",
  lblBio:"Short bio", bioPh:"e.g. Lived in Riyadh for 3 years, happy to help with Absher/Nafath setup...",
  buddyFormSubmit:"Publish my buddy profile", noBuddiesYet:"No buddies listed yet — be the first!", helpsWith:"Can help with",
  videoLabel:"Room photos or video (optional)", videoHint:"Up to 10 photos, or one video of up to 60 seconds and 50 MB. Photos are made smaller automatically so they upload fast.",
  mediaVideoTooBig:"This video is {mb} MB. Videos can be up to 50 MB. Try a shorter clip, or record in 1080p instead of 4K.", mediaVideoTooLong:"This video is {s} seconds. Videos can be up to 60 seconds.", mediaTooManyPhotos:"You picked {n} photos. Only the first 10 will be posted.", mediaPhotosPicked:"{n} photos ready", mediaVideoPicked:"Video ready: {mb} MB, {s} seconds", uploadingPhotosProgress:"Uploading photos... {done} of {total}", uploadFailed:"Upload failed. Check your connection and try again.", publishFailed:"Couldn't publish. Please try again.", uploadingVideo:"Uploading video...",
  photoN:"Photo {n}", prevPhoto:"Previous photo", nextPhoto:"Next photo",
  qcTextLabel:"What's on your mind?", qcTextPh:"Share a tip that could help someone new...",
  qcImageLabel:"Add a photo (optional)", uploadingImage:"Uploading image...",
  viewAndAnswer:"View & answer", fromCommunity:"From Community",
  requiredTag:"(required)", optionalTag:"(optional)", natOther:"Other", lblNatOther:"Specify nationality / language",
  profileEyebrow:"Your account",
  profileTitleSignedOut:"You're browsing as a guest",
  profileSubSignedOut:"Browsing, liking, and saving all work without an account. An account is only needed to post or contact someone.",
  myLinksTitle:"My share links", myLinksHint:"Generate a personal link for any section — you'll see how many times each one gets clicked.",
  generateLinkBtn:"Get link", clicksLabel:"clicks",
  filterAnyGender:"Any gender", filterMaleOnly:"Men only", filterFemaleOnly:"Women only",
  filterAnyRoom:"Any room type", filterShared:"Shared", filterPrivate:"Private", filterBed:"Bed",
  filtersLabel:"Filters", filtersReset:"Reset", filtersShow:"Show results",
  lblBudget:"Budget per month", lblNatShort:"Nationality", lblGenderShort:"Gender",
  noListingsTitle:"No rooms match these filters", noListingsSub:"Try a wider budget, or clear a filter or two.",
  likeLabel:"Like", saveLabel:"Save",
  deleteLabel:"Delete", deleteConfirm:"Delete this for good? This can't be undone.", deleteFailed:"Couldn't delete this. Check your connection, or sign out and sign in again, then try once more.", removeBuddyProfile:"Remove my buddy profile",
  statMyListings:"Listings", statMyQuestions:"Questions", statMyClicks:"Link clicks",
  tabMyPosts:"Posts", tabLiked:"Liked", memberSince:"Member since", memberFallback:"Member",
  noPostsYet:"No listings posted yet", noLikedYet:"Rooms you like will show up here", noSavedYet:"Things you save will show up here",
  backBtn:"Back", loadingProfile:"Loading…", publicProfileUnavailable:"Profile not available",
  communityTabLeaderboard:"Top Helpers", leaderboardMonthLabel:"Top Helpers —",
  lbFilterAll:"Everyone", lbFilterOpenToWork:"Open to work", lbStatReplies:"replies", lbStatVotes:"upvotes",
  noHelpersYet:"No one's earned this yet this month — answer a question to be the first!", noQuestionsYet:"No questions yet — be the first to ask!",
  badgeTopHelper:"Top Helper this month", shareMyRank:"Share my rank",
  openToWorkToggleLabel:"Visible to employers looking to hire",
  openToWorkHint:"Turning this on shows your name and lets employers message you on WhatsApp from the Top Helpers list.",
  openToWorkWhatsappLabel:"WhatsApp number to show employers", saveBtn:"Save",
  composerNewPost:"New post",
  qcStep1Title:"What do you want to post?", qcStep1Sub:"Pick one — you can change your mind anytime before you submit.",
  qcOptHousingTitle:"Room or bed space", qcOptHousingSub:"You have a spare space and need a tenant",
  qcOptInquiryTitle:"Question", qcOptInquirySub:"Get an answer from people who've done it",
  qcOptGuideTitle:"Tip", qcOptGuideSub:"Something you learned that could help others",
  qcMoreDetails:"More details (optional)", qcNext:"Next", qcPublish:"Publish", sarLabel:"SAR",
  guestSavedLabel:"Saved", guestLanguageLabel:"Language", guestLanguageValue:"العربية · English · اردو · हिंदी · বাংলা",
  likedCountLabel:"{n} liked on this phone", savedCountLabel:"{n} saved on this phone",
  signInBtnShort:"Log in / Sign up",
  authErrorInvalid:"Wrong username or password.", authErrorTooMany:"Too many wrong attempts. Wait 15 minutes and try again.", authErrorTooOften:"Too many new accounts from this network. Try again in an hour.", authErrorMissing:"Enter a username and password.", authErrorNetwork:"Couldn't reach the server — try again.", authErrorShort:"Password must be at least 6 characters.", authErrorTaken:"That username is already taken.", loginHint:"Log in with your username and password.", loginTabLabel:"Log in", signInSubmit:"Log in", signupHint:"Pick a username and password — that's all you need.", signupTabLabel:"Sign up",
  lblUsername:"Username", lblPassword:"Password",
  authTitle:"Sign in", lblEmail:"Email", sendCode:"Send code", useUsernameLogin:"I have a username and password", lblCode:"Code", verifyCode:"Verify", resendCode:"Send a new code", changeEmail:"Change email", continueLabel:"Continue", useEmailLogin:"Sign in with email instead",
  authHintEmail:"Enter your email. We'll send you a code to sign in or create your account.", authHintLink:"One more step: add your email to keep your account safe. We'll send you a code there.", authHintCode:"Enter the code we emailed to {email}. If you can't find it, check your spam folder.", authHintName:"Welcome to Sanad! What name should other people see?", codeResent:"We emailed you a new code.",
  authErrorEmail:"Enter a valid email, for example name@example.com.", authErrorCode:"Enter the code from the email.", authErrorWrongCode:"That code is wrong. Check it and try again.", authErrorCodeExpired:"That code has expired. Tap \"Send a new code\".", authErrorTooManyCodes:"Too many tries. Wait 15 minutes and try again.", authErrorSendFailed:"We couldn't send a code to this email. Check it and try again.", authErrorEmailTaken:"This email already belongs to another account. Sign in with email instead.", authErrorName:"Enter a name.",
  themeToDark:"Switch to dark mode", themeToLight:"Switch to light mode", langMenuLabel:"Change language",
  // "Looking for work?": first-visit question, entry points, work page and offer check
  welcomeTitle:"Welcome to Sanad", welcomeLangLabel:"Your language", welcomeQuestion:"Where are you now?",
  welcomeInSaudi:"I'm in Saudi Arabia", welcomeInSaudiSub:"Find a room, know your rights, ask other workers",
  welcomeAbroad:"I'm outside Saudi Arabia and want to work there", welcomeAbroadSub:"Come the legal way and spot fake job offers", welcomeSkip:"Skip for now",
  workPillLabel:"Looking for work?", workEntryTitle:"Looking for work in Saudi Arabia?", workEntrySub:"Start here before you pay anyone",
  workEyebrow:"Coming to Saudi Arabia", workTitle:"Looking for work in Saudi Arabia?",
  workSub:"Start here before you pay anyone. Sanad does not recruit workers, does not sell visas and never asks you for money.",
  workCountryLabel:"Which country are you coming from?", workCountryPK:"Pakistan", workCountryIN:"India", workCountryOther:"Another country", workCountryHint:"Choose your country to see its steps.", workSaudiLabel:"Saudi Arabia",
  checkTitle:"Check your job offer", checkSub:"6 quick questions. Your answers stay on your phone.", checkStart:"Start the check", checkProgress:"Question {n} of {total}", ansYes:"Yes", ansNo:"No", ansUnsure:"Not sure",
  checkQ1:"Did anyone ask you to pay for the visa?",
  checkE1:"In Saudi Arabia the employer pays the recruitment fees, the work permit and the iqama (Labor Law, Article 40). Being asked for a \"visa price\" is a common sign of a scam. A licensed agent in your own country may take only a fixed service charge, with a receipt.",
  checkQ2:"Did they offer a \"free visa\" (Azad visa) that lets you work for anyone?",
  checkE2:"A work visa is issued for one employer. There is no legal \"free visa\" that lets you work for anyone.",
  checkQ3:"Is it a work visa (not a visit, Umrah, Hajj or family visa)?",
  checkE3:"Working on a visit, Umrah, Hajj or family visa is not allowed. People who do it can be detained, fined, deported and banned from coming back.",
  checkQ4:"Is your agent licensed by your own government?",
  checkE4:"Only a licensed agent may arrange a job abroad: in Pakistan a licensed Overseas Employment Promoter (OEP), in India a Recruiting Agent registered on eMigrate. A travel agent is not one.",
  checkQ5:"Have you read the written contract, in a language you understand?",
  checkE5:"Before you travel, check the job title, salary, working hours, housing and contract length. Keep a copy, and never sign a blank paper.",
  checkQ6:"Do you know the name of the company or person you will work for?",
  checkE6:"A real job has a named employer. The employer on your visa, your contract and your offer should be the same.",
  resultDangerTitle:"Stop: this offer has serious warning signs", resultDangerBody:"Don't pay any more money or hand over documents until you have checked. Ask workers already in Saudi Arabia on Sanad, or call your government's helpline.",
  resultCautionTitle:"Be careful: check these first", resultCautionBody:"Some answers need checking before you pay anything or travel.",
  resultOkTitle:"No warning signs in your answers", resultOkBody:"Good. Still check your visa on the official website and keep copies of your contract and receipts before you travel.",
  resultFlagsLabel:"What to check", resultYourAnswer:"Your answer: {answer}", checkAgain:"Check another offer",
  workAskTitle:"Ask workers who are already in Saudi Arabia", workAskSub:"Post your question in Community. Answers come from other workers, not officials. Never pay anyone who messages you about a visa.",
  workAskBtn:"Ask a question", workSeeQuestionsBtn:"See questions", catArrival:"Before arrival",
  workDisclaimer:"Sanad is not a recruitment agency. We checked this page against official government sources in November 2026, but rules change: always confirm on the official websites.",
},
ar: {
  brandName:"سند · Sanad", brandTag:"سندك في السعودية",
  navHome:"الرئيسية", navGuide:"الدليل", navHousing:"الفيد", navCommunity:"المجتمع",
  chipAll:"الكل", chipHousing:"سكن", chipInquiries:"استفسارات", chipGuides:"نصائح",
  qnGuideTitle:"اعرف حقوقك", qnGuideSub:"نظام العمل، قوى، الإقامة والبنوك بشرح مبسّط",
  qnHousingTitle:"ابحث عن غرفة", qnHousingSub:"سكن مشترك في ٦ مدن رئيسية",
  qnCommunityTitle:"اسأل المجتمع", qnCommunitySub:"إجابات حقيقية من أشخاص يعيشون هنا فعلاً — وليس مجموعة فيسبوك عشوائية",
  guideEyebrow:"مركز الدليل المعرفي", guideTitle:"افهم النظام قبل أن يربكك",
  guideSub:"شروحات قصيرة وبلغة بسيطة لكل ما يحتاجه العامل عاجلاً أم آجلاً.",
  housingEyebrow:"لوحة السكن المشترك والزملاء", housingTitle:"ابحث عن غرفتك القادمة",
  housingSub:"إعلانات حقيقية من مستأجرين وملاك عقارات. تواصل مباشرة عبر واتساب — بدون وسيط.",
  housingPostBtn:"منشور جديد",
  lblCity:"المدينة", lblRent:"الإيجار الشهري (ريال)", lblRoomType:"نوع الغرفة",
  rtShared:"غرفة مشتركة", rtPrivate:"غرفة خاصة", rtBed:"سرير فقط",
  lblGender:"تفضيل الجنس", genAny:"الكل", genMale:"رجال فقط", genFemale:"نساء فقط",
  lblNationality:"تفضيل الجنسية / اللغة", natAny:"أي جنسية", natArab:"عربي",
  lblBills:"الكهرباء والماء شاملة", lblDesc:"الوصف", descPh:"مثال: قريب من المترو، شقة هادئة، ٣ سكان حالياً...",
  lblWhatsapp:"رقم واتساب", waInvalid:"أدخل رقم واتساب صحيحًا، مثل 05XXXXXXXX.", waSaudiInvalid:"أدخل رقم جوال سعودي: 9 أرقام تبدأ بـ 5.",
  filterAllCities:"كل المدن", filterAnyBudget:"أي ميزانية", filterUnder500:"أقل من ٥٠٠", filterBudget500to800:"٥٠٠ – ٨٠٠ ريال", filterBudget800to1200:"٨٠٠ – ١٬٢٠٠ ريال",
  filterAnyNat:"أي تفضيل جنسية",
  perMonth:"/ شهرياً", contactWA:"واتساب", billsIncluded:"الفواتير شاملة", billsShared:"الفواتير مشتركة",
  postedBy:"نشره",
  communityEyebrow:"أسئلة وأجوبة المجتمع", communityTitle:"اسأل من سبقك بالتجربة",
  communitySub:"إجابات من زملاء حول السكن والمسائل القانونية والعمل والحياة اليومية.",
  lblCategory:"التصنيف", catHousing:"السكن", catLegal:"قانوني", catJobs:"وظائف", catLife:"حياة عامة",
  lblQuestion:"سؤالك", questionPh:"اكتب سؤالك هنا...",
  catAll:"الكل", replies:"ردود", viewReplies:"عرض الردود", hideReplies:"إخفاء الردود",
  repliedBy:"ردّ عليه", replyPh:"اكتب إجابة مفيدة...", replySubmit:"رد", replySignInHint:"سجّل الدخول للإجابة على هذا السؤال.",
  footNote:"سند منصة مجتمعية. تأكد دائماً من الإجراءات الرسمية عبر البوابات الحكومية مثل قوى وأبشر ومقيم.",
  emergencyTitle:"أرقام الطوارئ", em911:"الطوارئ (الشرطة)", em998:"الدفاع المدني (الإطفاء)", em997:"الإسعاف (الهلال الأحمر)", em19911:"وزارة الموارد البشرية — استفسارات العمل",
  navProfile:"أنا", shareLabel:"مشاركة", copyLink:"نسخ الرابط", linkCopied:"تم نسخ الرابط!", shareViaWhatsapp:"مشاركة عبر واتساب", shareThisPage:"شارك هذه الصفحة",
  lblName:"اسمك", signOutBtn:"تسجيل الخروج",
  communityTabQA:"أسئلة وأجوبة", communityTabBuddies:"الرفقاء", becomeBuddyBtn:"كن رفيقاً — ساعد الوافدين الجدد",
  buddyFormTitle:"سجّل كرفيق", buddyFormHint:"سيتمكن الوافدون الجدد من رؤية ملفك الشخصي والتواصل معك عبر واتساب.",
  lblHelpAreas:"بماذا يمكنك المساعدة؟", helpHousing:"إيجاد السكن", helpPaperwork:"الأوراق والإجراءات", helpOrientation:"التوجيه العام",
  lblBio:"نبذة قصيرة", bioPh:"مثال: أعيش في الرياض منذ 3 سنوات، يسعدني المساعدة في إعداد أبشر ونفاذ...",
  buddyFormSubmit:"نشر ملفي كرفيق", noBuddiesYet:"لا يوجد رفقاء بعد — كن الأول!", helpsWith:"يمكنه المساعدة في",
  videoLabel:"صور أو فيديو للغرفة (اختياري)", videoHint:"حتى 10 صور، أو فيديو واحد مدته حتى 60 ثانية وحجمه حتى 50 ميغابايت. يتم تصغير الصور تلقائياً لترفع بسرعة.",
  mediaVideoTooBig:"حجم هذا الفيديو {mb} ميغابايت. الحد الأقصى 50 ميغابايت. جرّب مقطعاً أقصر، أو صوّر بدقة 1080p بدلاً من 4K.", mediaVideoTooLong:"مدة هذا الفيديو {s} ثانية. الحد الأقصى 60 ثانية.", mediaTooManyPhotos:"اخترت {n} صور. سيتم نشر أول 10 صور فقط.", mediaPhotosPicked:"{n} صور جاهزة", mediaVideoPicked:"الفيديو جاهز: {mb} ميغابايت، {s} ثانية", uploadingPhotosProgress:"جارٍ رفع الصور... {done} من {total}", uploadFailed:"فشل الرفع. تحقق من اتصالك وحاول مرة أخرى.", publishFailed:"تعذّر النشر. حاول مرة أخرى.", uploadingVideo:"جارٍ رفع الفيديو...",
  photoN:"صورة {n}", prevPhoto:"الصورة السابقة", nextPhoto:"الصورة التالية",
  qcTextLabel:"ما الذي يدور في ذهنك؟", qcTextPh:"شارك نصيحة قد تفيد شخصاً جديداً...",
  qcImageLabel:"أضف صورة (اختياري)", uploadingImage:"جارٍ رفع الصورة...",
  viewAndAnswer:"عرض والإجابة", fromCommunity:"من المجتمع",
  requiredTag:"(مطلوب)", optionalTag:"(اختياري)", natOther:"أخرى", lblNatOther:"حدد الجنسية / اللغة",
  profileEyebrow:"حسابك",
  profileTitleSignedOut:"أنت تتصفح كزائر",
  profileSubSignedOut:"التصفح والإعجاب والحفظ كلها تعمل بدون حساب. الحساب فقط للنشر أو التواصل مع أحد.",
  myLinksTitle:"روابط المشاركة الخاصة بي", myLinksHint:"أنشئ رابطاً شخصياً لأي قسم — ستشاهد عدد مرات النقر على كل رابط.",
  generateLinkBtn:"احصل على الرابط", clicksLabel:"نقرات",
  filterAnyGender:"أي جنس", filterMaleOnly:"رجال فقط", filterFemaleOnly:"نساء فقط",
  filterAnyRoom:"أي نوع", filterShared:"مشتركة", filterPrivate:"خاصة", filterBed:"سرير",
  filtersLabel:"الفلاتر", filtersReset:"مسح", filtersShow:"عرض النتائج",
  lblBudget:"الميزانية بالشهر", lblNatShort:"الجنسية", lblGenderShort:"الجنس",
  noListingsTitle:"لا توجد غرف مطابقة لهذه الفلاتر", noListingsSub:"جرّب ميزانية أوسع أو أزل فلتراً أو اثنين.",
  likeLabel:"إعجاب", saveLabel:"احفظ",
  deleteLabel:"حذف", deleteConfirm:"هل تريد حذف هذا نهائيًا؟ لا يمكن التراجع عن ذلك.", deleteFailed:"تعذّر الحذف. تحقّق من اتصالك، أو سجّل الخروج ثم سجّل الدخول من جديد، وحاول مرة أخرى.", removeBuddyProfile:"إزالة ملفي كرفيق",
  statMyListings:"الإعلانات", statMyQuestions:"الأسئلة", statMyClicks:"نقرات الروابط",
  tabMyPosts:"إعلاناتي", tabLiked:"أعجبني", memberSince:"عضو منذ", memberFallback:"عضو",
  noPostsYet:"لم تنشر أي إعلان بعد", noLikedYet:"الغرف التي تعجبك ستظهر هنا", noSavedYet:"الأشياء التي تحفظها ستظهر هنا",
  backBtn:"رجوع", loadingProfile:"جارٍ التحميل…", publicProfileUnavailable:"الملف الشخصي غير متاح",
  communityTabLeaderboard:"الأكثر مساعدة", leaderboardMonthLabel:"الأكثر مساعدة —",
  lbFilterAll:"الجميع", lbFilterOpenToWork:"متاح للعمل", lbStatReplies:"ردود", lbStatVotes:"إعجابات",
  noHelpersYet:"لم يحقق أحد هذا بعد هذا الشهر — أجب عن سؤال لتكون الأول!", noQuestionsYet:"لا توجد أسئلة بعد — كن أول من يسأل!",
  badgeTopHelper:"الأكثر مساعدة هذا الشهر", shareMyRank:"شارك ترتيبي",
  openToWorkToggleLabel:"مرئي لأصحاب العمل الباحثين عن موظفين",
  openToWorkHint:"تفعيل هذا يُظهر اسمك ويسمح لأصحاب العمل بمراسلتك عبر واتساب من قائمة الأكثر مساعدة.",
  openToWorkWhatsappLabel:"رقم واتساب لعرضه على أصحاب العمل", saveBtn:"حفظ",
  composerNewPost:"منشور جديد",
  qcStep1Title:"وش تبغى تنشر؟", qcStep1Sub:"اختر واحد. تقدر ترجع وتغيّر رأيك في أي وقت قبل النشر.",
  qcOptHousingTitle:"غرفة أو سرير", qcOptHousingSub:"عندك مكان فاضي وتبغى ساكن",
  qcOptInquiryTitle:"سؤال", qcOptInquirySub:"احصل على إجابة من ناس جربوا قبلك",
  qcOptGuideTitle:"نصيحة", qcOptGuideSub:"شي تعلمته وتبغى غيرك يستفيد منه",
  qcMoreDetails:"تفاصيل إضافية (اختياري)", qcNext:"التالي", qcPublish:"انشر الآن", sarLabel:"ريال",
  guestSavedLabel:"المحفوظات", guestLanguageLabel:"اللغة", guestLanguageValue:"العربية · English · اردو · हिंदी · বাংলা",
  likedCountLabel:"{n} إعجاب على هذا الجهاز", savedCountLabel:"{n} محفوظ على هذا الجهاز",
  signInBtnShort:"تسجيل الدخول / إنشاء حساب",
  authErrorInvalid:"اسم المستخدم أو كلمة المرور غير صحيحة.", authErrorTooMany:"محاولات خاطئة كثيرة. انتظر ١٥ دقيقة ثم حاول مرة أخرى.", authErrorTooOften:"تم إنشاء حسابات كثيرة من هذه الشبكة. حاول مرة أخرى بعد ساعة.", authErrorMissing:"أدخل اسم المستخدم وكلمة المرور.", authErrorNetwork:"تعذر الوصول إلى الخادم — حاول مرة أخرى.", authErrorShort:"يجب أن تتكون كلمة المرور من ٦ أحرف على الأقل.", authErrorTaken:"اسم المستخدم هذا مُستخدم بالفعل.", loginHint:"سجّل الدخول باسم المستخدم وكلمة المرور.", loginTabLabel:"تسجيل الدخول", signInSubmit:"تسجيل الدخول", signupHint:"اختر اسم مستخدم وكلمة مرور — هذا كل ما تحتاجه.", signupTabLabel:"إنشاء حساب",
  lblUsername:"اسم المستخدم", lblPassword:"كلمة المرور",
  authTitle:"تسجيل الدخول", lblEmail:"البريد الإلكتروني", sendCode:"أرسل الرمز", useUsernameLogin:"لدي اسم مستخدم وكلمة مرور", lblCode:"الرمز", verifyCode:"تحقّق", resendCode:"أرسل رمزًا جديدًا", changeEmail:"غيّر البريد", continueLabel:"متابعة", useEmailLogin:"سجّل الدخول بالبريد الإلكتروني بدلًا من ذلك",
  authHintEmail:"أدخل بريدك الإلكتروني. سنرسل إليك رمزًا لتسجيل الدخول أو إنشاء حسابك.", authHintLink:"خطوة أخيرة: أضف بريدك الإلكتروني لحماية حسابك. سنرسل إليك رمزًا هناك.", authHintCode:"أدخل الرمز الذي أرسلناه إلى {email}. إذا لم تجده، تحقّق من مجلد الرسائل غير المرغوب فيها.", authHintName:"أهلًا بك في سند! ما الاسم الذي تريد أن يراه الآخرون؟", codeResent:"أرسلنا إليك رمزًا جديدًا بالبريد.",
  authErrorEmail:"أدخل بريدًا إلكترونيًا صحيحًا، مثل name@example.com.", authErrorCode:"أدخل الرمز الذي وصلك في البريد.", authErrorWrongCode:"الرمز غير صحيح. تحقّق منه وحاول مرة أخرى.", authErrorCodeExpired:"انتهت صلاحية الرمز. اضغط \"أرسل رمزًا جديدًا\".", authErrorTooManyCodes:"محاولات كثيرة. انتظر ١٥ دقيقة ثم حاول مرة أخرى.", authErrorSendFailed:"تعذّر إرسال رمز إلى هذا البريد. تحقّق منه وحاول مرة أخرى.", authErrorEmailTaken:"هذا البريد مرتبط بحساب آخر. سجّل الدخول بالبريد الإلكتروني بدلًا من ذلك.", authErrorName:"أدخل اسمًا.",
  themeToDark:"التبديل إلى الوضع الداكن", themeToLight:"التبديل إلى الوضع الفاتح", langMenuLabel:"تغيير اللغة",
  // "Looking for work?": first-visit question, entry points, work page and offer check
  welcomeTitle:"أهلًا بك في سند", welcomeLangLabel:"لغتك", welcomeQuestion:"أين أنت الآن؟",
  welcomeInSaudi:"أنا في السعودية", welcomeInSaudiSub:"ابحث عن سكن، اعرف حقوقك، واسأل العمال",
  welcomeAbroad:"أنا خارج السعودية وأبغى أشتغل فيها", welcomeAbroadSub:"تعال بالطريقة النظامية واكشف عروض العمل الوهمية", welcomeSkip:"تخطَّ الآن",
  workPillLabel:"تدور عن عمل؟", workEntryTitle:"تدور عن عمل في السعودية؟", workEntrySub:"ابدأ من هنا قبل أن تدفع لأي أحد",
  workEyebrow:"القدوم إلى السعودية", workTitle:"تدور عن عمل في السعودية؟",
  workSub:"ابدأ من هنا قبل أن تدفع لأي أحد. سند لا يستقدم العمال ولا يبيع التأشيرات ولا يطلب منك أي مال.",
  workCountryLabel:"من أي بلد ستأتي؟", workCountryPK:"باكستان", workCountryIN:"الهند", workCountryOther:"بلد آخر", workCountryHint:"اختر بلدك لتظهر لك خطواته.", workSaudiLabel:"السعودية",
  checkTitle:"افحص عرض العمل", checkSub:"٦ أسئلة سريعة. إجاباتك تبقى في جوالك.", checkStart:"ابدأ الفحص", checkProgress:"السؤال {n} من {total}", ansYes:"نعم", ansNo:"لا", ansUnsure:"لست متأكدًا",
  checkQ1:"هل طلب منك أحد أن تدفع قيمة التأشيرة؟",
  checkE1:"في السعودية يتحمل صاحب العمل رسوم الاستقدام ورخصة العمل والإقامة (نظام العمل، المادة ٤٠). طلب «قيمة فيزا» من العامل علامة احتيال شائعة. الوكيل المرخّص في بلدك قد يأخذ رسوم خدمة محددة فقط، مع إيصال.",
  checkQ2:"هل عرضوا عليك «فيزا حرة» تسمح لك بالعمل عند أي أحد؟",
  checkE2:"تأشيرة العمل تصدر لصاحب عمل واحد. لا توجد «فيزا حرة» نظامية تسمح لك بالعمل عند أي أحد.",
  checkQ3:"هل هي تأشيرة عمل (وليست زيارة أو عمرة أو حج أو زيارة عائلية)؟",
  checkE3:"العمل بتأشيرة زيارة أو عمرة أو حج أو زيارة عائلية غير مسموح. من يفعل ذلك قد يُحتجز ويُغرَّم ويُرحَّل ويُمنع من العودة.",
  checkQ4:"هل وكيلك مرخّص من حكومة بلدك؟",
  checkE4:"لا يحق ترتيب العمل في الخارج إلا لوكيل مرخّص: في باكستان «مروّج توظيف خارجي» مرخّص (OEP)، وفي الهند وكيل توظيف مسجّل في منصة eMigrate. وكيل السفر ليس منهم.",
  checkQ5:"هل قرأت العقد المكتوب بلغة تفهمها؟",
  checkE5:"قبل السفر تأكد من المسمى الوظيفي والراتب وساعات العمل والسكن ومدة العقد. احتفظ بنسخة، ولا توقّع ورقة فارغة أبدًا.",
  checkQ6:"هل تعرف اسم الشركة أو الشخص الذي ستعمل عنده؟",
  checkE6:"العمل الحقيقي له صاحب عمل معروف بالاسم. يجب أن يكون صاحب العمل نفسه في التأشيرة والعقد والعرض.",
  resultDangerTitle:"توقّف: في هذا العرض علامات خطر واضحة", resultDangerBody:"لا تدفع أي مال إضافي ولا تسلّم أوراقك حتى تتحقق. اسأل العمال الموجودين في السعودية على سند، أو اتصل بخط المساعدة في حكومة بلدك.",
  resultCautionTitle:"انتبه: تحقّق من هذه أولًا", resultCautionBody:"بعض الإجابات تحتاج تحققًا قبل أن تدفع أي شيء أو تسافر.",
  resultOkTitle:"لا توجد علامات خطر في إجاباتك", resultOkBody:"جيد. ومع ذلك تحقّق من تأشيرتك في الموقع الرسمي، واحتفظ بنسخ من العقد والإيصالات قبل السفر.",
  resultFlagsLabel:"ما يجب التحقق منه", resultYourAnswer:"إجابتك: {answer}", checkAgain:"افحص عرضًا آخر",
  workAskTitle:"اسأل العمال الموجودين في السعودية", workAskSub:"انشر سؤالك في المجتمع. الإجابات من عمال مثلك وليست من جهات رسمية. لا تدفع أبدًا لمن يراسلك بخصوص تأشيرة.",
  workAskBtn:"اطرح سؤالًا", workSeeQuestionsBtn:"شاهد الأسئلة", catArrival:"قبل القدوم",
  workDisclaimer:"سند ليس مكتب استقدام. راجعنا هذه الصفحة على مصادر حكومية رسمية في نوفمبر ٢٠٢٦، لكن الأنظمة تتغير، فتأكد دائمًا من المواقع الرسمية.",
},
ur: {
  brandName:"سند · Sanad", brandTag:"سعودی عرب میں آپ کا سہارا",
  navHome:"ہوم", navGuide:"گائیڈ", navHousing:"فیڈ", navCommunity:"کمیونٹی",
  chipAll:"تمام", chipHousing:"رہائش", chipInquiries:"سوالات", chipGuides:"تجاویز",
  qnGuideTitle:"اپنے حقوق جانیں", qnGuideSub:"لیبر قانون، قویٰ، اقامہ اور بینکنگ — آسان زبان میں",
  qnHousingTitle:"کمرہ تلاش کریں", qnHousingSub:"6 بڑے شہروں میں مشترکہ رہائش",
  qnCommunityTitle:"کمیونٹی سے پوچھیں", qnCommunitySub:"یہاں پہلے سے رہنے والے لوگوں کے حقیقی جوابات — کسی بے ترتیب فیس بک گروپ سے نہیں",
  guideEyebrow:"نالج گائیڈ ہب", guideTitle:"نظام کو الجھن سے پہلے سمجھیں",
  guideSub:"ہر ورکر کو بالآخر درکار چیزوں کی مختصر، آسان وضاحتیں۔",
  housingEyebrow:"روم میٹ اور مشترکہ رہائش بورڈ", housingTitle:"اپنا اگلا کمرہ تلاش کریں",
  housingSub:"کرایہ داروں اور مالکان کی حقیقی لسٹنگز۔ براہ راست واٹس ایپ پر رابطہ کریں — کوئی بیچ والا نہیں۔",
  housingPostBtn:"نئی پوسٹ",
  lblCity:"شہر", lblRent:"ماہانہ کرایہ (SAR)", lblRoomType:"کمرے کی قسم",
  rtShared:"مشترکہ کمرہ", rtPrivate:"نجی کمرہ", rtBed:"صرف بیڈ",
  lblGender:"صنفی ترجیح", genAny:"کوئی بھی", genMale:"صرف مرد", genFemale:"صرف خواتین",
  lblNationality:"قومیت / زبان کی ترجیح", natAny:"کوئی بھی", natArab:"عرب",
  lblBills:"بجلی اور پانی شامل", lblDesc:"تفصیل", descPh:"مثلاً: میٹرو کے قریب، پرسکون فلیٹ، پہلے سے 3 ساتھی...",
  lblWhatsapp:"واٹس ایپ نمبر", waInvalid:"درست واٹس ایپ نمبر درج کریں، مثلاً 05XXXXXXXX۔", waSaudiInvalid:"سعودی موبائل نمبر درج کریں: 5 سے شروع ہونے والے 9 ہندسے۔",
  filterAllCities:"تمام شہر", filterAnyBudget:"کوئی بھی بجٹ", filterUnder500:"500 سے کم", filterBudget500to800:"500 – 800 SAR", filterBudget800to1200:"800 – 1,200 SAR",
  filterAnyNat:"کوئی بھی قومیت ترجیح",
  perMonth:"/ ماہانہ", contactWA:"واٹس ایپ", billsIncluded:"بلز شامل ہیں", billsShared:"بلز مشترکہ",
  postedBy:"پوسٹ کردہ",
  communityEyebrow:"کمیونٹی سوال و جواب", communityTitle:"تجربہ کار لوگوں سے پوچھیں",
  communitySub:"رہائش، قانونی سوالات، ملازمت اور روزمرہ زندگی سے متعلق ساتھیوں کے جوابات۔",
  lblCategory:"زمرہ", catHousing:"رہائش", catLegal:"قانونی", catJobs:"ملازمتیں", catLife:"عمومی زندگی",
  lblQuestion:"آپ کا سوال", questionPh:"اپنا سوال یہاں لکھیں...",
  catAll:"تمام", replies:"جوابات", viewReplies:"جوابات دیکھیں", hideReplies:"جوابات چھپائیں",
  repliedBy:"جواب دہندہ", replyPh:"ایک مددگار جواب لکھیں...", replySubmit:"جواب دیں", replySignInHint:"اس سوال کا جواب دینے کے لیے سائن ان کریں۔",
  footNote:"سند ایک کمیونٹی پلیٹ فارم ہے۔ ہمیشہ سرکاری طریقہ کار کی تصدیق قویٰ، ابشر اور مقیم جیسے سرکاری پورٹلز سے کریں۔",
  emergencyTitle:"ہنگامی نمبرز", em911:"ایمرجنسی (پولیس)", em998:"سول ڈیفنس (فائر)", em997:"ایمبولینس (ریڈ کریسنٹ)", em19911:"وزارت انسانی وسائل — لیبر انکوائریز",
  navProfile:"پروفائل", shareLabel:"شیئر", copyLink:"لنک کاپی کریں", linkCopied:"لنک کاپی ہو گیا!", shareViaWhatsapp:"واٹس ایپ پر شیئر کریں", shareThisPage:"یہ صفحہ شیئر کریں",
  lblName:"آپ کا نام", signOutBtn:"سائن آؤٹ",
  communityTabQA:"سوال و جواب", communityTabBuddies:"ساتھی", becomeBuddyBtn:"ساتھی بنیں — نئے آنے والوں کی مدد کریں",
  buddyFormTitle:"بطور ساتھی سائن اپ کریں", buddyFormHint:"نئے آنے والے آپ کی پروفائل دیکھ سکیں گے اور واٹس ایپ پر آپ سے رابطہ کر سکیں گے۔",
  lblHelpAreas:"آپ کس چیز میں مدد کر سکتے ہیں؟", helpHousing:"رہائش تلاش کرنا", helpPaperwork:"کاغذی کارروائی اور طریقہ کار", helpOrientation:"عمومی رہنمائی",
  lblBio:"مختصر تعارف", bioPh:"مثلاً: 3 سال سے ریاض میں مقیم ہوں، ابشر/نفاذ سیٹ اپ میں مدد کے لیے تیار ہوں...",
  buddyFormSubmit:"میری ساتھی پروفائل شائع کریں", noBuddiesYet:"ابھی تک کوئی ساتھی نہیں — پہلے آپ بنیں!", helpsWith:"مدد کر سکتا ہے",
  videoLabel:"کمرے کی تصاویر یا ویڈیو (اختیاری)", videoHint:"زیادہ سے زیادہ 10 تصاویر، یا ایک ویڈیو جو 60 سیکنڈ اور 50 MB تک ہو۔ تصاویر خود بخود چھوٹی کر دی جاتی ہیں تاکہ جلدی اپ لوڈ ہوں۔",
  mediaVideoTooBig:"یہ ویڈیو {mb} MB کی ہے۔ ویڈیو زیادہ سے زیادہ 50 MB ہو سکتی ہے۔ چھوٹی ویڈیو آزمائیں، یا 4K کے بجائے 1080p میں ریکارڈ کریں۔", mediaVideoTooLong:"یہ ویڈیو {s} سیکنڈ کی ہے۔ ویڈیو زیادہ سے زیادہ 60 سیکنڈ ہو سکتی ہے۔", mediaTooManyPhotos:"آپ نے {n} تصاویر منتخب کیں۔ صرف پہلی 10 پوسٹ ہوں گی۔", mediaPhotosPicked:"{n} تصاویر تیار ہیں", mediaVideoPicked:"ویڈیو تیار ہے: {mb} MB، {s} سیکنڈ", uploadingPhotosProgress:"تصاویر اپ لوڈ ہو رہی ہیں... {total} میں سے {done}", uploadFailed:"اپ لوڈ ناکام ہو گیا۔ اپنا کنکشن چیک کریں اور دوبارہ کوشش کریں۔", publishFailed:"پوسٹ نہیں ہو سکی۔ دوبارہ کوشش کریں۔", uploadingVideo:"ویڈیو اپ لوڈ ہو رہی ہے...",
  photoN:"تصویر {n}", prevPhoto:"پچھلی تصویر", nextPhoto:"اگلی تصویر",
  qcTextLabel:"آپ کے ذہن میں کیا ہے؟", qcTextPh:"ایک تجویز شیئر کریں جو کسی نئے شخص کے کام آئے...",
  qcImageLabel:"تصویر شامل کریں (اختیاری)", uploadingImage:"تصویر اپ لوڈ ہو رہی ہے...",
  viewAndAnswer:"دیکھیں اور جواب دیں", fromCommunity:"کمیونٹی سے",
  requiredTag:"(ضروری)", optionalTag:"(اختیاری)", natOther:"دیگر", lblNatOther:"قومیت / زبان بتائیں",
  profileEyebrow:"آپ کا اکاؤنٹ",
  profileTitleSignedOut:"آپ بطور مہمان براؤز کر رہے ہیں",
  profileSubSignedOut:"براؤزنگ، پسند کرنا اور محفوظ کرنا سب بغیر اکاؤنٹ کے کام کرتے ہیں۔ اکاؤنٹ صرف پوسٹ کرنے یا رابطہ کرنے کے لیے درکار ہے۔",
  myLinksTitle:"میرے شیئر لنکس", myLinksHint:"کسی بھی سیکشن کے لیے ذاتی لنک بنائیں — آپ دیکھ سکیں گے کہ ہر لنک پر کتنی بار کلک ہوا۔",
  generateLinkBtn:"لنک حاصل کریں", clicksLabel:"کلکس",
  filterAnyGender:"کوئی بھی صنف", filterMaleOnly:"صرف مرد", filterFemaleOnly:"صرف خواتین",
  filterAnyRoom:"کوئی بھی", filterShared:"مشترکہ", filterPrivate:"نجی", filterBed:"بیڈ",
  filtersLabel:"فلٹرز", filtersReset:"ری سیٹ", filtersShow:"نتائج دیکھیں",
  lblBudget:"ماہانہ بجٹ", lblNatShort:"قومیت", lblGenderShort:"صنف",
  noListingsTitle:"ان فلٹرز سے کوئی کمرہ نہیں ملا", noListingsSub:"بجٹ بڑھائیں یا ایک دو فلٹر ہٹا دیں۔",
  likeLabel:"پسند", saveLabel:"محفوظ کریں",
  deleteLabel:"حذف کریں", deleteConfirm:"کیا اسے ہمیشہ کے لیے حذف کر دیں؟ یہ واپس نہیں ہو سکتا۔", deleteFailed:"حذف نہیں ہو سکا۔ اپنا کنکشن چیک کریں، یا سائن آؤٹ کر کے دوبارہ سائن اِن کریں، پھر ایک بار اور کوشش کریں۔", removeBuddyProfile:"میری ساتھی پروفائل ہٹائیں",
  statMyListings:"لسٹنگز", statMyQuestions:"سوالات", statMyClicks:"لنک کلکس",
  tabMyPosts:"پوسٹس", tabLiked:"پسندیدہ", memberSince:"رکن بننے کی تاریخ", memberFallback:"رکن",
  noPostsYet:"ابھی تک کوئی لسٹنگ پوسٹ نہیں کی گئی", noLikedYet:"آپ کے پسندیدہ کمرے یہاں نظر آئیں گے", noSavedYet:"آپ کی محفوظ کردہ چیزیں یہاں نظر آئیں گی",
  backBtn:"واپس", loadingProfile:"لوڈ ہو رہا ہے…", publicProfileUnavailable:"پروفائل دستیاب نہیں",
  communityTabLeaderboard:"ٹاپ ہیلپرز", leaderboardMonthLabel:"ٹاپ ہیلپرز —",
  lbFilterAll:"سب", lbFilterOpenToWork:"کام کے لیے دستیاب", lbStatReplies:"جوابات", lbStatVotes:"اپووٹس",
  noHelpersYet:"اس مہینے ابھی تک کسی نے یہ حاصل نہیں کیا — پہلا بننے کے لیے کسی سوال کا جواب دیں!", noQuestionsYet:"ابھی تک کوئی سوال نہیں — پہلا سوال آپ پوچھیں!",
  badgeTopHelper:"اس مہینے کا ٹاپ ہیلپر", shareMyRank:"میری رینک شیئر کریں",
  openToWorkToggleLabel:"ملازمت دینے والوں کو نظر آئیں",
  openToWorkHint:"اسے آن کرنے سے آپ کا نام نظر آئے گا اور آجر ٹاپ ہیلپرز لسٹ سے آپ کو واٹس ایپ پر پیغام بھیج سکیں گے۔",
  openToWorkWhatsappLabel:"آجروں کو دکھانے کے لیے واٹس ایپ نمبر", saveBtn:"محفوظ کریں",
  composerNewPost:"نئی پوسٹ",
  qcStep1Title:"آپ کیا پوسٹ کرنا چاہتے ہیں؟", qcStep1Sub:"ایک منتخب کریں — جمع کرانے سے پہلے کسی بھی وقت بدل سکتے ہیں۔",
  qcOptHousingTitle:"کمرہ یا بیڈ اسپیس", qcOptHousingSub:"آپ کے پاس خالی جگہ ہے اور کرایہ دار چاہیے",
  qcOptInquiryTitle:"سوال", qcOptInquirySub:"تجربہ کار لوگوں سے جواب حاصل کریں",
  qcOptGuideTitle:"تجویز", qcOptGuideSub:"کچھ سیکھا جو دوسروں کے کام آ سکتا ہے",
  qcMoreDetails:"مزید تفصیلات (اختیاری)", qcNext:"اگلا", qcPublish:"شائع کریں", sarLabel:"SAR",
  guestSavedLabel:"محفوظ شدہ", guestLanguageLabel:"زبان", guestLanguageValue:"العربية · English · اردو · हिंदी · বাংলা",
  likedCountLabel:"اس فون پر {n} پسند", savedCountLabel:"اس فون پر {n} محفوظ",
  signInBtnShort:"لاگ ان / اکاؤنٹ بنائیں",
  authErrorInvalid:"غلط یوزرنیم یا پاس ورڈ۔", authErrorTooMany:"بہت زیادہ غلط کوششیں۔ ۱۵ منٹ انتظار کریں اور دوبارہ کوشش کریں۔", authErrorTooOften:"اس نیٹ ورک سے بہت زیادہ نئے اکاؤنٹ بنائے گئے ہیں۔ ایک گھنٹے بعد دوبارہ کوشش کریں۔", authErrorMissing:"یوزرنیم اور پاس ورڈ درج کریں۔", authErrorNetwork:"سرور تک رسائی نہیں ہو سکی — دوبارہ کوشش کریں۔", authErrorShort:"پاس ورڈ کم از کم ۶ حروف کا ہونا چاہیے۔", authErrorTaken:"یہ یوزرنیم پہلے سے لیا جا چکا ہے۔", loginHint:"اپنے یوزرنیم اور پاس ورڈ سے لاگ ان کریں۔", loginTabLabel:"لاگ ان", signInSubmit:"لاگ ان", signupHint:"ایک یوزرنیم اور پاس ورڈ منتخب کریں — بس اتنا ہی چاہیے۔", signupTabLabel:"اکاؤنٹ بنائیں",
  lblUsername:"یوزرنیم", lblPassword:"پاس ورڈ",
  authTitle:"سائن اِن", lblEmail:"ای میل", sendCode:"کوڈ بھیجیں", useUsernameLogin:"میرے پاس یوزرنیم اور پاس ورڈ ہے", lblCode:"کوڈ", verifyCode:"تصدیق کریں", resendCode:"نیا کوڈ بھیجیں", changeEmail:"ای میل بدلیں", continueLabel:"جاری رکھیں", useEmailLogin:"اس کے بجائے ای میل سے سائن اِن کریں",
  authHintEmail:"اپنی ای میل درج کریں۔ سائن اِن کرنے یا اکاؤنٹ بنانے کے لیے ہم آپ کو ایک کوڈ بھیجیں گے۔", authHintLink:"ایک آخری قدم: اپنے اکاؤنٹ کو محفوظ رکھنے کے لیے اپنی ای میل شامل کریں۔ ہم وہاں آپ کو ایک کوڈ بھیجیں گے۔", authHintCode:"وہ کوڈ درج کریں جو ہم نے {email} پر بھیجا ہے۔ اگر نہ ملے تو اسپام فولڈر دیکھیں۔", authHintName:"سند میں خوش آمدید! دوسرے لوگ آپ کا کون سا نام دیکھیں؟", codeResent:"ہم نے آپ کو ای میل پر نیا کوڈ بھیج دیا ہے۔",
  authErrorEmail:"درست ای میل درج کریں، مثلاً name@example.com۔", authErrorCode:"ای میل میں آنے والا کوڈ درج کریں۔", authErrorWrongCode:"یہ کوڈ غلط ہے۔ اسے چیک کر کے دوبارہ کوشش کریں۔", authErrorCodeExpired:"اس کوڈ کی مدت ختم ہو گئی ہے۔ \"نیا کوڈ بھیجیں\" پر ٹیپ کریں۔", authErrorTooManyCodes:"بہت زیادہ کوششیں۔ ۱۵ منٹ انتظار کریں اور دوبارہ کوشش کریں۔", authErrorSendFailed:"اس ای میل پر کوڈ نہیں بھیجا جا سکا۔ اسے چیک کر کے دوبارہ کوشش کریں۔", authErrorEmailTaken:"یہ ای میل پہلے سے کسی اور اکاؤنٹ کی ہے۔ اس کے بجائے ای میل سے سائن اِن کریں۔", authErrorName:"ایک نام درج کریں۔",
  themeToDark:"ڈارک موڈ پر جائیں", themeToLight:"لائٹ موڈ پر جائیں", langMenuLabel:"زبان تبدیل کریں",
  // "Looking for work?": first-visit question, entry points, work page and offer check
  welcomeTitle:"سند میں خوش آمدید", welcomeLangLabel:"آپ کی زبان", welcomeQuestion:"آپ اس وقت کہاں ہیں؟",
  welcomeInSaudi:"میں سعودی عرب میں ہوں", welcomeInSaudiSub:"کمرہ ڈھونڈیں، اپنے حقوق جانیں، دوسرے ورکرز سے پوچھیں",
  welcomeAbroad:"میں سعودی عرب سے باہر ہوں اور مجھے وہاں کام چاہیے", welcomeAbroadSub:"قانونی طریقے سے آئیں اور جعلی نوکری کی پیشکش پہچانیں", welcomeSkip:"ابھی چھوڑ دیں",
  workPillLabel:"کام کی تلاش ہے؟", workEntryTitle:"سعودی عرب میں کام کی تلاش ہے؟", workEntrySub:"کسی کو پیسے دینے سے پہلے یہاں سے شروع کریں",
  workEyebrow:"سعودی عرب آنا", workTitle:"سعودی عرب میں کام کی تلاش ہے؟",
  workSub:"کسی کو پیسے دینے سے پہلے یہاں سے شروع کریں۔ سند ورکرز بھرتی نہیں کرتا، ویزے نہیں بیچتا اور آپ سے کبھی پیسے نہیں مانگتا۔",
  workCountryLabel:"آپ کس ملک سے آ رہے ہیں؟", workCountryPK:"پاکستان", workCountryIN:"بھارت", workCountryOther:"کوئی اور ملک", workCountryHint:"اپنے ملک کے مراحل دیکھنے کے لیے اپنا ملک چنیں۔", workSaudiLabel:"سعودی عرب",
  checkTitle:"اپنی نوکری کی پیشکش چیک کریں", checkSub:"6 آسان سوال۔ آپ کے جواب آپ کے فون میں ہی رہتے ہیں۔", checkStart:"چیک شروع کریں", checkProgress:"{total} میں سے سوال {n}", ansYes:"ہاں", ansNo:"نہیں", ansUnsure:"پتا نہیں",
  checkQ1:"کیا کسی نے آپ سے ویزے کے پیسے مانگے؟",
  checkE1:"سعودی عرب میں بھرتی کی فیس، ورک پرمٹ اور اقامہ کا خرچ آجر دیتا ہے (لیبر قانون، آرٹیکل 40)۔ ورکر سے \"ویزے کی قیمت\" مانگنا فراڈ کی عام نشانی ہے۔ آپ کے اپنے ملک کا لائسنس یافتہ ایجنٹ صرف مقررہ سروس چارج، رسید کے ساتھ، لے سکتا ہے۔",
  checkQ2:"کیا انہوں نے \"آزاد ویزا\" کی پیشکش کی جس پر آپ کسی کے پاس بھی کام کر سکیں؟",
  checkE2:"ورک ویزا ایک ہی آجر کے لیے جاری ہوتا ہے۔ کوئی قانونی \"آزاد ویزا\" نہیں جس پر آپ کسی کے پاس بھی کام کر سکیں۔",
  checkQ3:"کیا یہ ورک ویزا ہے (وزٹ، عمرہ، حج یا فیملی ویزا نہیں)؟",
  checkE3:"وزٹ، عمرہ، حج یا فیملی ویزا پر کام کرنے کی اجازت نہیں۔ ایسا کرنے والوں کو حراست، جرمانہ، ملک بدری اور دوبارہ آنے پر پابندی ہو سکتی ہے۔",
  checkQ4:"کیا آپ کا ایجنٹ آپ کی اپنی حکومت سے لائسنس یافتہ ہے؟",
  checkE4:"بیرون ملک نوکری صرف لائسنس یافتہ ایجنٹ ہی دلوا سکتا ہے: پاکستان میں لائسنس یافتہ اوورسیز ایمپلائمنٹ پروموٹر (OEP)، بھارت میں eMigrate پر رجسٹرڈ ریکروٹنگ ایجنٹ۔ ٹریول ایجنٹ ان میں شامل نہیں۔",
  checkQ5:"کیا آپ نے تحریری معاہدہ ایسی زبان میں پڑھا ہے جو آپ سمجھتے ہیں؟",
  checkE5:"سفر سے پہلے جاب ٹائٹل، تنخواہ، کام کے اوقات، رہائش اور معاہدے کی مدت چیک کریں۔ ایک کاپی اپنے پاس رکھیں اور کبھی خالی کاغذ پر دستخط نہ کریں۔",
  checkQ6:"کیا آپ اس کمپنی یا شخص کا نام جانتے ہیں جس کے پاس آپ کام کریں گے؟",
  checkE6:"اصل نوکری کا آجر نام سے معلوم ہوتا ہے۔ ویزے، معاہدے اور پیشکش میں آجر ایک ہی ہونا چاہیے۔",
  resultDangerTitle:"رک جائیں: اس پیشکش میں خطرے کی واضح نشانیاں ہیں", resultDangerBody:"تصدیق کرنے تک مزید پیسے نہ دیں اور اپنے کاغذات حوالے نہ کریں۔ سند پر سعودی عرب میں موجود ورکرز سے پوچھیں، یا اپنی حکومت کی ہیلپ لائن پر رابطہ کریں۔",
  resultCautionTitle:"محتاط رہیں: پہلے یہ چیک کریں", resultCautionBody:"کچھ جواب ایسے ہیں جنہیں پیسے دینے یا سفر کرنے سے پہلے چیک کرنا ضروری ہے۔",
  resultOkTitle:"آپ کے جوابات میں خطرے کی کوئی نشانی نہیں", resultOkBody:"اچھا ہے۔ پھر بھی سفر سے پہلے سرکاری ویب سائٹ پر اپنا ویزا چیک کریں اور معاہدے اور رسیدوں کی کاپیاں رکھیں۔",
  resultFlagsLabel:"کیا چیک کرنا ہے", resultYourAnswer:"آپ کا جواب: {answer}", checkAgain:"کوئی اور پیشکش چیک کریں",
  workAskTitle:"سعودی عرب میں موجود ورکرز سے پوچھیں", workAskSub:"کمیونٹی میں اپنا سوال پوسٹ کریں۔ جواب دوسرے ورکرز دیتے ہیں، سرکاری ادارے نہیں۔ ویزے کے بارے میں پیغام بھیجنے والے کسی کو کبھی پیسے نہ دیں۔",
  workAskBtn:"سوال پوچھیں", workSeeQuestionsBtn:"سوالات دیکھیں", catArrival:"آنے سے پہلے",
  workDisclaimer:"سند کوئی ریکروٹمنٹ ایجنسی نہیں۔ ہم نے نومبر 2026 میں یہ صفحہ سرکاری ذرائع سے چیک کیا، لیکن قوانین بدلتے رہتے ہیں، اس لیے ہمیشہ سرکاری ویب سائٹس پر تصدیق کریں۔",
},
hi: {
  brandName:"Sanad · سند", brandTag:"सऊदी अरब में आपका सहारा",
  navHome:"होम", navGuide:"गाइड", navHousing:"फ़ीड", navCommunity:"कम्युनिटी",
  chipAll:"सभी", chipHousing:"कमरे", chipInquiries:"सवाल", chipGuides:"टिप्स",
  qnGuideTitle:"अपने अधिकार जानें", qnGuideSub:"श्रम क़ानून, क़िवा, इक़ामा और बैंकिंग — आसान भाषा में",
  qnHousingTitle:"कमरा ढूंढें", qnHousingSub:"6 बड़े शहरों में शेयरिंग वाले कमरे",
  qnCommunityTitle:"कम्युनिटी से पूछें", qnCommunitySub:"यहाँ पहले से रह रहे लोगों के सच्चे जवाब — कोई अनजान फ़ेसबुक ग्रुप नहीं",
  guideEyebrow:"जानकारी गाइड", guideTitle:"सिस्टम को समझें, इससे पहले कि वह आपको उलझा दे",
  guideSub:"हर कामगार को कभी न कभी जिन बातों की ज़रूरत पड़ती है, उनकी छोटी और आसान जानकारी।",
  housingEyebrow:"रूममेट और शेयरिंग कमरों का बोर्ड", housingTitle:"अपना अगला कमरा ढूंढें",
  housingSub:"किरायेदारों और मकान-मालिकों के असली विज्ञापन। सीधे व्हाट्सऐप पर बात करें — कोई बिचौलिया नहीं।",
  housingPostBtn:"नई पोस्ट",
  lblCity:"शहर", lblRent:"महीने का किराया (रियाल)", lblRoomType:"कमरे का प्रकार",
  rtShared:"शेयरिंग कमरा", rtPrivate:"अलग कमरा", rtBed:"सिर्फ़ बेड",
  lblGender:"किसके लिए", genAny:"कोई भी", genMale:"सिर्फ़ पुरुष", genFemale:"सिर्फ़ महिलाएँ",
  lblNationality:"राष्ट्रीयता / भाषा की पसंद", natAny:"कोई भी", natArab:"अरब",
  lblBills:"बिजली और पानी शामिल", lblDesc:"विवरण", descPh:"जैसे: मेट्रो के पास, शांत फ़्लैट, पहले से 3 लोग रहते हैं...",
  lblWhatsapp:"व्हाट्सऐप नंबर", waInvalid:"सही व्हाट्सऐप नंबर डालें, जैसे 05XXXXXXXX।", waSaudiInvalid:"सऊदी मोबाइल नंबर डालें: 5 से शुरू होने वाले 9 अंक।",
  filterAllCities:"सभी शहर", filterAnyBudget:"कोई भी बजट", filterUnder500:"500 से कम", filterBudget500to800:"500 – 800 रियाल", filterBudget800to1200:"800 – 1,200 रियाल",
  filterAnyNat:"कोई भी राष्ट्रीयता",
  perMonth:"/ महीना", contactWA:"व्हाट्सऐप", billsIncluded:"बिल शामिल", billsShared:"बिल बाँटकर",
  postedBy:"पोस्ट करने वाले",
  communityEyebrow:"कम्युनिटी सवाल-जवाब", communityTitle:"उन लोगों से पूछें जो यह सब पहले से समझ चुके हैं",
  communitySub:"कमरे, क़ानूनी सवाल, नौकरी और रोज़मर्रा की ज़िंदगी पर साथियों के जवाब।",
  lblCategory:"श्रेणी", catHousing:"कमरे", catLegal:"क़ानूनी", catJobs:"नौकरी", catLife:"आम ज़िंदगी",
  lblQuestion:"आपका सवाल", questionPh:"अपना सवाल यहाँ लिखें...",
  catAll:"सभी", replies:"जवाब", viewReplies:"जवाब देखें", hideReplies:"जवाब छिपाएँ",
  repliedBy:"जवाब देने वाले", replyPh:"कोई मददगार जवाब लिखें...", replySubmit:"जवाब दें", replySignInHint:"इस सवाल का जवाब देने के लिए साइन इन करें।",
  footNote:"सनद एक कम्युनिटी प्लैटफ़ॉर्म है। सरकारी प्रक्रियाओं की पुष्टि हमेशा क़िवा, अबशर और मुक़ीम जैसे सरकारी पोर्टल पर करें।",
  emergencyTitle:"आपातकालीन नंबर", em911:"इमरजेंसी (पुलिस)", em998:"सिविल डिफ़ेंस (आग)", em997:"एम्बुलेंस (रेड क्रिसेंट)", em19911:"मानव संसाधन मंत्रालय — श्रम संबंधी पूछताछ",
  navProfile:"प्रोफ़ाइल", shareLabel:"शेयर", copyLink:"लिंक कॉपी करें", linkCopied:"लिंक कॉपी हो गया!", shareViaWhatsapp:"व्हाट्सऐप पर शेयर करें", shareThisPage:"यह पेज शेयर करें",
  lblName:"आपका नाम", signOutBtn:"साइन आउट",
  communityTabQA:"सवाल-जवाब", communityTabBuddies:"साथी", becomeBuddyBtn:"साथी बनें — नए लोगों की मदद करें",
  buddyFormTitle:"साथी के रूप में जुड़ें", buddyFormHint:"नए आने वाले आपकी प्रोफ़ाइल देख सकेंगे और व्हाट्सऐप पर आपसे संपर्क कर सकेंगे।",
  lblHelpAreas:"आप किस चीज़ में मदद कर सकते हैं?", helpHousing:"कमरा ढूंढना", helpPaperwork:"काग़ज़ात और प्रक्रियाएँ", helpOrientation:"सामान्य मार्गदर्शन",
  lblBio:"छोटा परिचय", bioPh:"जैसे: 3 साल से रियाद में हूँ, अबशर/नफ़ाद सेटअप में मदद कर सकता हूँ...",
  buddyFormSubmit:"मेरी साथी प्रोफ़ाइल प्रकाशित करें", noBuddiesYet:"अभी कोई साथी नहीं है — पहले आप बनें!", helpsWith:"इसमें मदद कर सकते हैं",
  videoLabel:"कमरे की फ़ोटो या वीडियो (वैकल्पिक)", videoHint:"ज़्यादा से ज़्यादा 10 फ़ोटो, या 60 सेकंड और 50 MB तक का एक वीडियो। फ़ोटो अपने-आप छोटी की जाती हैं ताकि जल्दी अपलोड हों।",
  mediaVideoTooBig:"यह वीडियो {mb} MB का है। वीडियो 50 MB तक हो सकता है। छोटी क्लिप आज़माएँ, या 4K की जगह 1080p में रिकॉर्ड करें।", mediaVideoTooLong:"यह वीडियो {s} सेकंड का है। वीडियो 60 सेकंड तक हो सकता है।", mediaTooManyPhotos:"आपने {n} फ़ोटो चुनीं। सिर्फ़ पहली 10 पोस्ट होंगी।", mediaPhotosPicked:"{n} फ़ोटो तैयार", mediaVideoPicked:"वीडियो तैयार: {mb} MB, {s} सेकंड", uploadingPhotosProgress:"फ़ोटो अपलोड हो रही हैं... {total} में से {done}", uploadFailed:"अपलोड नहीं हो सका। अपना कनेक्शन जाँचें और फिर से कोशिश करें।", publishFailed:"प्रकाशित नहीं हो सका। फिर से कोशिश करें।", uploadingVideo:"वीडियो अपलोड हो रहा है...",
  photoN:"फ़ोटो {n}", prevPhoto:"पिछली फ़ोटो", nextPhoto:"अगली फ़ोटो",
  qcTextLabel:"आप क्या कहना चाहते हैं?", qcTextPh:"कोई ऐसी टिप शेयर करें जो किसी नए व्यक्ति के काम आए...",
  qcImageLabel:"एक फ़ोटो जोड़ें (वैकल्पिक)", uploadingImage:"फ़ोटो अपलोड हो रही है...",
  viewAndAnswer:"देखें और जवाब दें", fromCommunity:"कम्युनिटी से",
  requiredTag:"(ज़रूरी)", optionalTag:"(वैकल्पिक)", natOther:"अन्य", lblNatOther:"राष्ट्रीयता / भाषा लिखें",
  profileEyebrow:"आपका अकाउंट",
  profileTitleSignedOut:"आप मेहमान के रूप में देख रहे हैं",
  profileSubSignedOut:"देखना, पसंद करना और सेव करना — सब बिना अकाउंट के होता है। अकाउंट सिर्फ़ पोस्ट करने या किसी से संपर्क करने के लिए चाहिए।",
  myLinksTitle:"मेरे शेयर लिंक", myLinksHint:"किसी भी सेक्शन के लिए अपना लिंक बनाएँ — आप देख पाएँगे कि हर लिंक कितनी बार खोला गया।",
  generateLinkBtn:"लिंक पाएँ", clicksLabel:"क्लिक",
  filterAnyGender:"सभी के लिए", filterMaleOnly:"सिर्फ़ पुरुष", filterFemaleOnly:"सिर्फ़ महिलाएँ",
  filterAnyRoom:"कोई भी कमरा", filterShared:"शेयरिंग", filterPrivate:"अलग", filterBed:"बेड",
  filtersLabel:"फ़िल्टर", filtersReset:"रीसेट", filtersShow:"नतीजे देखें",
  lblBudget:"महीने का बजट", lblNatShort:"राष्ट्रीयता", lblGenderShort:"किसके लिए",
  noListingsTitle:"इन फ़िल्टर से कोई कमरा नहीं मिला", noListingsSub:"बजट बढ़ाकर देखें, या एक-दो फ़िल्टर हटा दें।",
  likeLabel:"पसंद", saveLabel:"सेव",
  deleteLabel:"हटाएँ", deleteConfirm:"इसे हमेशा के लिए हटा दें? यह वापस नहीं होगा।", deleteFailed:"इसे हटाया नहीं जा सका। अपना कनेक्शन जाँचें, या साइन आउट करके फिर साइन इन करें, फिर एक बार और कोशिश करें।", removeBuddyProfile:"मेरी साथी प्रोफ़ाइल हटाएँ",
  statMyListings:"विज्ञापन", statMyQuestions:"सवाल", statMyClicks:"लिंक क्लिक",
  tabMyPosts:"पोस्ट", tabLiked:"पसंद किए", memberSince:"सदस्यता की शुरुआत", memberFallback:"सदस्य",
  noPostsYet:"अभी तक कोई विज्ञापन पोस्ट नहीं किया", noLikedYet:"आपको पसंद आए कमरे यहाँ दिखेंगे", noSavedYet:"आपकी सेव की हुई चीज़ें यहाँ दिखेंगी",
  backBtn:"वापस", loadingProfile:"लोड हो रहा है…", publicProfileUnavailable:"प्रोफ़ाइल उपलब्ध नहीं है",
  communityTabLeaderboard:"टॉप मददगार", leaderboardMonthLabel:"टॉप मददगार —",
  lbFilterAll:"सभी", lbFilterOpenToWork:"काम के लिए उपलब्ध", lbStatReplies:"जवाब", lbStatVotes:"वोट",
  noHelpersYet:"इस महीने अभी तक किसी ने यह हासिल नहीं किया — किसी सवाल का जवाब देकर पहले बनें!", noQuestionsYet:"अभी कोई सवाल नहीं — पहला सवाल आप पूछें!",
  badgeTopHelper:"इस महीने के टॉप मददगार", shareMyRank:"मेरी रैंक शेयर करें",
  openToWorkToggleLabel:"नौकरी देने वालों को दिखाई दें",
  openToWorkHint:"इसे चालू करने पर आपका नाम दिखेगा और नौकरी देने वाले टॉप मददगार सूची से आपको व्हाट्सऐप पर मैसेज कर सकेंगे।",
  openToWorkWhatsappLabel:"नौकरी देने वालों को दिखाने के लिए व्हाट्सऐप नंबर", saveBtn:"सेव करें",
  composerNewPost:"नई पोस्ट",
  qcStep1Title:"आप क्या पोस्ट करना चाहते हैं?", qcStep1Sub:"एक चुनें — भेजने से पहले आप कभी भी बदल सकते हैं।",
  qcOptHousingTitle:"कमरा या बेड", qcOptHousingSub:"आपके पास खाली जगह है और किरायेदार चाहिए",
  qcOptInquiryTitle:"सवाल", qcOptInquirySub:"उन लोगों से जवाब पाएँ जो यह कर चुके हैं",
  qcOptGuideTitle:"टिप", qcOptGuideSub:"आपने जो सीखा, वह दूसरों के काम आ सकता है",
  qcMoreDetails:"और जानकारी (वैकल्पिक)", qcNext:"आगे", qcPublish:"प्रकाशित करें", sarLabel:"रियाल",
  guestSavedLabel:"सेव किए", guestLanguageLabel:"भाषा", guestLanguageValue:"العربية · English · اردو · हिंदी · বাংলা",
  likedCountLabel:"इस फ़ोन पर {n} पसंद", savedCountLabel:"इस फ़ोन पर {n} सेव",
  signInBtnShort:"लॉग इन / साइन अप",
  authErrorInvalid:"यूज़रनेम या पासवर्ड गलत है।", authErrorTooMany:"बहुत ज़्यादा गलत कोशिशें। 15 मिनट रुककर फिर कोशिश करें।", authErrorTooOften:"इस नेटवर्क से बहुत ज़्यादा नए अकाउंट बने हैं। एक घंटे बाद फिर कोशिश करें।", authErrorMissing:"यूज़रनेम और पासवर्ड डालें।", authErrorNetwork:"सर्वर तक नहीं पहुँच सके — फिर से कोशिश करें।", authErrorShort:"पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।", authErrorTaken:"यह यूज़रनेम पहले से लिया जा चुका है।", loginHint:"अपने यूज़रनेम और पासवर्ड से लॉग इन करें।", loginTabLabel:"लॉग इन", signInSubmit:"लॉग इन", signupHint:"एक यूज़रनेम और पासवर्ड चुनें — बस इतना ही चाहिए।", signupTabLabel:"साइन अप",
  lblUsername:"यूज़रनेम", lblPassword:"पासवर्ड",
  authTitle:"साइन इन", lblEmail:"ईमेल", sendCode:"कोड भेजें", useUsernameLogin:"मेरे पास यूज़रनेम और पासवर्ड है", lblCode:"कोड", verifyCode:"पुष्टि करें", resendCode:"नया कोड भेजें", changeEmail:"ईमेल बदलें", continueLabel:"जारी रखें", useEmailLogin:"इसकी जगह ईमेल से साइन इन करें",
  authHintEmail:"अपना ईमेल डालें। साइन इन करने या अकाउंट बनाने के लिए हम आपको एक कोड भेजेंगे।", authHintLink:"बस एक कदम और: अपना अकाउंट सुरक्षित रखने के लिए ईमेल जोड़ें। हम वहाँ आपको एक कोड भेजेंगे।", authHintCode:"हमने {email} पर जो कोड भेजा है, उसे डालें। न मिले तो स्पैम फ़ोल्डर देखें।", authHintName:"सनद में आपका स्वागत है! दूसरों को आपका कौन-सा नाम दिखे?", codeResent:"हमने आपको नया कोड ईमेल कर दिया है।",
  authErrorEmail:"सही ईमेल डालें, जैसे name@example.com।", authErrorCode:"ईमेल में आया कोड डालें।", authErrorWrongCode:"यह कोड गलत है। जाँचकर फिर कोशिश करें।", authErrorCodeExpired:"इस कोड का समय खत्म हो गया है। \"नया कोड भेजें\" दबाएँ।", authErrorTooManyCodes:"बहुत ज़्यादा कोशिशें। 15 मिनट रुककर फिर कोशिश करें।", authErrorSendFailed:"हम इस ईमेल पर कोड नहीं भेज सके। ईमेल जाँचकर फिर कोशिश करें।", authErrorEmailTaken:"यह ईमेल पहले से किसी दूसरे अकाउंट का है। इसकी जगह ईमेल से साइन इन करें।", authErrorName:"एक नाम डालें।",
  themeToDark:"डार्क मोड चालू करें", themeToLight:"लाइट मोड चालू करें", langMenuLabel:"भाषा बदलें",
  // "Looking for work?": first-visit question, entry points, work page and offer check
  welcomeTitle:"सनद में आपका स्वागत है", welcomeLangLabel:"आपकी भाषा", welcomeQuestion:"आप अभी कहाँ हैं?",
  welcomeInSaudi:"मैं सऊदी अरब में हूँ", welcomeInSaudiSub:"कमरा ढूंढें, अपने अधिकार जानें, दूसरे कामगारों से पूछें",
  welcomeAbroad:"मैं सऊदी अरब से बाहर हूँ और मुझे वहाँ काम चाहिए", welcomeAbroadSub:"क़ानूनी रास्ते से आएँ और नकली नौकरी के ऑफ़र पहचानें", welcomeSkip:"अभी छोड़ें",
  workPillLabel:"काम ढूंढ रहे हैं?", workEntryTitle:"सऊदी अरब में काम ढूंढ रहे हैं?", workEntrySub:"किसी को पैसे देने से पहले यहाँ से शुरू करें",
  workEyebrow:"सऊदी अरब आना", workTitle:"सऊदी अरब में काम ढूंढ रहे हैं?",
  workSub:"किसी को पैसे देने से पहले यहाँ से शुरू करें। सनद कामगारों की भर्ती नहीं करता, वीज़ा नहीं बेचता और आपसे कभी पैसे नहीं माँगता।",
  workCountryLabel:"आप किस देश से आ रहे हैं?", workCountryPK:"पाकिस्तान", workCountryIN:"भारत", workCountryOther:"कोई और देश", workCountryHint:"अपने देश के कदम देखने के लिए अपना देश चुनें।", workSaudiLabel:"सऊदी अरब",
  checkTitle:"अपना नौकरी का ऑफ़र जाँचें", checkSub:"6 छोटे सवाल। आपके जवाब आपके फ़ोन में ही रहते हैं।", checkStart:"जाँच शुरू करें", checkProgress:"{total} में से सवाल {n}", ansYes:"हाँ", ansNo:"नहीं", ansUnsure:"पता नहीं",
  checkQ1:"क्या किसी ने आपसे वीज़ा के पैसे माँगे?",
  checkE1:"सऊदी अरब में भर्ती की फ़ीस, वर्क परमिट और इक़ामा का ख़र्च मालिक देता है (श्रम क़ानून, अनुच्छेद 40)। कामगार से \"वीज़ा की क़ीमत\" माँगना धोखे की आम निशानी है। आपके अपने देश का लाइसेंस वाला एजेंट सिर्फ़ तय सर्विस चार्ज, रसीद के साथ, ले सकता है।",
  checkQ2:"क्या उन्होंने \"आज़ाद वीज़ा\" (फ़्री वीज़ा) दिया, जिस पर आप किसी के भी पास काम कर सकें?",
  checkE2:"वर्क वीज़ा एक ही मालिक के लिए जारी होता है। ऐसा कोई क़ानूनी \"आज़ाद वीज़ा\" नहीं है जिस पर आप किसी के भी पास काम कर सकें।",
  checkQ3:"क्या यह वर्क वीज़ा है (विज़िट, उमरा, हज या फ़ैमिली वीज़ा नहीं)?",
  checkE3:"विज़िट, उमरा, हज या फ़ैमिली वीज़ा पर काम करने की इजाज़त नहीं है। ऐसा करने वालों को हिरासत, जुर्माना, देश से निकाला और दोबारा आने पर रोक हो सकती है।",
  checkQ4:"क्या आपका एजेंट आपकी अपनी सरकार से लाइसेंस वाला है?",
  checkE4:"विदेश में नौकरी सिर्फ़ लाइसेंस वाला एजेंट दिला सकता है: पाकिस्तान में लाइसेंस वाला ओवरसीज़ एम्प्लॉयमेंट प्रमोटर (OEP), भारत में eMigrate पर रजिस्टर्ड रिक्रूटिंग एजेंट। ट्रैवल एजेंट इनमें नहीं आता।",
  checkQ5:"क्या आपने लिखा हुआ कॉन्ट्रैक्ट ऐसी भाषा में पढ़ा है जो आप समझते हैं?",
  checkE5:"सफ़र से पहले पद का नाम, तनख्वाह, काम के घंटे, रहने की जगह और कॉन्ट्रैक्ट की अवधि जाँचें। एक कॉपी अपने पास रखें और कभी ख़ाली काग़ज़ पर दस्तख़त न करें।",
  checkQ6:"क्या आप उस कंपनी या व्यक्ति का नाम जानते हैं जिसके पास आप काम करेंगे?",
  checkE6:"असली नौकरी का मालिक नाम से पता होता है। वीज़ा, कॉन्ट्रैक्ट और ऑफ़र में मालिक एक ही होना चाहिए।",
  resultDangerTitle:"रुकिए: इस ऑफ़र में ख़तरे के साफ़ निशान हैं", resultDangerBody:"जाँच पूरी होने तक और पैसे न दें और अपने काग़ज़ात न सौंपें। सनद पर सऊदी अरब में मौजूद कामगारों से पूछें, या अपनी सरकार की हेल्पलाइन पर बात करें।",
  resultCautionTitle:"सावधान रहें: पहले ये जाँचें", resultCautionBody:"कुछ जवाब ऐसे हैं जिन्हें पैसे देने या सफ़र करने से पहले जाँचना ज़रूरी है।",
  resultOkTitle:"आपके जवाबों में ख़तरे का कोई निशान नहीं", resultOkBody:"अच्छा है। फिर भी सफ़र से पहले सरकारी वेबसाइट पर अपना वीज़ा जाँचें और कॉन्ट्रैक्ट व रसीदों की कॉपियाँ रखें।",
  resultFlagsLabel:"क्या जाँचना है", resultYourAnswer:"आपका जवाब: {answer}", checkAgain:"कोई और ऑफ़र जाँचें",
  workAskTitle:"सऊदी अरब में मौजूद कामगारों से पूछें", workAskSub:"कम्युनिटी में अपना सवाल पोस्ट करें। जवाब दूसरे कामगार देते हैं, सरकारी अधिकारी नहीं। वीज़ा के बारे में मैसेज करने वाले किसी को कभी पैसे न दें।",
  workAskBtn:"सवाल पूछें", workSeeQuestionsBtn:"सवाल देखें", catArrival:"आने से पहले",
  workDisclaimer:"सनद कोई भर्ती एजेंसी नहीं है। हमने नवंबर 2026 में यह पेज सरकारी स्रोतों से जाँचा, लेकिन नियम बदलते रहते हैं, इसलिए हमेशा सरकारी वेबसाइटों पर पुष्टि करें।",
  // Admin buddy keys from the open admin-buddies pull request (#37), so its
  // strings are already translated whichever of the two merges first.
  adminAddBuddyBtn:"सत्यापित साथी जोड़ें (एडमिन)", adminBuddyFormTitle:"साथी जोड़ें", adminBuddyFormHint:"यह सिर्फ़ एडमिन को दिखता है। साथी को \"सत्यापित\" बैज मिलेगा। उनका व्हाट्सऐप नंबर प्रकाशित करने से पहले उनसे पूछ लें।", lblBuddyName:"नाम", lblAdminHelpAreas:"वे किस चीज़ में मदद कर सकते हैं?", adminBuddyFormSubmit:"साथी प्रकाशित करें", buddyNameMissing:"साथी का नाम डालें।", adminAddBuddyFailed:"यह साथी जोड़ा नहीं जा सका। अपना कनेक्शन जाँचें और फिर कोशिश करें।", verifiedBadge:"सत्यापित", adminRemoveBuddy:"हटाएँ (एडमिन)",
},
bn: {
  brandName:"Sanad · سند", brandTag:"সৌদি আরবে আপনার সহায়",
  navHome:"হোম", navGuide:"গাইড", navHousing:"ফিড", navCommunity:"কমিউনিটি",
  chipAll:"সব", chipHousing:"বাসা", chipInquiries:"প্রশ্ন", chipGuides:"টিপস",
  qnGuideTitle:"আপনার অধিকার জানুন", qnGuideSub:"শ্রম আইন, কিওয়া, ইকামা ও ব্যাংকিং — সহজ ভাষায়",
  qnHousingTitle:"রুম খুঁজুন", qnHousingSub:"৬টি বড় শহরে শেয়ারে থাকার জায়গা",
  qnCommunityTitle:"কমিউনিটিকে জিজ্ঞেস করুন", qnCommunitySub:"যারা এখানে আগে থেকেই থাকেন তাদের সত্যিকারের উত্তর — কোনো অচেনা ফেসবুক গ্রুপ নয়",
  guideEyebrow:"তথ্য গাইড", guideTitle:"নিয়মকানুন বুঝে নিন, বিভ্রান্ত হওয়ার আগেই",
  guideSub:"প্রত্যেক কর্মীর কোনো না কোনো সময় যা লাগে, সেসব বিষয়ের ছোট ও সহজ ব্যাখ্যা।",
  housingEyebrow:"রুমমেট ও শেয়ার্ড বাসার বোর্ড", housingTitle:"আপনার পরের রুম খুঁজুন",
  housingSub:"ভাড়াটিয়া ও বাড়ির মালিকদের আসল বিজ্ঞাপন। সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন — কোনো দালাল নেই।",
  housingPostBtn:"নতুন পোস্ট",
  lblCity:"শহর", lblRent:"মাসিক ভাড়া (রিয়াল)", lblRoomType:"রুমের ধরন",
  rtShared:"শেয়ার্ড রুম", rtPrivate:"আলাদা রুম", rtBed:"শুধু বেড",
  lblGender:"কার জন্য", genAny:"যেকোনো", genMale:"শুধু পুরুষ", genFemale:"শুধু মহিলা",
  lblNationality:"জাতীয়তা / ভাষার পছন্দ", natAny:"যেকোনো", natArab:"আরব",
  lblBills:"বিদ্যুৎ ও পানি সহ", lblDesc:"বিবরণ", descPh:"যেমন: মেট্রোর কাছে, শান্ত ফ্ল্যাট, আগে থেকে ৩ জন থাকেন...",
  lblWhatsapp:"হোয়াটসঅ্যাপ নম্বর", waInvalid:"সঠিক হোয়াটসঅ্যাপ নম্বর দিন, যেমন 05XXXXXXXX।", waSaudiInvalid:"সৌদি মোবাইল নম্বর দিন: 5 দিয়ে শুরু হওয়া 9 অঙ্কের নম্বর।",
  filterAllCities:"সব শহর", filterAnyBudget:"যেকোনো বাজেট", filterUnder500:"৫০০-এর কম", filterBudget500to800:"৫০০ – ৮০০ রিয়াল", filterBudget800to1200:"৮০০ – ১,২০০ রিয়াল",
  filterAnyNat:"যেকোনো জাতীয়তা",
  perMonth:"/ মাস", contactWA:"হোয়াটসঅ্যাপ", billsIncluded:"বিল সহ", billsShared:"বিল ভাগাভাগি",
  postedBy:"পোস্ট করেছেন",
  communityEyebrow:"কমিউনিটি প্রশ্নোত্তর", communityTitle:"যারা আগেই সব বুঝে নিয়েছেন, তাদের জিজ্ঞেস করুন",
  communitySub:"বাসা, আইনি প্রশ্ন, কাজ আর দৈনন্দিন জীবন নিয়ে সহকর্মীদের উত্তর।",
  lblCategory:"বিভাগ", catHousing:"বাসা", catLegal:"আইনি", catJobs:"কাজ", catLife:"সাধারণ জীবন",
  lblQuestion:"আপনার প্রশ্ন", questionPh:"আপনার প্রশ্ন এখানে লিখুন...",
  catAll:"সব", replies:"উত্তর", viewReplies:"উত্তর দেখুন", hideReplies:"উত্তর লুকান",
  repliedBy:"উত্তরদাতা", replyPh:"একটি সহায়ক উত্তর লিখুন...", replySubmit:"উত্তর দিন", replySignInHint:"এই প্রশ্নের উত্তর দিতে সাইন ইন করুন।",
  footNote:"সনদ একটি কমিউনিটি প্ল্যাটফর্ম। সরকারি নিয়মকানুন সবসময় কিওয়া, আবশের ও মুকিমের মতো সরকারি পোর্টালে যাচাই করুন।",
  emergencyTitle:"জরুরি নম্বর", em911:"জরুরি (পুলিশ)", em998:"সিভিল ডিফেন্স (আগুন)", em997:"অ্যাম্বুলেন্স (রেড ক্রিসেন্ট)", em19911:"মানবসম্পদ মন্ত্রণালয় — শ্রম বিষয়ক তথ্য",
  navProfile:"প্রোফাইল", shareLabel:"শেয়ার", copyLink:"লিংক কপি করুন", linkCopied:"লিংক কপি হয়েছে!", shareViaWhatsapp:"হোয়াটসঅ্যাপে শেয়ার করুন", shareThisPage:"এই পেজ শেয়ার করুন",
  lblName:"আপনার নাম", signOutBtn:"সাইন আউট",
  communityTabQA:"প্রশ্নোত্তর", communityTabBuddies:"সাথী", becomeBuddyBtn:"সাথী হোন — নতুনদের সাহায্য করুন",
  buddyFormTitle:"সাথী হিসেবে যোগ দিন", buddyFormHint:"নতুনরা আপনার প্রোফাইল দেখতে পাবেন এবং হোয়াটসঅ্যাপে আপনার সাথে যোগাযোগ করতে পারবেন।",
  lblHelpAreas:"আপনি কোন বিষয়ে সাহায্য করতে পারেন?", helpHousing:"বাসা খোঁজা", helpPaperwork:"কাগজপত্র ও প্রক্রিয়া", helpOrientation:"সাধারণ দিকনির্দেশনা",
  lblBio:"সংক্ষিপ্ত পরিচয়", bioPh:"যেমন: ৩ বছর ধরে রিয়াদে আছি, আবশের/নাফাদ সেটআপে সাহায্য করতে পারি...",
  buddyFormSubmit:"আমার সাথী প্রোফাইল প্রকাশ করুন", noBuddiesYet:"এখনো কোনো সাথী নেই — আপনিই প্রথম হোন!", helpsWith:"যে বিষয়ে সাহায্য করতে পারেন",
  videoLabel:"রুমের ছবি বা ভিডিও (ঐচ্ছিক)", videoHint:"সর্বোচ্চ ১০টি ছবি, অথবা ৬০ সেকেন্ড ও ৫০ MB পর্যন্ত একটি ভিডিও। ছবিগুলো নিজে থেকেই ছোট করা হয় যাতে দ্রুত আপলোড হয়।",
  mediaVideoTooBig:"এই ভিডিওটি {mb} MB। ভিডিও সর্বোচ্চ ৫০ MB হতে পারে। ছোট ক্লিপ দিন, অথবা 4K-এর বদলে 1080p-তে রেকর্ড করুন।", mediaVideoTooLong:"এই ভিডিওটি {s} সেকেন্ডের। ভিডিও সর্বোচ্চ ৬০ সেকেন্ড হতে পারে।", mediaTooManyPhotos:"আপনি {n}টি ছবি বেছেছেন। শুধু প্রথম ১০টি পোস্ট হবে।", mediaPhotosPicked:"{n}টি ছবি তৈরি", mediaVideoPicked:"ভিডিও তৈরি: {mb} MB, {s} সেকেন্ড", uploadingPhotosProgress:"ছবি আপলোড হচ্ছে... {total}টির মধ্যে {done}টি", uploadFailed:"আপলোড হয়নি। আপনার সংযোগ দেখে আবার চেষ্টা করুন।", publishFailed:"প্রকাশ করা যায়নি। আবার চেষ্টা করুন।", uploadingVideo:"ভিডিও আপলোড হচ্ছে...",
  photoN:"ছবি {n}", prevPhoto:"আগের ছবি", nextPhoto:"পরের ছবি",
  qcTextLabel:"আপনি কী বলতে চান?", qcTextPh:"এমন একটি টিপস শেয়ার করুন যা নতুন কারও কাজে লাগবে...",
  qcImageLabel:"একটি ছবি যোগ করুন (ঐচ্ছিক)", uploadingImage:"ছবি আপলোড হচ্ছে...",
  viewAndAnswer:"দেখুন ও উত্তর দিন", fromCommunity:"কমিউনিটি থেকে",
  requiredTag:"(আবশ্যক)", optionalTag:"(ঐচ্ছিক)", natOther:"অন্যান্য", lblNatOther:"জাতীয়তা / ভাষা লিখুন",
  profileEyebrow:"আপনার অ্যাকাউন্ট",
  profileTitleSignedOut:"আপনি অতিথি হিসেবে দেখছেন",
  profileSubSignedOut:"দেখা, পছন্দ করা ও সেভ করা — সবই অ্যাকাউন্ট ছাড়া চলে। শুধু পোস্ট করতে বা কারও সাথে যোগাযোগ করতে অ্যাকাউন্ট লাগে।",
  myLinksTitle:"আমার শেয়ার লিংক", myLinksHint:"যেকোনো অংশের জন্য নিজের লিংক তৈরি করুন — প্রতিটি লিংক কতবার খোলা হলো তা দেখতে পাবেন।",
  generateLinkBtn:"লিংক নিন", clicksLabel:"ক্লিক",
  filterAnyGender:"সবার জন্য", filterMaleOnly:"শুধু পুরুষ", filterFemaleOnly:"শুধু মহিলা",
  filterAnyRoom:"যেকোনো রুম", filterShared:"শেয়ার্ড", filterPrivate:"আলাদা", filterBed:"বেড",
  filtersLabel:"ফিল্টার", filtersReset:"রিসেট", filtersShow:"ফলাফল দেখুন",
  lblBudget:"মাসিক বাজেট", lblNatShort:"জাতীয়তা", lblGenderShort:"কার জন্য",
  noListingsTitle:"এই ফিল্টারে কোনো রুম পাওয়া যায়নি", noListingsSub:"বাজেট বাড়িয়ে দেখুন, অথবা এক-দুটি ফিল্টার সরিয়ে দিন।",
  likeLabel:"পছন্দ", saveLabel:"সেভ",
  deleteLabel:"মুছুন", deleteConfirm:"এটি চিরতরে মুছে ফেলবেন? এটি আর ফেরানো যাবে না।", deleteFailed:"এটি মোছা যায়নি। আপনার সংযোগ দেখুন, অথবা সাইন আউট করে আবার সাইন ইন করুন, তারপর আরেকবার চেষ্টা করুন।", removeBuddyProfile:"আমার সাথী প্রোফাইল সরান",
  statMyListings:"বিজ্ঞাপন", statMyQuestions:"প্রশ্ন", statMyClicks:"লিংক ক্লিক",
  tabMyPosts:"পোস্ট", tabLiked:"পছন্দের", memberSince:"সদস্যপদ শুরু", memberFallback:"সদস্য",
  noPostsYet:"এখনো কোনো বিজ্ঞাপন পোস্ট করা হয়নি", noLikedYet:"আপনার পছন্দের রুমগুলো এখানে দেখা যাবে", noSavedYet:"আপনার সেভ করা জিনিস এখানে দেখা যাবে",
  backBtn:"ফিরে যান", loadingProfile:"লোড হচ্ছে…", publicProfileUnavailable:"প্রোফাইল পাওয়া যাচ্ছে না",
  communityTabLeaderboard:"সেরা সাহায্যকারী", leaderboardMonthLabel:"সেরা সাহায্যকারী —",
  lbFilterAll:"সবাই", lbFilterOpenToWork:"কাজের জন্য প্রস্তুত", lbStatReplies:"উত্তর", lbStatVotes:"ভোট",
  noHelpersYet:"এই মাসে এখনো কেউ এটি পাননি — একটি প্রশ্নের উত্তর দিয়ে প্রথম হোন!", noQuestionsYet:"এখনো কোনো প্রশ্ন নেই — প্রথম প্রশ্নটি আপনিই করুন!",
  badgeTopHelper:"এই মাসের সেরা সাহায্যকারী", shareMyRank:"আমার র‍্যাংক শেয়ার করুন",
  openToWorkToggleLabel:"নিয়োগকর্তাদের কাছে দৃশ্যমান থাকুন",
  openToWorkHint:"এটি চালু করলে আপনার নাম দেখা যাবে এবং নিয়োগকর্তারা সেরা সাহায্যকারীর তালিকা থেকে হোয়াটসঅ্যাপে আপনাকে মেসেজ করতে পারবেন।",
  openToWorkWhatsappLabel:"নিয়োগকর্তাদের দেখানোর জন্য হোয়াটসঅ্যাপ নম্বর", saveBtn:"সেভ করুন",
  composerNewPost:"নতুন পোস্ট",
  qcStep1Title:"আপনি কী পোস্ট করতে চান?", qcStep1Sub:"একটি বেছে নিন — জমা দেওয়ার আগে যেকোনো সময় বদলাতে পারবেন।",
  qcOptHousingTitle:"রুম বা বেড", qcOptHousingSub:"আপনার কাছে খালি জায়গা আছে, ভাড়াটিয়া দরকার",
  qcOptInquiryTitle:"প্রশ্ন", qcOptInquirySub:"যারা এটা আগে করেছেন তাদের কাছ থেকে উত্তর নিন",
  qcOptGuideTitle:"টিপস", qcOptGuideSub:"আপনি যা শিখেছেন, তা অন্যদের কাজে লাগতে পারে",
  qcMoreDetails:"আরও তথ্য (ঐচ্ছিক)", qcNext:"পরবর্তী", qcPublish:"প্রকাশ করুন", sarLabel:"রিয়াল",
  guestSavedLabel:"সেভ করা", guestLanguageLabel:"ভাষা", guestLanguageValue:"العربية · English · اردو · हिंदी · বাংলা",
  likedCountLabel:"এই ফোনে {n}টি পছন্দ", savedCountLabel:"এই ফোনে {n}টি সেভ করা",
  signInBtnShort:"লগ ইন / সাইন আপ",
  authErrorInvalid:"ইউজারনেম বা পাসওয়ার্ড ভুল।", authErrorTooMany:"অনেকবার ভুল চেষ্টা হয়েছে। ১৫ মিনিট অপেক্ষা করে আবার চেষ্টা করুন।", authErrorTooOften:"এই নেটওয়ার্ক থেকে অনেক নতুন অ্যাকাউন্ট খোলা হয়েছে। এক ঘণ্টা পরে আবার চেষ্টা করুন।", authErrorMissing:"ইউজারনেম ও পাসওয়ার্ড দিন।", authErrorNetwork:"সার্ভারে পৌঁছানো যায়নি — আবার চেষ্টা করুন।", authErrorShort:"পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।", authErrorTaken:"এই ইউজারনেম আগেই নেওয়া হয়েছে।", loginHint:"আপনার ইউজারনেম ও পাসওয়ার্ড দিয়ে লগ ইন করুন।", loginTabLabel:"লগ ইন", signInSubmit:"লগ ইন", signupHint:"একটি ইউজারনেম ও পাসওয়ার্ড বেছে নিন — এটুকুই যথেষ্ট।", signupTabLabel:"সাইন আপ",
  lblUsername:"ইউজারনেম", lblPassword:"পাসওয়ার্ড",
  authTitle:"সাইন ইন", lblEmail:"ইমেইল", sendCode:"কোড পাঠান", useUsernameLogin:"আমার ইউজারনেম ও পাসওয়ার্ড আছে", lblCode:"কোড", verifyCode:"যাচাই করুন", resendCode:"নতুন কোড পাঠান", changeEmail:"ইমেইল বদলান", continueLabel:"চালিয়ে যান", useEmailLogin:"বরং ইমেইল দিয়ে সাইন ইন করুন",
  authHintEmail:"আপনার ইমেইল দিন। সাইন ইন বা অ্যাকাউন্ট খোলার জন্য আমরা একটি কোড পাঠাব।", authHintLink:"আর এক ধাপ: অ্যাকাউন্ট নিরাপদ রাখতে আপনার ইমেইল যোগ করুন। আমরা সেখানে একটি কোড পাঠাব।", authHintCode:"{email}-এ পাঠানো কোডটি দিন। খুঁজে না পেলে স্প্যাম ফোল্ডার দেখুন।", authHintName:"সনদে স্বাগতম! অন্যরা আপনার কোন নাম দেখবেন?", codeResent:"আমরা আপনাকে নতুন কোড ইমেইল করেছি।",
  authErrorEmail:"সঠিক ইমেইল দিন, যেমন name@example.com।", authErrorCode:"ইমেইলে আসা কোডটি দিন।", authErrorWrongCode:"কোডটি ভুল। দেখে আবার চেষ্টা করুন।", authErrorCodeExpired:"কোডটির মেয়াদ শেষ। \"নতুন কোড পাঠান\" চাপুন।", authErrorTooManyCodes:"অনেকবার চেষ্টা হয়েছে। ১৫ মিনিট অপেক্ষা করে আবার চেষ্টা করুন।", authErrorSendFailed:"এই ইমেইলে কোড পাঠানো যায়নি। ইমেইলটি দেখে আবার চেষ্টা করুন।", authErrorEmailTaken:"এই ইমেইলটি অন্য একটি অ্যাকাউন্টের। বরং ইমেইল দিয়ে সাইন ইন করুন।", authErrorName:"একটি নাম দিন।",
  themeToDark:"ডার্ক মোডে যান", themeToLight:"লাইট মোডে যান", langMenuLabel:"ভাষা বদলান",
  // "Looking for work?": first-visit question, entry points, work page and offer check
  welcomeTitle:"সনদে স্বাগতম", welcomeLangLabel:"আপনার ভাষা", welcomeQuestion:"আপনি এখন কোথায়?",
  welcomeInSaudi:"আমি সৌদি আরবে আছি", welcomeInSaudiSub:"বাসা খুঁজুন, অধিকার জানুন, অন্য কর্মীদের জিজ্ঞেস করুন",
  welcomeAbroad:"আমি সৌদি আরবের বাইরে আছি, সেখানে কাজ চাই", welcomeAbroadSub:"আইনি পথে আসুন, ভুয়া চাকরির অফার চিনে নিন", welcomeSkip:"এখন থাক",
  workPillLabel:"কাজ খুঁজছেন?", workEntryTitle:"সৌদি আরবে কাজ খুঁজছেন?", workEntrySub:"কাউকে টাকা দেওয়ার আগে এখান থেকে শুরু করুন",
  workEyebrow:"সৌদি আরবে আসা", workTitle:"সৌদি আরবে কাজ খুঁজছেন?",
  workSub:"কাউকে টাকা দেওয়ার আগে এখান থেকে শুরু করুন। সনদ কর্মী নিয়োগ করে না, ভিসা বিক্রি করে না এবং আপনার কাছে কখনো টাকা চায় না।",
  workCountryLabel:"আপনি কোন দেশ থেকে আসছেন?", workCountryPK:"পাকিস্তান", workCountryIN:"ভারত", workCountryOther:"অন্য দেশ", workCountryHint:"আপনার দেশের ধাপগুলো দেখতে দেশ বেছে নিন।", workSaudiLabel:"সৌদি আরব",
  checkTitle:"আপনার চাকরির অফার যাচাই করুন", checkSub:"৬টি ছোট প্রশ্ন। আপনার উত্তর আপনার ফোনেই থাকে।", checkStart:"যাচাই শুরু করুন", checkProgress:"{total}টির মধ্যে প্রশ্ন {n}", ansYes:"হ্যাঁ", ansNo:"না", ansUnsure:"জানি না",
  checkQ1:"কেউ কি আপনার কাছে ভিসার টাকা চেয়েছে?",
  checkE1:"সৌদি আরবে নিয়োগ ফি, ওয়ার্ক পারমিট আর ইকামার খরচ নিয়োগকর্তা দেন (শ্রম আইন, ধারা ৪০)। কর্মীর কাছে \"ভিসার দাম\" চাওয়া প্রতারণার সাধারণ লক্ষণ। আপনার নিজের দেশের লাইসেন্সধারী এজেন্ট শুধু নির্ধারিত সার্ভিস চার্জ নিতে পারেন, রসিদসহ।",
  checkQ2:"তারা কি \"ফ্রি ভিসা\" (আজাদ ভিসা) দিতে চেয়েছে, যাতে যে কারো কাছে কাজ করা যায়?",
  checkE2:"ওয়ার্ক ভিসা একজন নির্দিষ্ট নিয়োগকর্তার জন্য দেওয়া হয়। যে কারো কাছে কাজ করার মতো কোনো আইনি \"ফ্রি ভিসা\" নেই।",
  checkQ3:"এটা কি ওয়ার্ক ভিসা (ভিজিট, উমরাহ, হজ বা ফ্যামিলি ভিসা নয়)?",
  checkE3:"ভিজিট, উমরাহ, হজ বা ফ্যামিলি ভিসায় কাজ করার অনুমতি নেই। যারা এমন করে, তাদের আটক, জরিমানা, দেশে ফেরত পাঠানো এবং আবার আসায় নিষেধাজ্ঞা হতে পারে।",
  checkQ4:"আপনার এজেন্ট কি আপনার নিজের সরকারের লাইসেন্সধারী?",
  checkE4:"বিদেশে চাকরি শুধু লাইসেন্সধারী এজেন্টই দিতে পারেন: পাকিস্তানে লাইসেন্সধারী ওভারসিজ এমপ্লয়মেন্ট প্রমোটার (OEP), ভারতে eMigrate-এ নিবন্ধিত রিক্রুটিং এজেন্ট। ট্রাভেল এজেন্ট এদের মধ্যে পড়ে না।",
  checkQ5:"আপনি কি লিখিত চুক্তিটি এমন ভাষায় পড়েছেন যা আপনি বোঝেন?",
  checkE5:"যাওয়ার আগে পদের নাম, বেতন, কাজের সময়, থাকার ব্যবস্থা আর চুক্তির মেয়াদ দেখে নিন। একটি কপি নিজের কাছে রাখুন, আর কখনো ফাঁকা কাগজে সই করবেন না।",
  checkQ6:"আপনি কি সেই কোম্পানি বা ব্যক্তির নাম জানেন, যার কাছে কাজ করবেন?",
  checkE6:"আসল চাকরির নিয়োগকর্তার নাম জানা থাকে। ভিসা, চুক্তি আর অফারে একই নিয়োগকর্তা থাকা উচিত।",
  resultDangerTitle:"থামুন: এই অফারে বিপদের স্পষ্ট লক্ষণ আছে", resultDangerBody:"যাচাই না করা পর্যন্ত আর কোনো টাকা দেবেন না, কাগজপত্রও কাউকে দেবেন না। সনদে সৌদি আরবে থাকা কর্মীদের জিজ্ঞেস করুন, অথবা আপনার সরকারের হেল্পলাইনে যোগাযোগ করুন।",
  resultCautionTitle:"সাবধান: আগে এগুলো যাচাই করুন", resultCautionBody:"কিছু উত্তর টাকা দেওয়া বা যাত্রার আগে যাচাই করা দরকার।",
  resultOkTitle:"আপনার উত্তরে বিপদের কোনো লক্ষণ নেই", resultOkBody:"ভালো। তবু যাওয়ার আগে সরকারি ওয়েবসাইটে ভিসা যাচাই করুন, আর চুক্তি ও রসিদের কপি রাখুন।",
  resultFlagsLabel:"যা যাচাই করবেন", resultYourAnswer:"আপনার উত্তর: {answer}", checkAgain:"আরেকটি অফার যাচাই করুন",
  workAskTitle:"সৌদি আরবে থাকা কর্মীদের জিজ্ঞেস করুন", workAskSub:"কমিউনিটিতে আপনার প্রশ্ন পোস্ট করুন। উত্তর দেন অন্য কর্মীরা, সরকারি কর্মকর্তা নন। ভিসা নিয়ে মেসেজ করা কাউকে কখনো টাকা দেবেন না।",
  workAskBtn:"প্রশ্ন করুন", workSeeQuestionsBtn:"প্রশ্নগুলো দেখুন", catArrival:"আসার আগে",
  workDisclaimer:"সনদ কোনো রিক্রুটিং এজেন্সি নয়। আমরা নভেম্বর ২০২৬-এ সরকারি সূত্র থেকে এই পাতা যাচাই করেছি, তবে নিয়ম বদলায়, তাই সবসময় সরকারি ওয়েবসাইটে নিশ্চিত হয়ে নিন।",
  // Admin buddy keys from the open admin-buddies pull request (#37), so its
  // strings are already translated whichever of the two merges first.
  adminAddBuddyBtn:"যাচাই করা সাথী যোগ করুন (অ্যাডমিন)", adminBuddyFormTitle:"সাথী যোগ করুন", adminBuddyFormHint:"এটি শুধু অ্যাডমিনরা দেখেন। সাথী \"যাচাইকৃত\" ব্যাজ পাবেন। তার হোয়াটসঅ্যাপ নম্বর প্রকাশের আগে তার অনুমতি নিন।", lblBuddyName:"নাম", lblAdminHelpAreas:"তিনি কোন বিষয়ে সাহায্য করতে পারেন?", adminBuddyFormSubmit:"সাথী প্রকাশ করুন", buddyNameMissing:"সাথীর নাম দিন।", adminAddBuddyFailed:"এই সাথীকে যোগ করা যায়নি। আপনার সংযোগ দেখে আবার চেষ্টা করুন।", verifiedBadge:"যাচাইকৃত", adminRemoveBuddy:"সরান (অ্যাডমিন)",
}
};

/* ============================= Guide content ============================= */
const guideIcons = {
  labor:'<path d="M4 7h16M4 12h16M4 17h10"/>',
  qiwa:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  bank:'<rect x="3" y="10" width="18" height="9" rx="1"/><path d="M3 10l9-6 9 6"/><path d="M7 14v3M12 14v3M17 14v3"/>',
  iqama:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 10h5M13 14h5"/>',
  health:'<path d="M12 21s-7-4.5-9.5-9C0.8 8.3 2.6 4 7 4c2.2 0 3.9 1.3 5 3 1.1-1.7 2.8-3 5-3 4.4 0 6.2 4.3 4.5 8-2.5 4.5-9.5 9-9.5 9z"/>',
  emergency:'<path d="M12 2l9 4.5v6c0 5-3.8 8-9 9.5-5.2-1.5-9-4.5-9-9.5v-6L12 2z"/><path d="M12 8v5M12 16h.01"/>',
  travel:'<path d="M2 16l20-8-8 20-2-8-8-2 -2-2z" />'
};

const guideData = {
en: [
 {k:"labor", title:"Labor Law & Contracts", sub:"Know what your contract must include", body:`<ul>
   <li>Your work contract must state job title, salary, working hours, and contract duration — get a copy in a language you understand.</li>
   <li>Standard working hours are 8 hours/day or 48 hours/week, reduced during Ramadan for Muslim workers.</li>
   <li>Employers cannot legally withhold your passport in most sectors — ask about your rights if this happens.</li>
   <li>End-of-service benefits (gratuity) are calculated based on years of service — keep your own record of your start date and salary changes.</li>
 </ul>`},
 {k:"qiwa", title:"The Qiwa Platform", sub:"Saudi Arabia's labor services portal", body:`<ul>
   <li>Qiwa is the official platform for managing work contracts, transfers, and labor complaints — accessible via app or web.</li>
   <li>You can view and confirm your own contract details on Qiwa once your employer registers it.</li>
   <li>Job/employer transfer requests, and reporting an unpaid salary, can both be started through Qiwa.</li>
   <li>Always check Qiwa directly rather than trusting a broker's word about your contract status.</li>
 </ul>`},
 {k:"bank", title:"Banking & Money Transfer", sub:"Opening accounts, Absher & Nafath basics", body:`<ul>
   <li>Most banks require a valid Iqama to open an account; some offer accounts for new arrivals with limited features.</li>
   <li><strong>Absher</strong> is the government's main citizen/resident e-services platform — link your Iqama and phone number to access government services online.</li>
   <li><strong>Nafath</strong> is the national digital identity app used to verify your identity for banking, government, and many private services — install it and complete verification early, as many services now require it.</li>
   <li>Use licensed money transfer operators or your bank's app for remittances — avoid informal transfer agents.</li>
 </ul>`},
 {k:"iqama", title:"Iqama & Government Services", sub:"Your residency permit, explained", body:`<ul>
   <li>The Iqama is your residency ID — carry it at all times, it's required for almost everything from SIM cards to renting.</li>
   <li>Your employer is generally responsible for renewing your Iqama on time — follow up before it expires to avoid fines.</li>
   <li>Muqeem is the online portal for checking your Iqama status, exit/re-entry visas, and dependents' records.</li>
   <li>An expired Iqama can affect your ability to travel, open accounts, or renew a driving license.</li>
 </ul>`},
 {k:"health", title:"Healthcare", sub:"Insurance and where to get treatment", body:`<ul>
   <li>Private-sector employers are generally required to provide medical insurance — ask HR for your insurance card and network hospital list.</li>
   <li>Government hospitals may have separate procedures for non-citizens; private clinics and insurance-network hospitals are usually more accessible.</li>
   <li>Keep a digital copy of your insurance card and policy number saved on your phone.</li>
 </ul>`},
 {k:"emergency", title:"Emergency Contacts", sub:"Save these numbers now", body:`<div class="emergency-grid">
   <div class="em-item"><div class="num">911</div><div class="lbl" data-i18n="em911">Emergency (Police)</div></div>
   <div class="em-item"><div class="num">998</div><div class="lbl" data-i18n="em998">Civil Defense (Fire)</div></div>
   <div class="em-item"><div class="num">997</div><div class="lbl" data-i18n="em997">Ambulance (Red Crescent)</div></div>
   <div class="em-item"><div class="num">19911</div><div class="lbl" data-i18n="em19911">Ministry of HR — Labor Inquiries</div></div>
 </div>`},
 {k:"travel", title:"Before You Travel Checklist", sub:"For those preparing to move", body:`<ul>
   <li>Verify your job offer and contract terms directly through Qiwa before traveling, if possible.</li>
   <li>Confirm who is paying for your visa, flight, and initial accommodation in writing.</li>
   <li>Save your recruitment agency's license number and your employer's official company name.</li>
   <li>Bring digital and physical copies of your passport, contract, and medical clearance certificate.</li>
 </ul>`}
],
ar: [
 {k:"labor", title:"نظام العمل والعقود", sub:"تعرّف على ما يجب أن يتضمنه عقدك", body:`<ul>
   <li>يجب أن يحدد عقد عملك المسمى الوظيفي والراتب وساعات العمل ومدة العقد — احصل على نسخة بلغة تفهمها.</li>
   <li>ساعات العمل النظامية ٨ ساعات يومياً أو ٤٨ ساعة أسبوعياً، وتُخفَّض في رمضان للعمال المسلمين.</li>
   <li>لا يحق لصاحب العمل الاحتفاظ بجواز سفرك في معظم القطاعات — اسأل عن حقوقك إن حدث ذلك.</li>
   <li>مكافأة نهاية الخدمة تُحسب حسب سنوات الخدمة — احتفظ بسجل خاص بتاريخ بدء عملك وتغييرات راتبك.</li>
 </ul>`},
 {k:"qiwa", title:"منصة قوى", sub:"البوابة الرسمية لخدمات العمل في السعودية", body:`<ul>
   <li>قوى هي المنصة الرسمية لإدارة عقود العمل والنقل والشكاوى العمالية — متاحة عبر التطبيق أو الموقع.</li>
   <li>يمكنك عرض وتأكيد تفاصيل عقدك بمجرد تسجيل صاحب العمل له في قوى.</li>
   <li>يمكن بدء طلبات نقل الكفالة والإبلاغ عن تأخر الراتب عبر قوى.</li>
   <li>تحقق دائماً من قوى مباشرة بدلاً من الاعتماد على كلام الوسيط بشأن حالة عقدك.</li>
 </ul>`},
 {k:"bank", title:"البنوك وتحويل الأموال", sub:"فتح الحسابات وأساسيات أبشر ونفاذ", body:`<ul>
   <li>تتطلب معظم البنوك إقامة سارية لفتح حساب؛ بعضها يوفر حسابات للوافدين الجدد بميزات محدودة.</li>
   <li><strong>أبشر</strong> هي المنصة الحكومية الرئيسية للخدمات الإلكترونية — اربط إقامتك ورقم جوالك للوصول إلى الخدمات الحكومية.</li>
   <li><strong>نفاذ</strong> هو تطبيق الهوية الرقمية الوطنية المستخدم للتحقق من هويتك في البنوك والخدمات الحكومية والخاصة — فعّله مبكراً فكثير من الخدمات باتت تتطلبه.</li>
   <li>استخدم شركات تحويل أموال مرخصة أو تطبيق بنكك للحوالات — تجنب وسطاء التحويل غير الرسميين.</li>
 </ul>`},
 {k:"iqama", title:"الإقامة والخدمات الحكومية", sub:"تصريح إقامتك بشرح مبسّط", body:`<ul>
   <li>الإقامة هي بطاقة هويتك للسكن — احملها دائماً، فهي مطلوبة لكل شيء تقريباً من شرائح الجوال إلى استئجار السكن.</li>
   <li>صاحب العمل مسؤول عادةً عن تجديد إقامتك في وقتها — تابع الأمر قبل انتهائها لتجنب الغرامات.</li>
   <li>مقيم هي البوابة الإلكترونية لمتابعة حالة إقامتك وتأشيرات الخروج والعودة وسجلات التابعين.</li>
   <li>انتهاء صلاحية الإقامة قد يؤثر على قدرتك على السفر أو فتح حساب بنكي أو تجديد رخصة القيادة.</li>
 </ul>`},
 {k:"health", title:"الرعاية الصحية", sub:"التأمين وأين تحصل على العلاج", body:`<ul>
   <li>عادة ما يُلزَم أصحاب العمل في القطاع الخاص بتوفير تأمين طبي — اطلب بطاقة التأمين وقائمة المستشفيات من الموارد البشرية.</li>
   <li>قد تختلف إجراءات المستشفيات الحكومية لغير المواطنين؛ العيادات الخاصة ومستشفيات شبكة التأمين عادة أسهل وصولاً.</li>
   <li>احتفظ بنسخة رقمية من بطاقة تأمينك ورقم الوثيقة على هاتفك.</li>
 </ul>`},
 {k:"emergency", title:"أرقام الطوارئ", sub:"احفظ هذه الأرقام الآن", body:`<div class="emergency-grid">
   <div class="em-item"><div class="num">911</div><div class="lbl">الطوارئ (الشرطة)</div></div>
   <div class="em-item"><div class="num">998</div><div class="lbl">الدفاع المدني (الإطفاء)</div></div>
   <div class="em-item"><div class="num">997</div><div class="lbl">الإسعاف (الهلال الأحمر)</div></div>
   <div class="em-item"><div class="num">19911</div><div class="lbl">وزارة الموارد البشرية — استفسارات العمل</div></div>
 </div>`},
 {k:"travel", title:"قائمة ما قبل السفر", sub:"لمن يستعد للانتقال", body:`<ul>
   <li>تحقق من عرض العمل وشروط العقد مباشرة عبر قوى قبل السفر إن أمكن.</li>
   <li>احصل على تأكيد كتابي بمن يدفع تكاليف التأشيرة والطيران والسكن الأولي.</li>
   <li>احتفظ برقم ترخيص مكتب الاستقدام والاسم الرسمي لشركة صاحب العمل.</li>
   <li>أحضر نسخاً رقمية وورقية من جواز سفرك وعقدك وشهادة الفحص الطبي.</li>
 </ul>`}
],
ur: [
 {k:"labor", title:"لیبر قانون اور معاہدے", sub:"جانیں کہ آپ کے معاہدے میں کیا شامل ہونا چاہیے", body:`<ul>
   <li>آپ کے ورک کنٹریکٹ میں جاب ٹائٹل، تنخواہ، اوقات کار اور مدت درج ہونی چاہیے — ایسی زبان میں کاپی لیں جو آپ سمجھتے ہوں۔</li>
   <li>معیاری اوقات کار 8 گھنٹے یومیہ یا 48 گھنٹے ہفتہ وار ہیں، رمضان میں مسلمان ورکرز کے لیے کم کیے جاتے ہیں۔</li>
   <li>زیادہ تر شعبوں میں آجر قانونی طور پر آپ کا پاسپورٹ نہیں رکھ سکتا — اگر ایسا ہو تو اپنے حقوق کے بارے میں پوچھیں۔</li>
   <li>سروس کے اختتام پر فوائد (گریجویٹی) سالوں کی خدمت کی بنیاد پر ہوتے ہیں — اپنی شروعاتی تاریخ اور تنخواہ کی تبدیلیوں کا ریکارڈ رکھیں۔</li>
 </ul>`},
 {k:"qiwa", title:"قویٰ پلیٹ فارم", sub:"سعودی عرب کا لیبر سروسز پورٹل", body:`<ul>
   <li>قویٰ ورک کنٹریکٹس، ٹرانسفرز اور لیبر شکایات کے انتظام کا سرکاری پلیٹ فارم ہے — ایپ یا ویب کے ذریعے قابل رسائی۔</li>
   <li>آجر کے رجسٹر کرنے کے بعد آپ اپنے معاہدے کی تفصیلات قویٰ پر دیکھ اور تصدیق کر سکتے ہیں۔</li>
   <li>ملازمت کی منتقلی کی درخواستیں، اور غیر ادا شدہ تنخواہ کی رپورٹنگ، دونوں قویٰ کے ذریعے شروع کی جا سکتی ہیں۔</li>
   <li>اپنے معاہدے کی صورتحال کے بارے میں ایجنٹ کی بات پر بھروسہ کرنے کے بجائے ہمیشہ قویٰ پر خود چیک کریں۔</li>
 </ul>`},
 {k:"bank", title:"بینکنگ اور رقم کی ترسیل", sub:"اکاؤنٹ کھولنا، ابشر اور نفاذ کے بنیادی اصول", body:`<ul>
   <li>زیادہ تر بینکوں کو اکاؤنٹ کھولنے کے لیے درست اقامہ درکار ہوتا ہے؛ کچھ نئے آنے والوں کے لیے محدود سہولیات والے اکاؤنٹس فراہم کرتے ہیں۔</li>
   <li><strong>ابشر</strong> حکومت کا اہم ای-سروسز پلیٹ فارم ہے — اپنا اقامہ اور فون نمبر منسلک کریں تاکہ حکومتی خدمات آن لائن حاصل کر سکیں۔</li>
   <li><strong>نفاذ</strong> قومی ڈیجیٹل شناختی ایپ ہے جو بینکنگ، حکومتی اور کئی نجی خدمات کے لیے شناخت کی تصدیق کرتی ہے — جلد انسٹال اور تصدیق مکمل کریں کیونکہ اب کئی خدمات کو اس کی ضرورت ہوتی ہے۔</li>
   <li>ترسیلات کے لیے لائسنس یافتہ منی ٹرانسفر آپریٹرز یا اپنے بینک کی ایپ استعمال کریں — غیر رسمی ایجنٹس سے گریز کریں۔</li>
 </ul>`},
 {k:"iqama", title:"اقامہ اور سرکاری خدمات", sub:"آپ کا رہائشی اجازت نامہ، سمجھایا گیا", body:`<ul>
   <li>اقامہ آپ کا رہائشی شناختی کارڈ ہے — ہمیشہ ساتھ رکھیں، سم کارڈ سے لے کر کرایہ تک تقریباً ہر چیز کے لیے درکار ہے۔</li>
   <li>عام طور پر آپ کے آجر کی ذمہ داری ہے کہ وہ وقت پر آپ کا اقامہ تجدید کرے — ختم ہونے سے پہلے پیروی کریں تاکہ جرمانوں سے بچا جا سکے۔</li>
   <li>مقیم آن لائن پورٹل ہے جہاں آپ اقامہ کی صورتحال، خروج/ری اینٹری ویزے اور زیر کفالت افراد کے ریکارڈز چیک کر سکتے ہیں۔</li>
   <li>ختم شدہ اقامہ سفر، اکاؤنٹ کھولنے یا ڈرائیونگ لائسنس کی تجدید پر اثر ڈال سکتا ہے۔</li>
 </ul>`},
 {k:"health", title:"صحت کی دیکھ بھال", sub:"انشورنس اور علاج کہاں سے کروائیں", body:`<ul>
   <li>نجی شعبے کے آجروں کے لیے عام طور پر میڈیکل انشورنس فراہم کرنا لازمی ہے — اپنا انشورنس کارڈ اور نیٹ ورک ہسپتالوں کی فہرست HR سے مانگیں۔</li>
   <li>سرکاری ہسپتالوں کا غیر شہریوں کے لیے الگ طریقہ کار ہو سکتا ہے؛ نجی کلینکس اور انشورنس نیٹ ورک ہسپتال عام طور پر زیادہ قابل رسائی ہوتے ہیں۔</li>
   <li>اپنے فون میں انشورنس کارڈ اور پالیسی نمبر کی ڈیجیٹل کاپی محفوظ رکھیں۔</li>
 </ul>`},
 {k:"emergency", title:"ہنگامی نمبرز", sub:"یہ نمبرز ابھی محفوظ کریں", body:`<div class="emergency-grid">
   <div class="em-item"><div class="num">911</div><div class="lbl">ایمرجنسی (پولیس)</div></div>
   <div class="em-item"><div class="num">998</div><div class="lbl">سول ڈیفنس (فائر)</div></div>
   <div class="em-item"><div class="num">997</div><div class="lbl">ایمبولینس (ریڈ کریسنٹ)</div></div>
   <div class="em-item"><div class="num">19911</div><div class="lbl">وزارت انسانی وسائل — لیبر انکوائریز</div></div>
 </div>`},
 {k:"travel", title:"سفر سے پہلے کی چیک لسٹ", sub:"منتقلی کی تیاری کرنے والوں کے لیے", body:`<ul>
   <li>ممکن ہو تو سفر سے پہلے اپنی جاب آفر اور معاہدے کی شرائط قویٰ کے ذریعے براہ راست تصدیق کریں۔</li>
   <li>تحریری طور پر تصدیق کریں کہ ویزا، فلائٹ اور ابتدائی رہائش کی ادائیگی کون کرے گا۔</li>
   <li>اپنی ریکروٹمنٹ ایجنسی کا لائسنس نمبر اور آجر کا سرکاری کمپنی نام محفوظ رکھیں۔</li>
   <li>پاسپورٹ، معاہدے اور میڈیکل کلیئرنس سرٹیفکیٹ کی ڈیجیٹل اور فزیکل کاپیاں ساتھ لائیں۔</li>
 </ul>`}
],
hi: [
 {k:"labor", title:"श्रम क़ानून और कॉन्ट्रैक्ट", sub:"जानें आपके कॉन्ट्रैक्ट में क्या-क्या होना चाहिए", body:`<ul>
   <li>आपके काम के कॉन्ट्रैक्ट में पद का नाम, तनख्वाह, काम के घंटे और कॉन्ट्रैक्ट की अवधि लिखी होनी चाहिए — इसकी एक कॉपी ऐसी भाषा में लें जो आप समझते हों।</li>
   <li>आम तौर पर काम के घंटे दिन में 8 या हफ़्ते में 48 होते हैं, और रमज़ान में मुस्लिम कामगारों के लिए कम हो जाते हैं।</li>
   <li>ज़्यादातर क्षेत्रों में मालिक क़ानूनी तौर पर आपका पासपोर्ट अपने पास नहीं रख सकता — ऐसा हो तो अपने अधिकारों के बारे में पूछें।</li>
   <li>सेवा-समाप्ति लाभ (ग्रेच्युटी) नौकरी के सालों के हिसाब से तय होता है — अपनी शुरुआत की तारीख और तनख्वाह में हुए बदलावों का अपना रिकॉर्ड रखें।</li>
 </ul>`},
 {k:"qiwa", title:"क़िवा प्लैटफ़ॉर्म", sub:"सऊदी अरब का श्रम सेवाओं का पोर्टल", body:`<ul>
   <li>क़िवा काम के कॉन्ट्रैक्ट, ट्रांसफ़र और श्रम शिकायतों के लिए आधिकारिक प्लैटफ़ॉर्म है — ऐप या वेबसाइट, दोनों से।</li>
   <li>मालिक के कॉन्ट्रैक्ट दर्ज करने के बाद आप क़िवा पर अपने कॉन्ट्रैक्ट की जानकारी देख सकते हैं और उसकी पुष्टि कर सकते हैं।</li>
   <li>नौकरी/मालिक बदलने का अनुरोध और बकाया तनख्वाह की शिकायत — दोनों क़िवा से शुरू किए जा सकते हैं।</li>
   <li>अपने कॉन्ट्रैक्ट की स्थिति के लिए किसी दलाल की बात पर नहीं, हमेशा सीधे क़िवा पर देखें।</li>
 </ul>`},
 {k:"bank", title:"बैंकिंग और पैसे भेजना", sub:"खाता खोलना, अबशर और नफ़ाद की बुनियादी बातें", body:`<ul>
   <li>ज़्यादातर बैंक खाता खोलने के लिए वैध इक़ामा माँगते हैं; कुछ बैंक नए आने वालों को सीमित सुविधाओं वाला खाता देते हैं।</li>
   <li><strong>अबशर</strong> नागरिकों और निवासियों के लिए सरकार का मुख्य ऑनलाइन सेवा प्लैटफ़ॉर्म है — सरकारी सेवाएँ ऑनलाइन लेने के लिए अपना इक़ामा और फ़ोन नंबर जोड़ें।</li>
   <li><strong>नफ़ाद</strong> राष्ट्रीय डिजिटल पहचान ऐप है, जिससे बैंक, सरकारी और कई निजी सेवाओं में आपकी पहचान की पुष्टि होती है — इसे जल्दी इंस्टॉल करके सत्यापन पूरा कर लें, क्योंकि अब कई सेवाओं में इसकी ज़रूरत पड़ती है।</li>
   <li>पैसे भेजने के लिए लाइसेंस वाली मनी-ट्रांसफ़र कंपनियाँ या अपने बैंक का ऐप इस्तेमाल करें — अनौपचारिक एजेंटों से बचें।</li>
 </ul>`},
 {k:"iqama", title:"इक़ामा और सरकारी सेवाएँ", sub:"आपका रेज़िडेंसी परमिट, आसान भाषा में", body:`<ul>
   <li>इक़ामा आपका रेज़िडेंसी आईडी है — इसे हमेशा साथ रखें, सिम कार्ड से लेकर किराये तक लगभग हर काम में इसकी ज़रूरत पड़ती है।</li>
   <li>आम तौर पर इक़ामा समय पर रिन्यू कराना आपके मालिक की ज़िम्मेदारी है — जुर्माने से बचने के लिए इसकी मियाद खत्म होने से पहले पूछते रहें।</li>
   <li>मुक़ीम वह ऑनलाइन पोर्टल है जहाँ इक़ामा की स्थिति, एग्ज़िट/री-एंट्री वीज़ा और परिवार के रिकॉर्ड देखे जाते हैं।</li>
   <li>इक़ामा की मियाद खत्म होने से यात्रा, खाता खोलने या ड्राइविंग लाइसेंस रिन्यू कराने में दिक्कत हो सकती है।</li>
 </ul>`},
 {k:"health", title:"इलाज और स्वास्थ्य", sub:"बीमा और इलाज कहाँ कराएँ", body:`<ul>
   <li>प्राइवेट सेक्टर के मालिकों को आम तौर पर मेडिकल बीमा देना होता है — HR से अपना बीमा कार्ड और नेटवर्क अस्पतालों की सूची माँगें।</li>
   <li>सरकारी अस्पतालों में गैर-नागरिकों के लिए अलग प्रक्रिया हो सकती है; प्राइवेट क्लिनिक और बीमा-नेटवर्क वाले अस्पताल आम तौर पर आसानी से मिल जाते हैं।</li>
   <li>अपने बीमा कार्ड और पॉलिसी नंबर की डिजिटल कॉपी फ़ोन में सेव रखें।</li>
 </ul>`},
 {k:"emergency", title:"आपातकालीन नंबर", sub:"ये नंबर अभी सेव कर लें", body:`<div class="emergency-grid">
   <div class="em-item"><div class="num">911</div><div class="lbl">इमरजेंसी (पुलिस)</div></div>
   <div class="em-item"><div class="num">998</div><div class="lbl">सिविल डिफ़ेंस (आग)</div></div>
   <div class="em-item"><div class="num">997</div><div class="lbl">एम्बुलेंस (रेड क्रिसेंट)</div></div>
   <div class="em-item"><div class="num">19911</div><div class="lbl">मानव संसाधन मंत्रालय — श्रम संबंधी पूछताछ</div></div>
 </div>`},
 {k:"travel", title:"सफ़र से पहले की चेकलिस्ट", sub:"जो सऊदी आने की तैयारी कर रहे हैं", body:`<ul>
   <li>हो सके तो सफ़र से पहले अपनी नौकरी के ऑफ़र और कॉन्ट्रैक्ट की शर्तें सीधे क़िवा से जाँच लें।</li>
   <li>वीज़ा, टिकट और शुरुआती रहने का खर्च कौन देगा — यह लिखित में पक्का कर लें।</li>
   <li>अपनी भर्ती एजेंसी का लाइसेंस नंबर और अपने मालिक की कंपनी का आधिकारिक नाम सेव कर लें।</li>
   <li>अपने पासपोर्ट, कॉन्ट्रैक्ट और मेडिकल सर्टिफ़िकेट की डिजिटल और काग़ज़ी कॉपी साथ लाएँ।</li>
 </ul>`}
],
bn: [
 {k:"labor", title:"শ্রম আইন ও চুক্তি", sub:"আপনার চুক্তিতে কী কী থাকতেই হবে জানুন", body:`<ul>
   <li>আপনার কাজের চুক্তিতে পদের নাম, বেতন, কাজের সময় ও চুক্তির মেয়াদ লেখা থাকতে হবে — এমন ভাষায় একটি কপি নিন যা আপনি বোঝেন।</li>
   <li>সাধারণ কাজের সময় দিনে ৮ ঘণ্টা বা সপ্তাহে ৪৮ ঘণ্টা; রমজানে মুসলিম কর্মীদের জন্য কমে যায়।</li>
   <li>বেশিরভাগ খাতে নিয়োগকর্তা আইনত আপনার পাসপোর্ট নিজের কাছে রাখতে পারেন না — এমন হলে আপনার অধিকার সম্পর্কে জেনে নিন।</li>
   <li>চাকরি শেষের সুবিধা (গ্র্যাচুইটি) চাকরির বছরের হিসাবে ঠিক হয় — আপনার যোগদানের তারিখ ও বেতন বদলের নিজস্ব রেকর্ড রাখুন।</li>
 </ul>`},
 {k:"qiwa", title:"কিওয়া প্ল্যাটফর্ম", sub:"সৌদি আরবের শ্রম সেবার পোর্টাল", body:`<ul>
   <li>কিওয়া হলো কাজের চুক্তি, বদলি ও শ্রম অভিযোগের সরকারি প্ল্যাটফর্ম — অ্যাপ বা ওয়েবসাইট দুটোতেই পাওয়া যায়।</li>
   <li>নিয়োগকর্তা চুক্তি নিবন্ধন করলে আপনি কিওয়াতে নিজের চুক্তির বিবরণ দেখতে ও নিশ্চিত করতে পারবেন।</li>
   <li>চাকরি/নিয়োগকর্তা বদলের আবেদন এবং বকেয়া বেতনের অভিযোগ — দুটোই কিওয়া থেকে শুরু করা যায়।</li>
   <li>চুক্তির অবস্থা জানতে দালালের কথায় নয়, সবসময় সরাসরি কিওয়াতে দেখুন।</li>
 </ul>`},
 {k:"bank", title:"ব্যাংকিং ও টাকা পাঠানো", sub:"অ্যাকাউন্ট খোলা, আবশের ও নাফাদের মূল কথা", body:`<ul>
   <li>বেশিরভাগ ব্যাংক অ্যাকাউন্ট খুলতে বৈধ ইকামা চায়; কিছু ব্যাংক নতুনদের সীমিত সুবিধার অ্যাকাউন্ট দেয়।</li>
   <li><strong>আবশের</strong> নাগরিক ও বাসিন্দাদের জন্য সরকারের প্রধান ই-সেবা প্ল্যাটফর্ম — অনলাইনে সরকারি সেবা পেতে আপনার ইকামা ও ফোন নম্বর যুক্ত করুন।</li>
   <li><strong>নাফাদ</strong> হলো জাতীয় ডিজিটাল পরিচয় অ্যাপ, যা ব্যাংক, সরকারি ও অনেক বেসরকারি সেবায় আপনার পরিচয় যাচাই করে — আগেভাগে ইনস্টল করে যাচাই শেষ করুন, কারণ এখন অনেক সেবায় এটি লাগে।</li>
   <li>টাকা পাঠাতে লাইসেন্সপ্রাপ্ত মানি ট্রান্সফার প্রতিষ্ঠান বা আপনার ব্যাংকের অ্যাপ ব্যবহার করুন — অনানুষ্ঠানিক এজেন্ট এড়িয়ে চলুন।</li>
 </ul>`},
 {k:"iqama", title:"ইকামা ও সরকারি সেবা", sub:"আপনার বসবাসের অনুমতিপত্র, সহজ ভাষায়", body:`<ul>
   <li>ইকামা আপনার বসবাসের পরিচয়পত্র — সবসময় সাথে রাখুন, সিম কার্ড থেকে বাসা ভাড়া পর্যন্ত প্রায় সব কাজে এটি লাগে।</li>
   <li>সাধারণত সময়মতো ইকামা নবায়নের দায়িত্ব নিয়োগকর্তার — জরিমানা এড়াতে মেয়াদ শেষ হওয়ার আগেই খোঁজ নিন।</li>
   <li>মুকিম হলো অনলাইন পোর্টাল, যেখানে ইকামার অবস্থা, এক্সিট/রি-এন্ট্রি ভিসা ও পরিবারের রেকর্ড দেখা যায়।</li>
   <li>মেয়াদোত্তীর্ণ ইকামায় ভ্রমণ, অ্যাকাউন্ট খোলা বা ড্রাইভিং লাইসেন্স নবায়নে সমস্যা হতে পারে।</li>
 </ul>`},
 {k:"health", title:"চিকিৎসা", sub:"বিমা এবং কোথায় চিকিৎসা নেবেন", body:`<ul>
   <li>বেসরকারি খাতের নিয়োগকর্তাদের সাধারণত মেডিকেল বিমা দিতে হয় — HR-এর কাছে আপনার বিমা কার্ড ও নেটওয়ার্ক হাসপাতালের তালিকা চান।</li>
   <li>সরকারি হাসপাতালে অ-নাগরিকদের জন্য আলাদা নিয়ম থাকতে পারে; বেসরকারি ক্লিনিক ও বিমা-নেটওয়ার্কের হাসপাতালে সাধারণত সহজে সেবা পাওয়া যায়।</li>
   <li>আপনার বিমা কার্ড ও পলিসি নম্বরের ডিজিটাল কপি ফোনে সেভ করে রাখুন।</li>
 </ul>`},
 {k:"emergency", title:"জরুরি নম্বর", sub:"এই নম্বরগুলো এখনই সেভ করুন", body:`<div class="emergency-grid">
   <div class="em-item"><div class="num">911</div><div class="lbl">জরুরি (পুলিশ)</div></div>
   <div class="em-item"><div class="num">998</div><div class="lbl">সিভিল ডিফেন্স (আগুন)</div></div>
   <div class="em-item"><div class="num">997</div><div class="lbl">অ্যাম্বুলেন্স (রেড ক্রিসেন্ট)</div></div>
   <div class="em-item"><div class="num">19911</div><div class="lbl">মানবসম্পদ মন্ত্রণালয় — শ্রম বিষয়ক তথ্য</div></div>
 </div>`},
 {k:"travel", title:"যাত্রার আগের চেকলিস্ট", sub:"যারা সৌদি আসার প্রস্তুতি নিচ্ছেন", body:`<ul>
   <li>সম্ভব হলে যাত্রার আগে চাকরির অফার ও চুক্তির শর্ত সরাসরি কিওয়াতে যাচাই করুন।</li>
   <li>ভিসা, বিমান টিকিট ও শুরুর থাকার খরচ কে দেবে — লিখিতভাবে নিশ্চিত হয়ে নিন।</li>
   <li>আপনার রিক্রুটিং এজেন্সির লাইসেন্স নম্বর ও নিয়োগকর্তার কোম্পানির সরকারি নাম সেভ করে রাখুন।</li>
   <li>পাসপোর্ট, চুক্তি ও মেডিকেল সার্টিফিকেটের ডিজিটাল ও কাগজের কপি সাথে আনুন।</li>
 </ul>`}
]
};

/* ============================= "Looking for work?" content ============================= */
/* The work page's cards in all five languages. Every rule is from an official government source
   (the pull request that added the page lists them), and the amounts, phone numbers and links
   are the same in every language. */
const workData = {
en: {
 legal:{title:"The legal way, step by step", sub:"From job offer to iqama", body:`<ol>
   <li><strong>A real job offer</strong> from a named employer in Saudi Arabia: a company, or a household for home jobs such as house driver or housemaid.</li>
   <li><strong>A licensed agent</strong> in your own country. Check the licence on your government's official list before you pay anything.</li>
   <li><strong>A written contract.</strong> Read it before you travel and keep a copy.</li>
   <li><strong>A work visa.</strong> You can check an issued visa with the Ministry of Foreign Affairs visa enquiry service. Some skilled trades also need a skills test (Skill Verification Program): ask your agent if yours does.</li>
   <li><strong>Your country's exit steps</strong>, such as emigration registration and insurance. Choose your country above to see them.</li>
   <li><strong>After you arrive</strong>, your employer gets your iqama. For company jobs the contract is recorded on Qiwa, and you can accept it, reject it or ask for changes from your own Qiwa account. Home jobs (domestic workers) go through Musaned.</li>
 </ol>`},
 signs:{title:"Warning signs of a fake offer", sub:"If you see one, stop and check", body:`<ul>
   <li>Someone asks you to pay for the visa (a "visa price").</li>
   <li>A "free visa" or "Azad visa" that lets you work for anyone.</li>
   <li>A travel agent or a "visa dealer" offers you a job. Only licensed recruitment agents may.</li>
   <li>You are told to come on a visit, Umrah or Hajj visa and "change it later".</li>
   <li>No written contract, or a contract different from what you were promised.</li>
   <li>The agent can't show you a licence number that you can check on the official list.</li>
   <li>You are told the employer will keep your passport. That is illegal: keep your passport yourself.</li>
 </ul>`},
 fees:{title:"Who pays for what", sub:"What the law says", body:`<ul>
   <li><strong>In Saudi Arabia:</strong> the employer pays the recruitment fees, the iqama and work permit fees and their renewal, and your ticket home when the job ends (Labor Law, Article 40). If you leave the job without a valid reason, you may have to pay your own ticket home.</li>
   <li><strong>Home jobs:</strong> recruitment offices may not ask a domestic worker for money for recruitment.</li>
   <li><strong>Pakistan:</strong> the licensed agent's service charge is Rs 15,000, paid into a bank. Other real costs (ticket, medical, visa, documents) only with receipts.</li>
   <li><strong>India:</strong> the agent's service charge can be at most Rs 30,000 + 18% GST, with a receipt.</li>
   <li>Always ask for a receipt, and never pay a "visa price".</li>
 </ul>`},
 pk:{title:"Steps in Pakistan", sub:"Bureau of Emigration rules", body:`<ol>
   <li><strong>Use only a licensed OEP</strong> (Overseas Employment Promoter). Only a licensed OEP may arrange a job abroad. Check the licence with the Bureau of Emigration &amp; Overseas Employment (BE&amp;OE). Don't pay a travel agent for a work visa.</li>
   <li><strong>Service charge: Rs 15,000, paid into a bank.</strong> Don't hand it to the agent in cash. The bank gives you a certificate. The agent gets the money only after you join the job, and you get it back if the job doesn't happen.</li>
   <li><strong>Other costs only with receipts.</strong> The agent may charge only real costs (air ticket, medical, visa, documents), with numbered receipts.</li>
   <li><strong>Register with the Protector of Emigrants</strong> before you fly. It is a required step for workers going abroad.</li>
   <li><strong>Problems with an agent?</strong> Complain to BE&amp;OE.</li>
 </ol>`},
 in:{title:"Steps in India", sub:"Ministry of External Affairs rules", body:`<ol>
   <li><strong>Use only a Recruiting Agent registered on eMigrate.</strong> Check the "List of active RA" on emigrate.gov.in. The licence number must be shown in the agent's office and adverts.</li>
   <li><strong>Service charge: at most Rs 30,000 + 18% GST,</strong> and the agent must give you a receipt.</li>
   <li><strong>ECR passport?</strong> If your passport is marked "Emigration Check Required" (ECR), you need emigration clearance through eMigrate before you go to work in Saudi Arabia.</li>
   <li><strong>Insurance:</strong> ECR workers must take Pravasi Bharatiya Bima Yojana (PBBY): Rs 275 for 2 years or Rs 375 for 3 years, with Rs 10 lakh cover for accidental death or permanent disability.</li>
   <li><strong>Help:</strong> call the 24x7 helpline 1800 11 3090 (toll-free in India). From Saudi Arabia, you can raise a problem with the Indian Embassy on MADAD.</li>
 </ol>`},
 other:{title:"Steps in your country", sub:"Ask your own government first", body:`<ul>
   <li>Your own government may have rules for working abroad, such as licensed agents, limits on fees and registration before you leave. Ask its labour or emigration office before you pay anyone.</li>
   <li>The Saudi rules on this page apply to you too: the employer pays the recruitment and iqama fees, and you need a real work visa and a written contract.</li>
   <li>Sanad has country steps for Pakistan and India for now.</li>
 </ul>`},
 links:{title:"Official websites", sub:"Check everything here, not on WhatsApp",
  sa:`<ul class="work-links">
   <li><a href="https://www.mofa.gov.sa/en/eservices/Pages/svc89.aspx" target="_blank" rel="noopener">Ministry of Foreign Affairs: check an issued visa</a></li>
   <li><a href="https://qiwa.sa" target="_blank" rel="noopener">Qiwa: work contracts for company jobs</a></li>
   <li><a href="https://musaned.gov.sa" target="_blank" rel="noopener">Musaned: home jobs and licensed recruitment offices</a></li>
   <li><a href="https://www.hrsd.gov.sa/en/knowledge-centre/articles/64434" target="_blank" rel="noopener">Ministry of Human Resources: what the employer pays (Article 40)</a></li>
   <li>Labour helpline: <a href="tel:19911">19911</a></li>
 </ul>`,
  pk:`<ul class="work-links">
   <li><a href="https://beoe.gov.pk" target="_blank" rel="noopener">Bureau of Emigration &amp; Overseas Employment (BE&amp;OE)</a></li>
 </ul>`,
  in:`<ul class="work-links">
   <li><a href="https://www.emigrate.gov.in/" target="_blank" rel="noopener">eMigrate: registered agents and emigration clearance</a></li>
   <li><a href="https://www.mea.gov.in/pbby.htm" target="_blank" rel="noopener">PBBY insurance</a></li>
   <li><a href="https://www.madad.gov.in/madad/" target="_blank" rel="noopener">MADAD: help from the Indian Embassy</a></li>
   <li>Helpline (toll-free in India): <a href="tel:18001113090">1800 11 3090</a></li>
 </ul>`}
},
ar: {
 legal:{title:"الطريق النظامي خطوة بخطوة", sub:"من عرض العمل حتى الإقامة", body:`<ol>
   <li><strong>عرض عمل حقيقي</strong> من صاحب عمل معروف بالاسم في السعودية: شركة، أو أسرة في العمالة المنزلية مثل السائق الخاص أو العاملة المنزلية.</li>
   <li><strong>وكيل مرخّص</strong> في بلدك. تحقّق من رخصته في القائمة الرسمية لحكومتك قبل أن تدفع أي شيء.</li>
   <li><strong>عقد مكتوب.</strong> اقرأه قبل السفر واحتفظ بنسخة منه.</li>
   <li><strong>تأشيرة عمل.</strong> تستطيع الاستعلام عن التأشيرة الصادرة عبر خدمة وزارة الخارجية. بعض المهن الفنية تحتاج أيضًا اختبار مهارات (برنامج الفحص المهني)، فاسأل وكيلك إن كانت مهنتك منها.</li>
   <li><strong>خطوات الخروج في بلدك</strong> مثل تسجيل الهجرة والتأمين. اختر بلدك في الأعلى لتظهر لك.</li>
   <li><strong>بعد الوصول</strong> يستخرج صاحب العمل إقامتك. في عمل الشركات يُوثَّق العقد في منصة قوى، وتستطيع قبوله أو رفضه أو طلب تعديله من حسابك في قوى. العمالة المنزلية تتم عبر منصة مساند.</li>
 </ol>`},
 signs:{title:"علامات عرض العمل الوهمي", sub:"إذا رأيت واحدة منها، توقّف وتحقّق", body:`<ul>
   <li>أحد يطلب منك دفع «قيمة الفيزا».</li>
   <li>«فيزا حرة» تسمح لك بالعمل عند أي أحد.</li>
   <li>وكيل سفر أو «تاجر فيز» يعرض عليك عملًا. هذا من حق وكلاء الاستقدام المرخّصين فقط.</li>
   <li>يقولون لك تعال بتأشيرة زيارة أو عمرة أو حج و«نغيّرها بعدين».</li>
   <li>لا يوجد عقد مكتوب، أو العقد مختلف عمّا وُعدت به.</li>
   <li>الوكيل لا يستطيع أن يريك رقم رخصة تتحقق منه في القائمة الرسمية.</li>
   <li>يقولون إن صاحب العمل سيحتفظ بجوازك. هذا غير نظامي: احتفظ بجوازك بنفسك.</li>
 </ul>`},
 fees:{title:"من يدفع ماذا", sub:"ماذا يقول النظام", body:`<ul>
   <li><strong>في السعودية:</strong> يتحمل صاحب العمل رسوم الاستقدام، ورسوم الإقامة ورخصة العمل وتجديدهما، وتذكرة عودتك إلى بلدك عند انتهاء العمل (نظام العمل، المادة ٤٠). إذا تركت العمل دون سبب مشروع قد تتحمل تذكرة عودتك بنفسك.</li>
   <li><strong>العمالة المنزلية:</strong> لا يجوز لمكاتب الاستقدام طلب أي مال من العامل المنزلي مقابل استقدامه.</li>
   <li><strong>باكستان:</strong> رسوم خدمة الوكيل المرخّص ١٥٬٠٠٠ روبية تُودَع في البنك. أي تكاليف فعلية أخرى (التذكرة، الفحص الطبي، التأشيرة، الأوراق) بإيصالات فقط.</li>
   <li><strong>الهند:</strong> رسوم خدمة الوكيل لا تزيد على ٣٠٬٠٠٠ روبية + ضريبة ١٨٪، مع إيصال.</li>
   <li>اطلب إيصالًا دائمًا، ولا تدفع «قيمة فيزا» أبدًا.</li>
 </ul>`},
 pk:{title:"الخطوات في باكستان", sub:"أنظمة مكتب الهجرة والتوظيف الخارجي", body:`<ol>
   <li><strong>تعامل فقط مع OEP مرخّص</strong> (مروّج التوظيف الخارجي). وحده يحق له ترتيب عمل في الخارج. تحقّق من الرخصة لدى مكتب الهجرة والتوظيف الخارجي (BE&amp;OE). لا تدفع لوكيل سفر مقابل تأشيرة عمل.</li>
   <li><strong>رسوم الخدمة ١٥٬٠٠٠ روبية تُدفع في البنك.</strong> لا تسلّمها للوكيل نقدًا. البنك يعطيك شهادة. الوكيل يستلم المبلغ فقط بعد أن تبدأ العمل، وتسترده إذا لم يتم التوظيف.</li>
   <li><strong>التكاليف الأخرى بإيصالات فقط.</strong> يحق للوكيل أخذ التكاليف الفعلية فقط (تذكرة الطيران، الفحص الطبي، التأشيرة، الأوراق) بإيصالات مرقّمة.</li>
   <li><strong>سجّل لدى «حامي المهاجرين»</strong> (Protector of Emigrants) قبل السفر. هذه خطوة مطلوبة للعمال المسافرين للخارج.</li>
   <li><strong>عندك مشكلة مع وكيل؟</strong> قدّم شكوى إلى BE&amp;OE.</li>
 </ol>`},
 in:{title:"الخطوات في الهند", sub:"أنظمة وزارة الشؤون الخارجية", body:`<ol>
   <li><strong>تعامل فقط مع وكيل توظيف مسجّل في eMigrate.</strong> تحقّق من «قائمة الوكلاء النشطين» (List of active RA) في موقع emigrate.gov.in. يجب أن يظهر رقم الرخصة في مكتب الوكيل وإعلاناته.</li>
   <li><strong>رسوم الخدمة ٣٠٬٠٠٠ روبية كحد أقصى + ضريبة ١٨٪</strong>، ويجب أن يعطيك الوكيل إيصالًا.</li>
   <li><strong>جوازك ECR؟</strong> إذا كان جوازك مختومًا بعبارة «يتطلب فحص الهجرة» (Emigration Check Required)، تحتاج تصريح هجرة عبر eMigrate قبل السفر للعمل في السعودية.</li>
   <li><strong>التأمين:</strong> على عمال ECR الاشتراك في تأمين Pravasi Bharatiya Bima Yojana ‏(PBBY): ٢٧٥ روبية لسنتين أو ٣٧٥ روبية لثلاث سنوات، بتغطية ١٠ لاكه روبية (مليون روبية) عند الوفاة أو العجز الدائم بسبب حادث.</li>
   <li><strong>المساعدة:</strong> الخط الساخن على مدار الساعة 1800 11 3090 (مجاني داخل الهند). ومن السعودية تستطيع رفع مشكلتك للسفارة الهندية عبر منصة MADAD.</li>
 </ol>`},
 other:{title:"الخطوات في بلدك", sub:"اسأل حكومة بلدك أولًا", body:`<ul>
   <li>قد تكون لحكومة بلدك أنظمة للعمل في الخارج، مثل الوكلاء المرخّصين وحدود الرسوم والتسجيل قبل السفر. اسأل مكتب العمل أو الهجرة في بلدك قبل أن تدفع لأي أحد.</li>
   <li>الأنظمة السعودية في هذه الصفحة تنطبق عليك أيضًا: صاحب العمل يتحمل رسوم الاستقدام والإقامة، وتحتاج تأشيرة عمل حقيقية وعقدًا مكتوبًا.</li>
   <li>في سند حاليًا خطوات خاصة بباكستان والهند فقط.</li>
 </ul>`},
 links:{title:"المواقع الرسمية", sub:"تحقّق من كل شيء هنا، لا عبر الواتساب",
  sa:`<ul class="work-links">
   <li><a href="https://www.mofa.gov.sa/en/eservices/Pages/svc89.aspx" target="_blank" rel="noopener">وزارة الخارجية: الاستعلام عن تأشيرة صادرة</a></li>
   <li><a href="https://qiwa.sa" target="_blank" rel="noopener">قوى: عقود العمل في الشركات</a></li>
   <li><a href="https://musaned.gov.sa" target="_blank" rel="noopener">مساند: العمالة المنزلية ومكاتب الاستقدام المرخّصة</a></li>
   <li><a href="https://www.hrsd.gov.sa/en/knowledge-centre/articles/64434" target="_blank" rel="noopener">وزارة الموارد البشرية: ما يتحمله صاحب العمل (المادة ٤٠)</a></li>
   <li>خط العمل: <a href="tel:19911">19911</a></li>
 </ul>`,
  pk:`<ul class="work-links">
   <li><a href="https://beoe.gov.pk" target="_blank" rel="noopener">مكتب الهجرة والتوظيف الخارجي (BE&amp;OE)</a></li>
 </ul>`,
  in:`<ul class="work-links">
   <li><a href="https://www.emigrate.gov.in/" target="_blank" rel="noopener">eMigrate: الوكلاء المسجّلون وتصريح الهجرة</a></li>
   <li><a href="https://www.mea.gov.in/pbby.htm" target="_blank" rel="noopener">تأمين PBBY</a></li>
   <li><a href="https://www.madad.gov.in/madad/" target="_blank" rel="noopener">MADAD: مساعدة السفارة الهندية</a></li>
   <li>الخط الساخن (مجاني داخل الهند): <a href="tel:18001113090">1800 11 3090</a></li>
 </ul>`}
},
ur: {
 legal:{title:"قانونی طریقہ، قدم بہ قدم", sub:"نوکری کی پیشکش سے اقامہ تک", body:`<ol>
   <li><strong>اصل نوکری کی پیشکش</strong> سعودی عرب میں کسی نام سے معلوم آجر کی طرف سے: کوئی کمپنی، یا گھریلو کام (جیسے ہاؤس ڈرائیور یا گھریلو ملازمہ) کے لیے کوئی گھرانہ۔</li>
   <li><strong>لائسنس یافتہ ایجنٹ</strong> آپ کے اپنے ملک میں۔ کچھ بھی ادا کرنے سے پہلے اپنی حکومت کی سرکاری فہرست میں اس کا لائسنس چیک کریں۔</li>
   <li><strong>تحریری معاہدہ۔</strong> سفر سے پہلے پڑھیں اور اس کی کاپی رکھیں۔</li>
   <li><strong>ورک ویزا۔</strong> جاری شدہ ویزا وزارتِ خارجہ کی ویزا انکوائری سروس سے چیک کیا جا سکتا ہے۔ کچھ ہنرمند پیشوں کے لیے مہارت کا ٹیسٹ (اسکل ویریفکیشن پروگرام) بھی ضروری ہے: اپنے ایجنٹ سے پوچھیں کہ کیا آپ کا پیشہ اس میں شامل ہے۔</li>
   <li><strong>اپنے ملک سے روانگی کے مراحل</strong>، جیسے امیگریشن رجسٹریشن اور انشورنس۔ دیکھنے کے لیے اوپر اپنا ملک چنیں۔</li>
   <li><strong>پہنچنے کے بعد</strong> آجر آپ کا اقامہ بنواتا ہے۔ کمپنی کی نوکری میں معاہدہ قویٰ پر درج ہوتا ہے، اور آپ اپنے قویٰ اکاؤنٹ سے اسے قبول یا مسترد کر سکتے ہیں یا تبدیلی کی درخواست دے سکتے ہیں۔ گھریلو ملازمتیں مساند کے ذریعے ہوتی ہیں۔</li>
 </ol>`},
 signs:{title:"جعلی نوکری کی پیشکش کی نشانیاں", sub:"ان میں سے کوئی بھی دکھے تو رک کر تصدیق کریں", body:`<ul>
   <li>کوئی آپ سے ویزے کی قیمت مانگے۔</li>
   <li>"آزاد ویزا" جس پر کسی کے پاس بھی کام کیا جا سکے۔</li>
   <li>ٹریول ایجنٹ یا "ویزا ڈیلر" نوکری کی پیشکش کرے۔ یہ صرف لائسنس یافتہ ریکروٹمنٹ ایجنٹ کر سکتے ہیں۔</li>
   <li>کہا جائے کہ وزٹ، عمرہ یا حج ویزا پر آ جاؤ اور "بعد میں بدل دیں گے"۔</li>
   <li>کوئی تحریری معاہدہ نہیں، یا معاہدہ وعدے سے مختلف ہے۔</li>
   <li>ایجنٹ ایسا لائسنس نمبر نہ دکھا سکے جسے آپ سرکاری فہرست میں چیک کر سکیں۔</li>
   <li>کہا جائے کہ آجر آپ کا پاسپورٹ اپنے پاس رکھے گا۔ یہ غیر قانونی ہے: اپنا پاسپورٹ خود رکھیں۔</li>
 </ul>`},
 fees:{title:"کون کس چیز کا خرچ دیتا ہے", sub:"قانون کیا کہتا ہے", body:`<ul>
   <li><strong>سعودی عرب میں:</strong> بھرتی کی فیس، اقامہ اور ورک پرمٹ کی فیس اور ان کی تجدید، اور نوکری ختم ہونے پر آپ کا واپسی کا ٹکٹ آجر دیتا ہے (لیبر قانون، آرٹیکل 40)۔ اگر آپ بغیر جائز وجہ کے نوکری چھوڑیں تو واپسی کا ٹکٹ خود دینا پڑ سکتا ہے۔</li>
   <li><strong>گھریلو ملازمتیں:</strong> ریکروٹمنٹ دفاتر گھریلو ملازم سے بھرتی کے بدلے پیسے نہیں مانگ سکتے۔</li>
   <li><strong>پاکستان:</strong> لائسنس یافتہ ایجنٹ کا سروس چارج 15,000 روپے ہے جو بینک میں جمع ہوتا ہے۔ باقی اصل اخراجات (ٹکٹ، میڈیکل، ویزا، کاغذات) صرف رسید کے ساتھ۔</li>
   <li><strong>بھارت:</strong> ایجنٹ کا سروس چارج زیادہ سے زیادہ 30,000 روپے + 18% GST، رسید کے ساتھ۔</li>
   <li>ہمیشہ رسید مانگیں، اور کبھی "ویزے کی قیمت" نہ دیں۔</li>
 </ul>`},
 pk:{title:"پاکستان میں مراحل", sub:"بیورو آف امیگریشن کے قواعد", body:`<ol>
   <li><strong>صرف لائسنس یافتہ OEP سے کام کروائیں</strong> (اوورسیز ایمپلائمنٹ پروموٹر)۔ بیرون ملک نوکری صرف لائسنس یافتہ OEP دلوا سکتا ہے۔ لائسنس بیورو آف امیگریشن اینڈ اوورسیز ایمپلائمنٹ (BE&amp;OE) سے چیک کریں۔ ورک ویزے کے لیے ٹریول ایجنٹ کو پیسے نہ دیں۔</li>
   <li><strong>سروس چارج: 15,000 روپے، بینک کے ذریعے۔</strong> ایجنٹ کو نقد نہ دیں۔ بینک آپ کو سرٹیفکیٹ دیتا ہے۔ ایجنٹ کو یہ رقم آپ کے نوکری شروع کرنے کے بعد ہی ملتی ہے، اور نوکری نہ ہونے پر آپ کو واپس ملتی ہے۔</li>
   <li><strong>باقی اخراجات صرف رسید کے ساتھ۔</strong> ایجنٹ صرف اصل اخراجات (ہوائی ٹکٹ، میڈیکل، ویزا، کاغذات) نمبر والی رسیدوں کے ساتھ لے سکتا ہے۔</li>
   <li><strong>روانگی سے پہلے پروٹیکٹر آف ایمیگرنٹس کے دفتر میں رجسٹریشن</strong> کروائیں۔ بیرون ملک جانے والے ورکرز کے لیے یہ ضروری مرحلہ ہے۔</li>
   <li><strong>ایجنٹ سے مسئلہ ہے؟</strong> BE&amp;OE میں شکایت درج کروائیں۔</li>
 </ol>`},
 in:{title:"بھارت میں مراحل", sub:"وزارتِ خارجہ کے قواعد", body:`<ol>
   <li><strong>صرف eMigrate پر رجسٹرڈ ریکروٹنگ ایجنٹ سے کام کروائیں۔</strong> emigrate.gov.in پر "List of active RA" میں چیک کریں۔ لائسنس نمبر ایجنٹ کے دفتر اور اشتہارات میں نظر آنا ضروری ہے۔</li>
   <li><strong>سروس چارج: زیادہ سے زیادہ 30,000 روپے + 18% GST</strong>، اور ایجنٹ کو رسید دینی ہوگی۔</li>
   <li><strong>ECR پاسپورٹ؟</strong> اگر آپ کے پاسپورٹ پر "Emigration Check Required" (ECR) لکھا ہے تو سعودی عرب کام کے لیے جانے سے پہلے eMigrate کے ذریعے امیگریشن کلیئرنس لینی ہوگی۔</li>
   <li><strong>انشورنس:</strong> ECR ورکرز کے لیے پرواسی بھارتیہ بیمہ یوجنا (PBBY) ضروری ہے: 2 سال کے لیے 275 روپے یا 3 سال کے لیے 375 روپے، حادثاتی موت یا مستقل معذوری پر 10 لاکھ روپے کا کور۔</li>
   <li><strong>مدد:</strong> 24 گھنٹے ہیلپ لائن 1800 11 3090 (بھارت میں مفت)۔ سعودی عرب سے آپ MADAD کے ذریعے بھارتی سفارت خانے تک اپنا مسئلہ پہنچا سکتے ہیں۔</li>
 </ol>`},
 other:{title:"آپ کے ملک میں مراحل", sub:"پہلے اپنی حکومت سے پوچھیں", body:`<ul>
   <li>آپ کی حکومت کے بیرون ملک کام کے لیے قواعد ہو سکتے ہیں، جیسے لائسنس یافتہ ایجنٹ، فیس کی حد اور روانگی سے پہلے رجسٹریشن۔ کسی کو پیسے دینے سے پہلے اپنے ملک کے لیبر یا امیگریشن دفتر سے پوچھیں۔</li>
   <li>اس صفحے کے سعودی قواعد آپ پر بھی لاگو ہوتے ہیں: بھرتی اور اقامہ کی فیس آجر دیتا ہے، اور آپ کو اصل ورک ویزا اور تحریری معاہدہ چاہیے۔</li>
   <li>سند پر فی الحال صرف پاکستان اور بھارت کے مراحل موجود ہیں۔</li>
 </ul>`},
 links:{title:"سرکاری ویب سائٹس", sub:"ہر چیز یہاں چیک کریں، واٹس ایپ پر نہیں",
  sa:`<ul class="work-links">
   <li><a href="https://www.mofa.gov.sa/en/eservices/Pages/svc89.aspx" target="_blank" rel="noopener">وزارتِ خارجہ: جاری شدہ ویزا چیک کریں</a></li>
   <li><a href="https://qiwa.sa" target="_blank" rel="noopener">قویٰ: کمپنی کی نوکریوں کے معاہدے</a></li>
   <li><a href="https://musaned.gov.sa" target="_blank" rel="noopener">مساند: گھریلو ملازمتیں اور لائسنس یافتہ ریکروٹمنٹ دفاتر</a></li>
   <li><a href="https://www.hrsd.gov.sa/en/knowledge-centre/articles/64434" target="_blank" rel="noopener">وزارتِ انسانی وسائل: آجر کیا خرچ دیتا ہے (آرٹیکل 40)</a></li>
   <li>لیبر ہیلپ لائن: <a href="tel:19911">19911</a></li>
 </ul>`,
  pk:`<ul class="work-links">
   <li><a href="https://beoe.gov.pk" target="_blank" rel="noopener">بیورو آف امیگریشن اینڈ اوورسیز ایمپلائمنٹ (BE&amp;OE)</a></li>
 </ul>`,
  in:`<ul class="work-links">
   <li><a href="https://www.emigrate.gov.in/" target="_blank" rel="noopener">eMigrate: رجسٹرڈ ایجنٹ اور امیگریشن کلیئرنس</a></li>
   <li><a href="https://www.mea.gov.in/pbby.htm" target="_blank" rel="noopener">PBBY انشورنس</a></li>
   <li><a href="https://www.madad.gov.in/madad/" target="_blank" rel="noopener">MADAD: بھارتی سفارت خانے سے مدد</a></li>
   <li>ہیلپ لائن (بھارت میں مفت): <a href="tel:18001113090">1800 11 3090</a></li>
 </ul>`}
},
hi: {
 legal:{title:"क़ानूनी रास्ता, कदम दर कदम", sub:"नौकरी के ऑफ़र से इक़ामा तक", body:`<ol>
   <li><strong>असली नौकरी का ऑफ़र</strong> सऊदी अरब के किसी नाम से पता मालिक से: कोई कंपनी, या घरेलू काम (जैसे हाउस ड्राइवर या घरेलू कामगार) के लिए कोई परिवार।</li>
   <li><strong>लाइसेंस वाला एजेंट</strong> आपके अपने देश में। कुछ भी देने से पहले अपनी सरकार की सरकारी सूची में उसका लाइसेंस जाँचें।</li>
   <li><strong>लिखा हुआ कॉन्ट्रैक्ट।</strong> सफ़र से पहले पढ़ें और उसकी कॉपी रखें।</li>
   <li><strong>वर्क वीज़ा।</strong> जारी हुआ वीज़ा सऊदी विदेश मंत्रालय की वीज़ा जाँच सेवा पर देखा जा सकता है। कुछ हुनर वाले कामों के लिए स्किल टेस्ट (स्किल वेरिफ़िकेशन प्रोग्राम) भी ज़रूरी है: अपने एजेंट से पूछें कि क्या आपका काम इसमें आता है।</li>
   <li><strong>अपने देश से निकलने के कदम</strong>, जैसे इमिग्रेशन रजिस्ट्रेशन और बीमा। देखने के लिए ऊपर अपना देश चुनें।</li>
   <li><strong>पहुँचने के बाद</strong> मालिक आपका इक़ामा बनवाता है। कंपनी की नौकरी में कॉन्ट्रैक्ट क़िवा पर दर्ज होता है, और आप अपने क़िवा अकाउंट से उसे मंज़ूर या नामंज़ूर कर सकते हैं या बदलाव माँग सकते हैं। घरेलू काम मुसानेद के ज़रिए होते हैं।</li>
 </ol>`},
 signs:{title:"नकली नौकरी के ऑफ़र की निशानियाँ", sub:"इनमें से कोई भी दिखे तो रुककर जाँचें", body:`<ul>
   <li>कोई आपसे वीज़ा की क़ीमत माँगे।</li>
   <li>"आज़ाद वीज़ा" या "फ़्री वीज़ा" जिस पर किसी के भी पास काम किया जा सके।</li>
   <li>ट्रैवल एजेंट या "वीज़ा डीलर" नौकरी का ऑफ़र दे। यह सिर्फ़ लाइसेंस वाले भर्ती एजेंट कर सकते हैं।</li>
   <li>कहा जाए कि विज़िट, उमरा या हज वीज़ा पर आ जाओ और "बाद में बदल देंगे"।</li>
   <li>कोई लिखा हुआ कॉन्ट्रैक्ट नहीं, या कॉन्ट्रैक्ट वादे से अलग है।</li>
   <li>एजेंट ऐसा लाइसेंस नंबर न दिखा पाए जिसे आप सरकारी सूची में जाँच सकें।</li>
   <li>कहा जाए कि मालिक आपका पासपोर्ट अपने पास रखेगा। यह ग़ैरक़ानूनी है: अपना पासपोर्ट ख़ुद रखें।</li>
 </ul>`},
 fees:{title:"कौन किस चीज़ का ख़र्च देता है", sub:"क़ानून क्या कहता है", body:`<ul>
   <li><strong>सऊदी अरब में:</strong> भर्ती की फ़ीस, इक़ामा और वर्क परमिट की फ़ीस और उनका नवीनीकरण, और नौकरी ख़त्म होने पर आपका वापसी का टिकट मालिक देता है (श्रम क़ानून, अनुच्छेद 40)। अगर आप बिना जायज़ वजह के नौकरी छोड़ते हैं, तो वापसी का टिकट ख़ुद देना पड़ सकता है।</li>
   <li><strong>घरेलू काम:</strong> भर्ती दफ़्तर घरेलू कामगार से भर्ती के बदले पैसे नहीं माँग सकते।</li>
   <li><strong>पाकिस्तान:</strong> लाइसेंस वाले एजेंट का सर्विस चार्ज 15,000 रुपये है, जो बैंक में जमा होता है। बाक़ी असली ख़र्च (टिकट, मेडिकल, वीज़ा, काग़ज़ात) सिर्फ़ रसीद के साथ।</li>
   <li><strong>भारत:</strong> एजेंट का सर्विस चार्ज ज़्यादा से ज़्यादा 30,000 रुपये + 18% GST, रसीद के साथ।</li>
   <li>हमेशा रसीद माँगें, और कभी "वीज़ा की क़ीमत" न दें।</li>
 </ul>`},
 pk:{title:"पाकिस्तान में कदम", sub:"ब्यूरो ऑफ़ इमिग्रेशन के नियम", body:`<ol>
   <li><strong>सिर्फ़ लाइसेंस वाले OEP से काम करवाएँ</strong> (ओवरसीज़ एम्प्लॉयमेंट प्रमोटर)। विदेश में नौकरी सिर्फ़ लाइसेंस वाला OEP दिला सकता है। लाइसेंस ब्यूरो ऑफ़ इमिग्रेशन एंड ओवरसीज़ एम्प्लॉयमेंट (BE&amp;OE) से जाँचें। वर्क वीज़ा के लिए ट्रैवल एजेंट को पैसे न दें।</li>
   <li><strong>सर्विस चार्ज: 15,000 रुपये, बैंक के ज़रिए।</strong> एजेंट को नक़द न दें। बैंक आपको सर्टिफ़िकेट देता है। एजेंट को यह रक़म आपके नौकरी शुरू करने के बाद ही मिलती है, और नौकरी न होने पर आपको वापस मिलती है।</li>
   <li><strong>बाक़ी ख़र्च सिर्फ़ रसीद के साथ।</strong> एजेंट सिर्फ़ असली ख़र्च (हवाई टिकट, मेडिकल, वीज़ा, काग़ज़ात) नंबर वाली रसीदों के साथ ले सकता है।</li>
   <li><strong>रवाना होने से पहले प्रोटेक्टर ऑफ़ एमिग्रेंट्स के दफ़्तर में रजिस्ट्रेशन</strong> करवाएँ। विदेश जाने वाले कामगारों के लिए यह ज़रूरी कदम है।</li>
   <li><strong>एजेंट से कोई परेशानी?</strong> BE&amp;OE में शिकायत करें।</li>
 </ol>`},
 in:{title:"भारत में कदम", sub:"विदेश मंत्रालय (MEA) के नियम", body:`<ol>
   <li><strong>सिर्फ़ eMigrate पर रजिस्टर्ड रिक्रूटिंग एजेंट से काम करवाएँ।</strong> emigrate.gov.in पर "List of active RA" में जाँचें। लाइसेंस नंबर एजेंट के दफ़्तर और विज्ञापनों में दिखना ज़रूरी है।</li>
   <li><strong>सर्विस चार्ज: ज़्यादा से ज़्यादा 30,000 रुपये + 18% GST</strong>, और एजेंट को रसीद देनी होगी।</li>
   <li><strong>ECR पासपोर्ट?</strong> अगर आपके पासपोर्ट पर "Emigration Check Required" (ECR) लिखा है, तो सऊदी अरब काम पर जाने से पहले eMigrate से इमिग्रेशन क्लियरेंस लेनी होगी।</li>
   <li><strong>बीमा:</strong> ECR कामगारों के लिए प्रवासी भारतीय बीमा योजना (PBBY) ज़रूरी है: 2 साल के लिए 275 रुपये या 3 साल के लिए 375 रुपये, दुर्घटना में मौत या स्थायी विकलांगता पर 10 लाख रुपये का कवर।</li>
   <li><strong>मदद:</strong> 24x7 हेल्पलाइन 1800 11 3090 (भारत में मुफ़्त)। सऊदी अरब से आप MADAD पर भारतीय दूतावास तक अपनी समस्या पहुँचा सकते हैं।</li>
 </ol>`},
 other:{title:"आपके देश में कदम", sub:"पहले अपनी सरकार से पूछें", body:`<ul>
   <li>आपकी सरकार के विदेश में काम के लिए नियम हो सकते हैं, जैसे लाइसेंस वाले एजेंट, फ़ीस की सीमा और रवाना होने से पहले रजिस्ट्रेशन। किसी को पैसे देने से पहले अपने देश के श्रम या इमिग्रेशन दफ़्तर से पूछें।</li>
   <li>इस पेज के सऊदी नियम आप पर भी लागू होते हैं: भर्ती और इक़ामा की फ़ीस मालिक देता है, और आपको असली वर्क वीज़ा और लिखा हुआ कॉन्ट्रैक्ट चाहिए।</li>
   <li>सनद पर अभी सिर्फ़ पाकिस्तान और भारत के कदम हैं।</li>
 </ul>`},
 links:{title:"सरकारी वेबसाइटें", sub:"सब कुछ यहीं जाँचें, व्हाट्सऐप पर नहीं",
  sa:`<ul class="work-links">
   <li><a href="https://www.mofa.gov.sa/en/eservices/Pages/svc89.aspx" target="_blank" rel="noopener">सऊदी विदेश मंत्रालय: जारी हुआ वीज़ा जाँचें</a></li>
   <li><a href="https://qiwa.sa" target="_blank" rel="noopener">क़िवा: कंपनी की नौकरियों के कॉन्ट्रैक्ट</a></li>
   <li><a href="https://musaned.gov.sa" target="_blank" rel="noopener">मुसानेद: घरेलू काम और लाइसेंस वाले भर्ती दफ़्तर</a></li>
   <li><a href="https://www.hrsd.gov.sa/en/knowledge-centre/articles/64434" target="_blank" rel="noopener">मानव संसाधन मंत्रालय: मालिक क्या ख़र्च देता है (अनुच्छेद 40)</a></li>
   <li>श्रम हेल्पलाइन: <a href="tel:19911">19911</a></li>
 </ul>`,
  pk:`<ul class="work-links">
   <li><a href="https://beoe.gov.pk" target="_blank" rel="noopener">ब्यूरो ऑफ़ इमिग्रेशन एंड ओवरसीज़ एम्प्लॉयमेंट (BE&amp;OE)</a></li>
 </ul>`,
  in:`<ul class="work-links">
   <li><a href="https://www.emigrate.gov.in/" target="_blank" rel="noopener">eMigrate: रजिस्टर्ड एजेंट और इमिग्रेशन क्लियरेंस</a></li>
   <li><a href="https://www.mea.gov.in/pbby.htm" target="_blank" rel="noopener">PBBY बीमा</a></li>
   <li><a href="https://www.madad.gov.in/madad/" target="_blank" rel="noopener">MADAD: भारतीय दूतावास से मदद</a></li>
   <li>हेल्पलाइन (भारत में मुफ़्त): <a href="tel:18001113090">1800 11 3090</a></li>
 </ul>`}
},
bn: {
 legal:{title:"আইনি পথ, ধাপে ধাপে", sub:"চাকরির অফার থেকে ইকামা পর্যন্ত", body:`<ol>
   <li><strong>আসল চাকরির অফার</strong>, সৌদি আরবের নাম-জানা নিয়োগকর্তার কাছ থেকে: কোনো কোম্পানি, অথবা ঘরের কাজের (যেমন হাউস ড্রাইভার বা গৃহকর্মী) জন্য কোনো পরিবার।</li>
   <li><strong>লাইসেন্সধারী এজেন্ট</strong>, আপনার নিজের দেশে। কিছু দেওয়ার আগে আপনার সরকারের সরকারি তালিকায় তার লাইসেন্স যাচাই করুন।</li>
   <li><strong>লিখিত চুক্তি।</strong> যাওয়ার আগে পড়ুন এবং একটি কপি রাখুন।</li>
   <li><strong>ওয়ার্ক ভিসা।</strong> ইস্যু হওয়া ভিসা সৌদি পররাষ্ট্র মন্ত্রণালয়ের ভিসা যাচাই সেবায় দেখা যায়। কিছু দক্ষ পেশার জন্য দক্ষতা পরীক্ষাও (স্কিল ভেরিফিকেশন প্রোগ্রাম) লাগে: আপনার পেশা এর মধ্যে পড়ে কি না, এজেন্টকে জিজ্ঞেস করুন।</li>
   <li><strong>নিজের দেশ থেকে বের হওয়ার ধাপ</strong>, যেমন অভিবাসন নিবন্ধন ও বিমা। দেখতে উপরে আপনার দেশ বেছে নিন।</li>
   <li><strong>পৌঁছানোর পর</strong> নিয়োগকর্তা আপনার ইকামা করিয়ে দেন। কোম্পানির চাকরিতে চুক্তি কিওয়াতে নথিভুক্ত হয়, আর আপনি নিজের কিওয়া অ্যাকাউন্ট থেকে তা গ্রহণ, প্রত্যাখ্যান বা পরিবর্তনের অনুরোধ করতে পারেন। ঘরের কাজ মুসানেদের মাধ্যমে হয়।</li>
 </ol>`},
 signs:{title:"ভুয়া চাকরির অফারের লক্ষণ", sub:"এর কোনোটা দেখলে থামুন ও যাচাই করুন", body:`<ul>
   <li>কেউ আপনার কাছে ভিসার দাম চায়।</li>
   <li>"ফ্রি ভিসা" বা "আজাদ ভিসা", যাতে যে কারো কাছে কাজ করা যায়।</li>
   <li>ট্রাভেল এজেন্ট বা "ভিসা দালাল" চাকরির অফার দেয়। এটা শুধু লাইসেন্সধারী রিক্রুটিং এজেন্টরা পারেন।</li>
   <li>বলা হয় ভিজিট, উমরাহ বা হজ ভিসায় চলে আসুন, "পরে বদলে দেব"।</li>
   <li>কোনো লিখিত চুক্তি নেই, অথবা চুক্তি প্রতিশ্রুতির চেয়ে আলাদা।</li>
   <li>এজেন্ট এমন লাইসেন্স নম্বর দেখাতে পারেন না, যা সরকারি তালিকায় যাচাই করা যায়।</li>
   <li>বলা হয় নিয়োগকর্তা আপনার পাসপোর্ট নিজের কাছে রাখবেন। এটা বেআইনি: নিজের পাসপোর্ট নিজের কাছে রাখুন।</li>
 </ul>`},
 fees:{title:"কে কোন খরচ দেন", sub:"আইন কী বলে", body:`<ul>
   <li><strong>সৌদি আরবে:</strong> নিয়োগ ফি, ইকামা ও ওয়ার্ক পারমিটের ফি এবং সেগুলোর নবায়ন, আর চাকরি শেষে আপনার দেশে ফেরার টিকিট নিয়োগকর্তা দেন (শ্রম আইন, ধারা ৪০)। বৈধ কারণ ছাড়া চাকরি ছাড়লে ফেরার টিকিট নিজেকে দিতে হতে পারে।</li>
   <li><strong>ঘরের কাজ:</strong> রিক্রুটিং অফিস গৃহকর্মীর কাছে নিয়োগের বিনিময়ে টাকা চাইতে পারে না।</li>
   <li><strong>পাকিস্তান:</strong> লাইসেন্সধারী এজেন্টের সার্ভিস চার্জ ১৫,০০০ রুপি, যা ব্যাংকে জমা হয়। বাকি আসল খরচ (টিকিট, মেডিকেল, ভিসা, কাগজপত্র) শুধু রসিদসহ।</li>
   <li><strong>ভারত:</strong> এজেন্টের সার্ভিস চার্জ সর্বোচ্চ ৩০,০০০ রুপি + ১৮% জিএসটি, রসিদসহ।</li>
   <li>সবসময় রসিদ চাইবেন, আর কখনো "ভিসার দাম" দেবেন না।</li>
 </ul>`},
 pk:{title:"পাকিস্তানের ধাপ", sub:"ব্যুরো অব ইমিগ্রেশনের নিয়ম", body:`<ol>
   <li><strong>শুধু লাইসেন্সধারী OEP-র মাধ্যমে যান</strong> (ওভারসিজ এমপ্লয়মেন্ট প্রমোটার)। বিদেশে চাকরি শুধু লাইসেন্সধারী OEP-ই দিতে পারে। লাইসেন্স ব্যুরো অব ইমিগ্রেশন অ্যান্ড ওভারসিজ এমপ্লয়মেন্ট (BE&amp;OE)-এ যাচাই করুন। ওয়ার্ক ভিসার জন্য ট্রাভেল এজেন্টকে টাকা দেবেন না।</li>
   <li><strong>সার্ভিস চার্জ: ১৫,০০০ রুপি, ব্যাংকের মাধ্যমে।</strong> এজেন্টকে নগদ দেবেন না। ব্যাংক আপনাকে একটি সার্টিফিকেট দেয়। আপনি কাজে যোগ দেওয়ার পরেই এজেন্ট এই টাকা পায়, আর চাকরি না হলে আপনি টাকা ফেরত পান।</li>
   <li><strong>অন্য খরচ শুধু রসিদসহ।</strong> এজেন্ট শুধু আসল খরচ (বিমান টিকিট, মেডিকেল, ভিসা, কাগজপত্র) নম্বরযুক্ত রসিদসহ নিতে পারে।</li>
   <li><strong>রওনা হওয়ার আগে প্রোটেক্টর অব এমিগ্র্যান্টস অফিসে নিবন্ধন</strong> করুন। বিদেশগামী কর্মীদের জন্য এটি একটি বাধ্যতামূলক ধাপ।</li>
   <li><strong>এজেন্টের সাথে সমস্যা?</strong> BE&amp;OE-তে অভিযোগ করুন।</li>
 </ol>`},
 in:{title:"ভারতের ধাপ", sub:"বিদেশ মন্ত্রকের (MEA) নিয়ম", body:`<ol>
   <li><strong>শুধু eMigrate-এ নিবন্ধিত রিক্রুটিং এজেন্টের মাধ্যমে যান।</strong> emigrate.gov.in-এ "List of active RA" দেখে যাচাই করুন। এজেন্টের অফিস ও বিজ্ঞাপনে লাইসেন্স নম্বর দেখানো বাধ্যতামূলক।</li>
   <li><strong>সার্ভিস চার্জ: সর্বোচ্চ ৩০,০০০ রুপি + ১৮% জিএসটি</strong>, আর এজেন্টকে রসিদ দিতেই হবে।</li>
   <li><strong>ECR পাসপোর্ট?</strong> আপনার পাসপোর্টে "Emigration Check Required" (ECR) লেখা থাকলে সৌদি আরবে কাজে যাওয়ার আগে eMigrate-এর মাধ্যমে ইমিগ্রেশন ক্লিয়ারেন্স নিতে হবে।</li>
   <li><strong>বিমা:</strong> ECR কর্মীদের জন্য প্রবাসী ভারতীয় বিমা যোজনা (PBBY) বাধ্যতামূলক: ২ বছরের জন্য ২৭৫ রুপি বা ৩ বছরের জন্য ৩৭৫ রুপি, দুর্ঘটনায় মৃত্যু বা স্থায়ী অক্ষমতায় ১০ লাখ রুপির কভার।</li>
   <li><strong>সাহায্য:</strong> ২৪ ঘণ্টার হেল্পলাইন 1800 11 3090 (ভারতে বিনামূল্যে)। সৌদি আরব থেকে MADAD-এর মাধ্যমে ভারতীয় দূতাবাসে সমস্যা জানাতে পারেন।</li>
 </ol>`},
 other:{title:"আপনার দেশের ধাপ", sub:"আগে নিজের সরকারকে জিজ্ঞেস করুন", body:`<ul>
   <li>বিদেশে কাজের জন্য আপনার সরকারের নিয়ম থাকতে পারে, যেমন লাইসেন্সধারী এজেন্ট, ফির সীমা আর রওনার আগে নিবন্ধন। কাউকে টাকা দেওয়ার আগে নিজের দেশের শ্রম বা অভিবাসন অফিসে জিজ্ঞেস করুন।</li>
   <li>এই পাতার সৌদি নিয়ম আপনার জন্যও প্রযোজ্য: নিয়োগ ও ইকামার ফি নিয়োগকর্তা দেন, আর আপনার দরকার আসল ওয়ার্ক ভিসা ও লিখিত চুক্তি।</li>
   <li>সনদে এখন শুধু পাকিস্তান ও ভারতের ধাপ আছে।</li>
 </ul>`},
 links:{title:"সরকারি ওয়েবসাইট", sub:"সবকিছু এখানে যাচাই করুন, হোয়াটসঅ্যাপে নয়",
  sa:`<ul class="work-links">
   <li><a href="https://www.mofa.gov.sa/en/eservices/Pages/svc89.aspx" target="_blank" rel="noopener">সৌদি পররাষ্ট্র মন্ত্রণালয়: ইস্যু হওয়া ভিসা যাচাই</a></li>
   <li><a href="https://qiwa.sa" target="_blank" rel="noopener">কিওয়া: কোম্পানির চাকরির চুক্তি</a></li>
   <li><a href="https://musaned.gov.sa" target="_blank" rel="noopener">মুসানেদ: ঘরের কাজ ও লাইসেন্সধারী রিক্রুটিং অফিস</a></li>
   <li><a href="https://www.hrsd.gov.sa/en/knowledge-centre/articles/64434" target="_blank" rel="noopener">মানবসম্পদ মন্ত্রণালয়: নিয়োগকর্তা কী খরচ দেন (ধারা ৪০)</a></li>
   <li>শ্রম হেল্পলাইন: <a href="tel:19911">19911</a></li>
 </ul>`,
  pk:`<ul class="work-links">
   <li><a href="https://beoe.gov.pk" target="_blank" rel="noopener">ব্যুরো অব ইমিগ্রেশন অ্যান্ড ওভারসিজ এমপ্লয়মেন্ট (BE&amp;OE)</a></li>
 </ul>`,
  in:`<ul class="work-links">
   <li><a href="https://www.emigrate.gov.in/" target="_blank" rel="noopener">eMigrate: নিবন্ধিত এজেন্ট ও ইমিগ্রেশন ক্লিয়ারেন্স</a></li>
   <li><a href="https://www.mea.gov.in/pbby.htm" target="_blank" rel="noopener">PBBY বিমা</a></li>
   <li><a href="https://www.madad.gov.in/madad/" target="_blank" rel="noopener">MADAD: ভারতীয় দূতাবাসের সাহায্য</a></li>
   <li>হেল্পলাইন (ভারতে বিনামূল্যে): <a href="tel:18001113090">1800 11 3090</a></li>
 </ul>`}
}
};

/* ============================= Housing listings ============================= */
/* Filled from Supabase by fetchAndRenderListings. Starts empty: the old demo rooms (with made-up
   WhatsApp numbers) showed up as real posts whenever the server was slow or unreachable. */
let listings = [];

/* ============================= Forum data ============================= */
/* Filled from Supabase by fetchAndRenderForum. Starts empty, like listings above. */
let forumPosts = [];
/* Reply ids the signed-in user has already upvoted this session (see fetchAndRenderForum). */
let myReplyVotes = new Set();

/* ============================= Buddies ============================= */
/* Filled from Supabase by fetchAndRenderBuddies. Starts empty, like listings above. */
let buddies = [];

/* ============================= Local persistence: likes & saves ============================= */
/* Liking/saving never requires an account — kept in this browser only, exactly like a "downloaded to
   this phone" folder. A signed-in profile shows the same sets; there's nothing server-side to sync. */
const LIKED_STORAGE_KEY = 'sanad_liked_ids';
const SAVED_STORAGE_KEY = 'sanad_saved_ids';
function loadIdSet(key){
  try{
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const obj = {};
    arr.forEach(id=>{ obj[id] = true; });
    return obj;
  } catch(err){ return {}; }
}
function persistIdSet(key, obj){
  try{ localStorage.setItem(key, JSON.stringify(Object.keys(obj).filter(k=>obj[k]))); }
  catch(err){ /* private-browsing/storage-disabled — likes/saves just won't survive a reload */ }
}

/* ============================= Theme (light / dark) ============================= */
/* Light is the standard look; dark is opt-in. The attribute is already set by the
   inline script in index.html before first paint — this only handles switching it
   afterwards and remembering the choice. */
const THEME_STORAGE_KEY = 'sanad_theme';

function currentTheme(){
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}
function applyTheme(theme){
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try{ localStorage.setItem(THEME_STORAGE_KEY, next); }
  catch(err){ /* storage disabled — the theme still applies for this visit */ }
  syncThemeToggles();
}
function syncThemeToggles(){
  // The button offers the OTHER mode, so label it with what tapping it will do.
  const label = t(currentTheme() === 'dark' ? 'themeToLight' : 'themeToDark');
  document.querySelectorAll('[data-theme-toggle]').forEach(btn=>{
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  });
}

/* ============================= Language ============================= */
/* Arabic and Urdu read right-to-left. The choice is remembered on the device, so a
   worker who reads Hindi or Bengali doesn't have to find it again on every visit. */
const LANG_STORAGE_KEY = 'sanad_lang';
const SUPPORTED_LANGS = ['en','ar','ur','hi','bn'];
const RTL_LANGS = ['ar','ur'];
// The closed language switcher shows this; its list shows each language's own name.
const LANG_SHORT = {en:'EN', ar:'عربي', ur:'اردو', hi:'हिंदी', bn:'বাংলা'};

function savedLang(){
  try{
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return SUPPORTED_LANGS.includes(saved) ? saved : 'en';
  } catch(err){ return 'en'; }
}
function setLang(lang){
  if(!SUPPORTED_LANGS.includes(lang)) return;
  state.lang = lang;
  try{ localStorage.setItem(LANG_STORAGE_KEY, lang); }
  catch(err){ /* storage disabled — the language still applies for this visit */ }
  renderAll();
}

/* ============================= State & render ============================= */
let state = {
  lang:savedLang(), tab:'housing',
  guideOpen:{},
  filters:{postType:'all', city:'all', budget:'all', nat:'all', gender:'all', roomType:'all'},
  forumCat:'All', openReplies:{}, communitySubTab:'qa',
  feedLikes:{}, feedSaves:{},
  lbFilter:'all'
};
let appUser = null; // { id, name, phone, createdAt, sessionToken } once signed in — persisted to localStorage so a reload keeps the session
let myShareLinks = []; // [{id, page, code, clicks}]
let pendingSignInAction = null; // callback to run right after a successful sign-in

function t(key){ return translations[state.lang][key] ?? key; }
function fmt(key, replacements){
  let str = t(key);
  Object.entries(replacements||{}).forEach(([k,v])=>{ str = str.replace('{'+k+'}', v); });
  return str;
}

/* Anything a user typed (or that came back from the database) is escaped
   before it goes into an innerHTML template, so a post like
   <img src=x onerror=...> shows as text instead of running. */
function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
/* Media src from the database: only real http(s)/blob links, escaped for the attribute. */
function safeUrl(value){
  const url = String(value ?? '');
  return /^(https?:|blob:)/i.test(url) ? escapeHtml(url) : '';
}
/* wa.me only takes the full international number, as digits — which also keeps a
   stored number from breaking out of an href. People in Saudi Arabia usually type
   the local form (05XXXXXXXX), which wa.me can't place, so Saudi mobiles get 966 in
   front. Arabic/Urdu digits, spaces, dashes, + and 00 are all accepted. Applied when
   a number is saved and again when a link is built, so older posts work too. */
function waDigits(value){
  let d = toLatinDigits(value).replace(/[^0-9]/g,'');
  if(d.startsWith('00')) d = d.slice(2);
  if(d.startsWith('9660')) d = '966' + d.slice(4);   // +966 05XXXXXXXX
  if(/^05\d{8}$/.test(d)) d = '966' + d.slice(1);   // 05XXXXXXXX
  else if(/^5\d{8}$/.test(d)) d = '966' + d;        // 5XXXXXXXX
  return d;
}
/* The 9 digits of a Saudi mobile after +966, from whatever was typed or pasted:
   05XXXXXXXX, 5XXXXXXXX, +966 5X..., 00966..., Arabic/Urdu digits, spaces.
   Never more than 9 digits, so the field can't hold a longer number. */
function saudiMobileDigits(value){
  let d = toLatinDigits(value).replace(/[^0-9]/g,'');
  if(d.startsWith('00966')) d = d.slice(5);
  else if(d.startsWith('966')) d = d.slice(3);
  d = d.replace(/^0+/, '');
  return d.slice(0, 9);
}
/* A number wa.me can open: 8–15 digits starting with a country code (never 0),
   and a Saudi one is 966 + 9 digits. */
function waLooksValid(d){
  return /^[1-9][0-9]{7,14}$/.test(d) && (!d.startsWith('966') || d.length === 12);
}
/* Shows the problem on the field itself (the browser's own bubble), cleared on edit. */
function flagWaInput(input, msgKey){
  input.setCustomValidity(t(msgKey || 'waInvalid'));
  input.reportValidity();
  input.addEventListener('input', ()=> input.setCustomValidity(''), { once:true });
  input.focus();
}

function applyI18n(){
  document.documentElement.lang = state.lang;
  document.documentElement.dir = RTL_LANGS.includes(state.lang) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('data-lang', state.lang);
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    if(translations[state.lang][k] !== undefined) el.innerHTML = translations[state.lang][k];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const k = el.getAttribute('data-i18n-ph');
    if(translations[state.lang][k] !== undefined) el.setAttribute('placeholder', translations[state.lang][k]);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{
    const k = el.getAttribute('data-i18n-title');
    if(translations[state.lang][k] !== undefined){
      el.setAttribute('title', translations[state.lang][k]);
      el.setAttribute('aria-label', translations[state.lang][k]);
    }
  });
  document.querySelectorAll('[data-lang-btn]').forEach(b=>{
    const on = b.getAttribute('data-lang-btn')===state.lang;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  document.querySelectorAll('[data-lang-select]').forEach(s=>{ s.value = state.lang; });
  document.querySelectorAll('[data-lang-current]').forEach(el=>{ el.textContent = LANG_SHORT[state.lang]; });
  document.title = state.lang==='en' ? "Sanad · سند — Your support system in Saudi Arabia" : translations[state.lang].brandName + " — " + translations[state.lang].brandTag;
}

function setTab(tab){
  if(tab !== 'work') leaveWorkUrl();
  state.tab = tab;
  document.querySelectorAll('section.view').forEach(s=>s.classList.remove('active'));
  document.getElementById('view-'+tab).classList.add('active');
  document.querySelectorAll('nav.tabbar button[data-tab]').forEach(b=>b.classList.toggle('active', b.getAttribute('data-tab')===tab));
  window.scrollTo({top:0, behavior:'instant'});
  applyFeedMode();
  if(tab==='community') fitCommunityFeed();
  closeFilters();
  setQuickComposerOpen(false);
  if(tab==='profile'){ if(appUser) fetchAndRenderProfileStats(); renderProfile(); }
}

/* On mobile the Feed tab is a full-bleed video-style feed: no header, no page
   scroll. Everything else is CSS — this only flips the flag. Community's Q&A
   stream reuses the same card component but stays in-flow (its own sub-tabs —
   Q&A/Buddies/Top Helpers — need to stay reachable, so it never goes full-bleed). */
function applyFeedMode(){
  const feedMode = state.tab === 'housing' && window.innerWidth < 760;
  document.body.classList.toggle('feed-mode', feedMode);
}
window.addEventListener('resize', ()=>{ applyFeedMode(); if(window.innerWidth >= 760) closeFilters(); });

/* Brings a card to the top of its own feed box. scrollIntoView would also scroll the page, and in
   the Feed (where the page itself can't be scrolled by hand) that left it stuck part-way. */
function scrollCardIntoFeed(card, smooth){
  const scroller = card && card.closest('.feed-scroll');
  if(!scroller) return;
  const top = card.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  scroller.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' });
}

/* On a phone the Community questions box is sized to end just above the tab bar, so the whole
   box is on screen and the page and the box don't fight over the same swipe. --qa-top is where
   the box starts on the page; CSS does the rest. */
function fitCommunityFeed(){
  const box = document.getElementById('forumFeedScroll');
  if(!box || !box.offsetParent) return;
  const top = box.getBoundingClientRect().top + window.scrollY;
  document.documentElement.style.setProperty('--qa-top', Math.round(top) + 'px');
}
window.addEventListener('resize', fitCommunityFeed);

/* iOS scrolls the whole page up to make room for the keyboard and doesn't always scroll it back.
   In the Feed the page can't be scrolled by hand, so it stayed stuck with the tab bar half off
   screen. When typing ends, put it back. */
document.addEventListener('focusout', ()=>{
  setTimeout(()=>{
    const typing = document.activeElement && document.activeElement.matches('input, textarea, select');
    if(!typing && document.body.classList.contains('feed-mode') && window.scrollY !== 0) window.scrollTo(0, 0);
  }, 120);
});

/* ---- Guide render ---- */
function renderGuide(){
  const grid = document.getElementById('guideGrid');
  const data = guideData[state.lang];
  grid.innerHTML = data.map((g,i)=>`
    <div class="guide-card ${state.guideOpen[g.k]?'open':''}" data-guide="${g.k}">
      <button class="guide-head" data-guide-toggle="${g.k}">
        <div class="ic">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+guideIcons[g.k]+'</svg>'}</div>
        <div class="tt"><h3>${g.title}</h3><span>${g.sub}</span></div>
        <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="guide-body"><div class="guide-body-inner">${g.body}</div></div>
    </div>
  `).join('');
  grid.querySelectorAll('[data-guide-toggle]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const k = btn.getAttribute('data-guide-toggle');
      state.guideOpen[k] = !state.guideOpen[k];
      btn.closest('.guide-card').classList.toggle('open', state.guideOpen[k]);
    });
  });
}

/* ============================= Looking for work? ============================= */
/* For workers who are not in Saudi Arabia yet and want to come: the legal way, the warning signs
   of a fake offer, who pays for what, and their own country's steps (Pakistan and India for now).
   Every rule here comes from an official government source; the pull request that added this
   section lists them. Nothing chosen or answered on this page leaves the phone. */
const VISITOR_STORAGE_KEY = 'sanad_visitor';            // answer to the first-visit question
const VISITOR_CHOICES = ['in_saudi','abroad','skipped'];
const WORK_COUNTRY_STORAGE_KEY = 'sanad_work_country';  // country picked on the work page
const WORK_COUNTRIES = ['pk','in','other'];
const WORK_HASH = '#work';                               // shareable address of the work page

function readStored(key, allowed){
  try{
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : null;
  } catch(err){ return null; }
}
function writeStored(key, value){
  try{ localStorage.setItem(key, value); }
  catch(err){ /* storage disabled — the choice still applies for this visit */ }
}

let visitorChoice = readStored(VISITOR_STORAGE_KEY, VISITOR_CHOICES);
let workCountry = readStored(WORK_COUNTRY_STORAGE_KEY, WORK_COUNTRIES);
let workOpen = workCountry ? {[workCountry]:true} : {}; // open cards on the work page; their own country's steps start open
let workReturnTab = 'housing';  // where the work page's Back button goes
let workOpenedByPush = false;   // true when Sanad itself added #work to the browser history
let workLeavingUrl = false;     // set while Sanad steps the history back off #work

const workIcon = paths => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths+'</svg>';
const workIcons = {
  route:'<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',
  alert:'<path d="M10.3 4.2L2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17h.01"/>',
  coins:'<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6"/><path d="M5 12v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6"/>',
  flag:'<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/>',
  link:'<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>',
  shield:'<path d="M12 3l8 3.5v5.5c0 4.6-3.4 7.9-8 9-4.6-1.1-8-4.4-8-9V6.5L12 3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  back:'<path d="M15 18l-6-6 6-6"/>'
};

/* The offer check: six questions, each answered Yes / No / Not sure. For each question, the
   answers that are a warning sign and how serious they are: 'danger' means stop before paying
   anything, 'caution' means check this first. Any other answer is not a warning sign. */
const OFFER_CHECKS = [
  {q:'checkQ1', e:'checkE1', risk:{yes:'danger', unsure:'caution'}},   // asked to pay for the visa
  {q:'checkQ2', e:'checkE2', risk:{yes:'danger', unsure:'caution'}},   // offered a "free visa"
  {q:'checkQ3', e:'checkE3', risk:{no:'danger', unsure:'caution'}},    // a real work visa
  {q:'checkQ4', e:'checkE4', risk:{no:'danger', unsure:'caution'}},    // licensed agent
  {q:'checkQ5', e:'checkE5', risk:{no:'caution', unsure:'caution'}},   // read the written contract
  {q:'checkQ6', e:'checkE6', risk:{no:'caution', unsure:'caution'}}    // a named employer
];
const OFFER_ANSWERS = [['yes','ansYes'], ['no','ansNo'], ['unsure','ansUnsure']];
let offerStep = 0;      // 0 = intro, 1-6 = that question, 7 = result
let offerAnswers = [];  // the answer to each question, kept in memory only

/* Numbers inside sentences use the same digits as the rest of the language's text. */
function localDigits(value){
  const s = String(value);
  if(state.lang === 'ar') return s.replace(/[0-9]/g, d=> '٠١٢٣٤٥٦٧٨٩'[d]);
  if(state.lang === 'bn') return s.replace(/[0-9]/g, d=> '০১২৩৪৫৬৭৮৯'[d]);
  return s;
}

/* ---- Work page render ---- */
function renderWorkPage(){
  renderWorkCountry();
  renderOfferCheck();
  renderWorkCards();
}

function renderWorkCountry(){
  document.querySelectorAll('[data-work-country]').forEach(btn=>{
    const on = btn.getAttribute('data-work-country') === workCountry;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  document.getElementById('workCountryHint').hidden = !!workCountry;
}

/* The chosen country's steps come first. Without a choice, the official links for both
   Pakistan and India are listed, so nobody misses their own country's sites. */
function renderWorkCards(){
  const d = workData[state.lang];
  const linksFor = c=> `<p class="work-links-h">${t(c==='pk' ? 'workCountryPK' : 'workCountryIN')}</p>${d.links[c]}`;
  const linksBody = `<p class="work-links-h">${t('workSaudiLabel')}</p>${d.links.sa}`
    + (workCountry !== 'in' && workCountry !== 'other' ? linksFor('pk') : '')
    + (workCountry !== 'pk' && workCountry !== 'other' ? linksFor('in') : '');
  const cards = [
    ...(workCountry ? [{k:workCountry, icon:'flag', tone:'gold', ...d[workCountry]}] : []),
    {k:'legal', icon:'route', tone:'', ...d.legal},
    {k:'signs', icon:'alert', tone:'warn', ...d.signs},
    {k:'fees', icon:'coins', tone:'gold', ...d.fees},
    {k:'links', icon:'link', tone:'', title:d.links.title, sub:d.links.sub, body:linksBody}
  ];
  const grid = document.getElementById('workGrid');
  grid.innerHTML = cards.map(c=>`
    <div class="guide-card ${workOpen[c.k]?'open':''}">
      <button class="guide-head" type="button" data-work-toggle="${c.k}" aria-expanded="${workOpen[c.k]?'true':'false'}" aria-controls="work-card-${c.k}">
        <div class="ic ${c.tone ? 'ic--'+c.tone : ''}">${workIcon(workIcons[c.icon])}</div>
        <div class="tt"><h3>${c.title}</h3><span>${c.sub}</span></div>
        <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="guide-body" id="work-card-${c.k}"><div class="guide-body-inner">${c.body}</div></div>
    </div>
  `).join('');
  grid.querySelectorAll('[data-work-toggle]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const k = btn.getAttribute('data-work-toggle');
      workOpen[k] = !workOpen[k];
      btn.closest('.guide-card').classList.toggle('open', workOpen[k]);
      btn.setAttribute('aria-expanded', workOpen[k] ? 'true' : 'false');
    });
  });
}

function renderOfferCheck(){
  const box = document.getElementById('offerCheck');
  const total = OFFER_CHECKS.length;
  if(offerStep === 0){
    box.innerHTML = `
      <div class="offer-intro">
        <div class="offer-ic">${workIcon(workIcons.shield)}</div>
        <div><h2 tabindex="-1">${t('checkTitle')}</h2><p>${t('checkSub')}</p></div>
      </div>
      <button class="btn-primary" type="button" data-offer-start>${t('checkStart')}</button>`;
    return;
  }
  if(offerStep <= total){
    const item = OFFER_CHECKS[offerStep-1];
    const chosen = offerAnswers[offerStep-1];
    box.innerHTML = `
      <div class="offer-top">
        <button class="offer-back" type="button" data-offer-back aria-label="${escapeHtml(t('backBtn'))}">${workIcon(workIcons.back)}</button>
        <p class="offer-progress">${fmt('checkProgress', {n:localDigits(offerStep), total:localDigits(total)})}</p>
      </div>
      <div class="offer-bar" aria-hidden="true"><span style="width:${Math.round(offerStep/total*100)}%"></span></div>
      <h2 class="offer-q" id="offerQuestion" tabindex="-1">${t(item.q)}</h2>
      <div class="offer-answers" role="group" aria-labelledby="offerQuestion">
        ${OFFER_ANSWERS.map(([value,key])=>`<button class="offer-answer ${chosen===value?'active':''}" type="button" data-offer-answer="${value}" aria-pressed="${chosen===value?'true':'false'}">${t(key)}</button>`).join('')}
      </div>`;
    return;
  }
  const answerKey = Object.fromEntries(OFFER_ANSWERS);
  const flagged = OFFER_CHECKS
    .map((item,i)=>({item, answer:offerAnswers[i], level:item.risk[offerAnswers[i]]}))
    .filter(f=> f.level)
    .sort((a,b)=> (a.level==='danger' ? 0 : 1) - (b.level==='danger' ? 0 : 1));
  const level = flagged.some(f=> f.level==='danger') ? 'danger' : flagged.length ? 'caution' : 'ok';
  const copy = {danger:['resultDangerTitle','resultDangerBody'], caution:['resultCautionTitle','resultCautionBody'], ok:['resultOkTitle','resultOkBody']}[level];
  box.innerHTML = `
    <div class="offer-result offer-result--${level}">
      <div class="offer-result-head">
        <div class="offer-result-ic">${workIcon(workIcons[level==='ok' ? 'check' : 'alert'])}</div>
        <h2 tabindex="-1">${t(copy[0])}</h2>
      </div>
      <p>${t(copy[1])}</p>
    </div>
    ${flagged.length ? `
      <p class="offer-flags-label">${t('resultFlagsLabel')}</p>
      <ul class="offer-flags">
        ${flagged.map(f=>`
          <li class="offer-flag offer-flag--${f.level}">
            <strong>${t(f.item.q)}</strong>
            <span class="offer-flag-answer">${fmt('resultYourAnswer', {answer:t(answerKey[f.answer])})}</span>
            <p>${t(f.item.e)}</p>
          </li>`).join('')}
      </ul>` : ''}
    <button class="offer-again" type="button" data-offer-restart>${t('checkAgain')}</button>`;
}

/* After each step, focus moves to the new question (or the result) so a screen reader reads it,
   and the box scrolls back into view when its top has gone above the screen. */
function focusOfferCheck(){
  const box = document.getElementById('offerCheck');
  const heading = box.querySelector('[tabindex="-1"]');
  if(heading) heading.focus({preventScroll:true});
  const header = document.querySelector('header.topbar');
  const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
  const top = box.getBoundingClientRect().top;
  if(top < headerBottom) window.scrollTo({top: window.scrollY + top - headerBottom - 12, behavior:'smooth'});
}

document.getElementById('offerCheck').addEventListener('click', e=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  if(btn.hasAttribute('data-offer-start') || btn.hasAttribute('data-offer-restart')){ offerStep = 1; offerAnswers = []; }
  else if(btn.hasAttribute('data-offer-answer')){ offerAnswers[offerStep-1] = btn.getAttribute('data-offer-answer'); offerStep++; }
  else if(btn.hasAttribute('data-offer-back')){ offerStep--; }
  else return;
  renderOfferCheck();
  focusOfferCheck();
});

document.querySelectorAll('[data-work-country]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    workCountry = btn.getAttribute('data-work-country');
    writeStored(WORK_COUNTRY_STORAGE_KEY, workCountry);
    workOpen[workCountry] = true; // show the country's steps straight away
    renderWorkCountry();
    renderWorkCards();
  });
});

/* ---- Opening and leaving the work page ----
   The page has its own address (…/#work) so it can be shared, and the phone's Back button
   returns to where the worker came from instead of closing Sanad. */
function openWorkPage(){
  if(state.tab !== 'work') workReturnTab = state.tab;
  if(location.hash !== WORK_HASH){
    history.pushState(null, '', location.pathname + location.search + WORK_HASH);
    workOpenedByPush = true;
  }
  showWorkPage();
}
function showWorkPage(){
  setTab('work');
  renderWorkPage();
}
function closeWorkPage(){
  if(workOpenedByPush){ history.back(); return; } // the popstate handler below switches the tab
  setTab(workReturnTab);
}
/* Called by setTab for every other tab, so #work never stays in the address bar of another page. */
function leaveWorkUrl(){
  if(location.hash !== WORK_HASH) return;
  if(workOpenedByPush){ workOpenedByPush = false; workLeavingUrl = true; history.back(); }
  else history.replaceState(null, '', location.pathname + location.search);
}
window.addEventListener('popstate', ()=>{
  if(workLeavingUrl){ workLeavingUrl = false; return; }
  const onWork = location.hash === WORK_HASH;
  if(onWork && state.tab !== 'work'){ workReturnTab = state.tab; workOpenedByPush = true; showWorkPage(); }
  else if(!onWork && state.tab === 'work'){ workOpenedByPush = false; setTab(workReturnTab); }
});

/* Like a listing link, the work page can be shared without signing in. */
function openWorkSharePanel(){
  const url = baseShareUrl() + WORK_HASH;
  document.getElementById('shareLinkInput').value = url;
  document.getElementById('btnShareWhatsapp').href = `https://wa.me/?text=${encodeURIComponent(url)}`;
  document.getElementById('sharePanel').style.display = 'flex';
}

/* "Ask a question" opens the composer on a question already filed under Before arrival, over the
   Before arrival questions in Community; "See questions" only shows those questions. */
function showBeforeArrivalQuestions(){
  state.communitySubTab = 'qa';
  setTab('community');
  document.querySelectorAll('[data-subtab]').forEach(b=> b.classList.toggle('active', b.getAttribute('data-subtab')==='qa'));
  document.getElementById('communityQA').style.display = 'block';
  document.getElementById('communityBuddies').style.display = 'none';
  document.getElementById('communityLeaderboard').style.display = 'none';
  state.forumCat = 'Before arrival';
  document.getElementById('forumFeedScroll').scrollTop = 0;
  renderCatChips();
  renderForum();
  fitCommunityFeed();
  // It is the last category, so on a phone its chip starts off screen: bring it into view.
  const chip = document.querySelector('#catChipRow .cat-chip.active');
  if(chip) chip.scrollIntoView({block:'nearest', inline:'nearest'});
}
function askBeforeArrival(){
  showBeforeArrivalQuestions();
  setQcCategory('inquiry');
  setQuickComposerOpen(true);
  syncQcStep2Copy();
  showQcStep(2);
  document.querySelectorAll('#qcInquiryCatRow [data-qc-i-cat]').forEach(b=> b.classList.toggle('active', b.getAttribute('data-qc-i-cat')==='Before arrival'));
}

document.querySelectorAll('[data-open-work]').forEach(btn=> btn.addEventListener('click', openWorkPage));
document.getElementById('btnWorkBack').addEventListener('click', closeWorkPage);
document.getElementById('btnWorkShare').addEventListener('click', openWorkSharePanel);
document.getElementById('btnWorkAsk').addEventListener('click', askBeforeArrival);
document.getElementById('btnWorkSeeQuestions').addEventListener('click', showBeforeArrivalQuestions);

/* ---- First visit: "Where are you now?" ----
   Asked once, on the Feed, to someone who isn't signed in. Workers who are still outside Saudi
   Arabia go straight to the work page; the answer only decides whether the Feed keeps showing
   the "Looking for work?" pill. */
function syncWorkEntryPoints(){
  document.querySelectorAll('.work-pill').forEach(el=>{ el.hidden = visitorChoice === 'in_saudi'; });
}

let welcomeReturnFocus = null;
function maybeShowWelcome(){
  if(visitorChoice || appUser || state.tab !== 'housing') return;
  const params = new URLSearchParams(location.search);
  if(params.has('listing') || params.has('profile')) return; // came for one post or profile: show that
  if(document.getElementById('quickComposer').classList.contains('open')) return;
  if([...document.querySelectorAll('.modal-overlay')].some(m=> m.style.display === 'flex')) return;
  const sheet = document.getElementById('welcomeSheet');
  const scrim = document.getElementById('welcomeScrim');
  welcomeReturnFocus = document.activeElement;
  sheet.hidden = false;
  scrim.hidden = false;
  requestAnimationFrame(()=> requestAnimationFrame(()=>{ sheet.classList.add('open'); scrim.classList.add('open'); }));
  sheet.focus({preventScroll:true});
}
function closeWelcome(choice){
  const sheet = document.getElementById('welcomeSheet');
  if(sheet.hidden) return;
  const scrim = document.getElementById('welcomeScrim');
  visitorChoice = choice;
  writeStored(VISITOR_STORAGE_KEY, choice);
  sheet.classList.remove('open');
  scrim.classList.remove('open');
  setTimeout(()=>{ sheet.hidden = true; scrim.hidden = true; }, 300);
  syncWorkEntryPoints();
  if(choice === 'abroad') openWorkPage();
  else if(welcomeReturnFocus && document.contains(welcomeReturnFocus)) welcomeReturnFocus.focus({preventScroll:true});
}
document.querySelectorAll('[data-visitor]').forEach(btn=>{
  btn.addEventListener('click', ()=> closeWelcome(btn.getAttribute('data-visitor')));
});
document.getElementById('welcomeScrim').addEventListener('click', ()=> closeWelcome('skipped'));
/* Escape closes it, and Tab stays inside it while it is open. */
document.getElementById('welcomeSheet').addEventListener('keydown', e=>{
  if(e.key === 'Escape'){ e.preventDefault(); closeWelcome('skipped'); return; }
  if(e.key !== 'Tab') return;
  const items = [...e.currentTarget.querySelectorAll('button')];
  const first = items[0], last = items[items.length-1];
  if(e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
});

/* ============================= Cities & shared lookups ============================= */
const CITY_KEYS = ["Riyadh","Jeddah","Dammam/Khobar","Makkah","Madinah","Hail"];
const CITY_LABELS = {
  en:CITY_KEYS,
  ar:["الرياض","جدة","الدمام/الخبر","مكة","المدينة","حائل"],
  ur:["ریاض","جدہ","دمام/خبر","مکہ","مدینہ","حائل"],
  hi:["रियाद","जेद्दा","दम्माम/ख़ोबर","मक्का","मदीना","हाइल"],
  bn:["রিয়াদ","জেদ্দা","দাম্মাম/খোবার","মক্কা","মদিনা","হাইল"]
};
const NAT_KEYS = ["Any","Indian","Pakistani","Filipino","Arab","Bangladeshi"];
const NAT_LABELS = {
  en:["Any nationality pref.","Indian","Pakistani","Filipino","Arab","Bangladeshi"],
  ar:["أي جنسية","هندي","باكستاني","فلبيني","عربي","بنغلاديشي"],
  ur:["کوئی بھی قومیت","بھارتی","پاکستانی","فلپائنی","عرب","بنگلہ دیشی"],
  hi:["कोई भी राष्ट्रीयता","भारतीय","पाकिस्तानी","फ़िलिपीनी","अरब","बांग्लादेशी"],
  bn:["যেকোনো জাতীয়তা","ভারতীয়","পাকিস্তানি","ফিলিপিনো","আরব","বাংলাদেশি"]
};

/* ---- Housing render ---- */
function populateFilterOptions(){
  const cityRow = document.getElementById('filterCityRow');
  cityRow.innerHTML = `<button class="filter-chip ${state.filters.city==='all'?'active':''}" data-filter-value="all">${t('filterAllCities')}</button>` +
    CITY_KEYS.map((c,i)=>`<button class="filter-chip ${state.filters.city===c?'active':''}" data-filter-value="${c}">${CITY_LABELS[state.lang][i]}</button>`).join('');

  const natRow = document.getElementById('filterNatRow');
  natRow.innerHTML = NAT_KEYS.map((n,i)=>{
    const value = n==='Any' ? 'all' : n;
    return `<button class="filter-chip ${state.filters.nat===value?'active':''}" data-filter-value="${value}">${NAT_LABELS[state.lang][i]}</button>`;
  }).join('');

  document.querySelectorAll('#filterSheet .filter-option-grid .filter-option, #filterSheet .filter-icon-grid .filter-icon-option').forEach(btn=>{
    const group = btn.closest('[data-filter-group]').getAttribute('data-filter-group');
    btn.classList.toggle('active', state.filters[group] === btn.getAttribute('data-filter-value'));
  });
  document.querySelectorAll('#filterSheet [data-filter-group="gender"] .filter-chip').forEach(btn=>{
    btn.classList.toggle('active', state.filters.gender === btn.getAttribute('data-filter-value'));
  });

  populateComposerCities();
}

function populateComposerCities(){
  const row = document.getElementById('qcCityRow');
  if(!row) return;
  const selected = row.getAttribute('data-selected') || CITY_KEYS[0];
  row.innerHTML = CITY_KEYS.map((c,i)=>`<button class="composer-chip ${c===selected?'active':''}" data-qc-city="${c}">${CITY_LABELS[state.lang][i]}</button>`).join('');
  row.setAttribute('data-selected', selected);
}

async function fetchAndRenderListings(){
  if (!SUPABASE_CONFIGURED) { renderListings(); return; }
  try {
    const { data, error } = await supabaseClient
      .from('housing_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading listings:', error);
      renderListings();
      return;
    }

    listings = data.map(l => ({
      id: l.id,
      posterUserId: l.poster_user_id,
      postType: l.post_type || 'housing',
      city: l.city,
      rent: l.rent,
      type: l.room_type,
      gender: l.gender_pref,
      nat: l.nationality_pref,
      natTarget: l.nationality_target,
      bills: l.bills_included,
      desc: l.description,
      by: l.poster_role,
      wa: l.whatsapp,
      video: l.video_url,
      media: l.media_url,
      // Rooms posted with several photos have them all here; older rows only have media_url.
      mediaList: (Array.isArray(l.media_urls) && l.media_urls.length) ? l.media_urls : (l.media_url ? [l.media_url] : [])
    }));

    renderListings();
  } catch (err) {
    console.error('Could not reach Supabase for listings, showing local data instead:', err);
    renderListings();
  }
}

const waIconSvg = '<svg viewBox="0 0 32 32"><path d="M16.001 3C9.096 3 3.5 8.596 3.5 15.5c0 2.34.63 4.53 1.73 6.42L3 29l7.27-2.19a12.4 12.4 0 005.73 1.4c6.905 0 12.5-5.596 12.5-12.5S22.906 3 16.001 3zm7.28 17.7c-.31.87-1.53 1.6-2.51 1.81-.67.14-1.55.25-4.5-.97-3.78-1.57-6.22-5.4-6.4-5.65-.19-.25-1.53-2.04-1.53-3.89 0-1.85.97-2.76 1.31-3.14.34-.38.74-.47.98-.47.25 0 .49 0 .7.01.23.01.53-.09.83.63.31.74 1.06 2.56 1.15 2.74.09.19.15.4.03.65-.13.25-.19.4-.38.62-.19.22-.4.49-.57.66-.19.19-.39.4-.17.78.22.38.98 1.62 2.11 2.62 1.45 1.29 2.67 1.7 3.05 1.89.38.19.6.16.82-.1.22-.25.94-1.1 1.19-1.48.25-.38.5-.31.84-.19.34.13 2.16 1.02 2.53 1.2.37.19.62.28.71.44.09.15.09.85-.22 1.72z"/></svg>';

const shareIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.7l7.4-4.4M8.3 13.3l7.4 4.4"/></svg>';
const houseIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 10l9-7 9 7"/><path d="M5 9v11h14V9"/></svg>';
const heartIconSvg = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.2-4.6-10-9.1C.5 8.6 1.8 5 5.3 4.1c2-.5 4 .3 5.2 2 .4.5.7 1 1 1.6.3-.6.6-1.1 1-1.6 1.2-1.7 3.2-2.5 5.2-2 3.5.9 4.8 4.5 3.3 7.8-2.8 4.5-10 9.1-10 9.1z"/></svg>';
const bookmarkIconSvg = '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4.5L6 21V3z"/></svg>';
const chatIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 01-8.5 8.5c-1.35 0-2.61-.34-3.7-.94L3 21l1.94-5.8A8.5 8.5 0 1121 11.5z"/></svg>';
const bulbIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a6 6 0 00-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-1.5c0-.6.3-1.2.8-1.6A6 6 0 0012 2z"/></svg>';
const trashIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/></svg>';
const upvoteIconSvg ='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5l7 8H5l7-8z"/></svg>';
const chevronIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
const badgeIconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 5.6L21 8.5l-4.5 4.2L17.6 19 12 15.8 6.4 19l1.1-6.3L3 8.5l6.4-.9L12 2z"/></svg>';

/* Likes are kept only in this browser (see LIKED_STORAGE_KEY), so the only
   honest count is this phone's own like: 1 or 0. */
function likeCount(l, liked){
  return liked ? 1 : 0;
}
function formatCount(n){
  return n >= 1000 ? (n/1000).toFixed(1).replace(/\.0$/,'') + 'k' : String(n);
}

/* Community questions aren't a separate thing to post from Explore — Community stays
   the one place to ask (with real replies/voting) — but every question posted there
   is pulled into the feed here too, so browsing Explore can surface one by chance. */
function forumFeedItems(){
  return forumPosts.map((p,i)=>({
    id: p.id || ('forum-'+i),
    forumIndex: i,
    posterUserId: p.posterUserId || null,
    postType: 'inquiry',
    desc: p.q,
    by: p.by,
    repliesCount: (p.replies||[]).length
  }));
}

function filterListings(){
  const f = state.filters;
  const pool = listings.concat(forumFeedItems());
  return pool.filter(l=>{
    const type = l.postType || 'housing';
    if(f.postType!=='all' && type!==f.postType) return false;
    if(type!=='housing') return true; // budget/city/gender/room-type only make sense for housing rows
    if(f.city!=='all' && l.city!==f.city) return false;
    if(f.budget!=='all' && l.rent > parseInt(f.budget)) return false;
    if(f.nat!=='all' && l.nat!==f.nat) return false;
    if(f.gender!=='all' && l.gender!==f.gender) return false;
    if(f.roomType!=='all' && l.type!==f.roomType) return false;
    return true;
  });
}

/* Keeps the filter FAB badge and the sheet's "Show results" count honest.
   postType is the top chip row, not a sheet field, so it's excluded here —
   the badge only reflects filters the bottom sheet itself can reset. */
function updateFilterUI(){
  const active = Object.entries(state.filters).filter(([k,v])=>k!=='postType' && v!=='all').length;
  const badge = document.getElementById('filterBadge');
  if(badge){ badge.textContent = active; badge.classList.toggle('on', active>0); }
  const count = document.getElementById('filterCount');
  if(count) count.textContent = '(' + filterListings().length + ')';
}

/* Builds one full-bleed feed card. Shared by the Feed (listingsGrid) and, for
   inquiry-type items, reused directly by Community's Q&A stream so both feel
   like the same product instead of two different UIs. */
function buildFeedCardHtml(l, i){
  const genderLabelKey = {any:'genAny', male:'genMale', female:'genFemale'};
  const roomTypeLabelKey = {shared:'rtShared', private:'rtPrivate', bed:'rtBed'};
  const postType = l.postType || 'housing';
  const isHousing = postType === 'housing' && l.city != null && l.rent != null;
  const isForumInquiry = postType === 'inquiry';
  const key = escapeHtml(l.id);
  const liked = !!state.feedLikes[key];
  const saved = !!state.feedSaves[key];
  const count = likeCount(l, liked);
  const hasProfile = !!l.posterUserId;
  const isMine = !!(appUser && l.posterUserId && l.posterUserId === appUser.id);
  const avatarLetter = escapeHtml(String(isHousing ? l.city : (l.by || l.city || '?')).charAt(0).toUpperCase());
  const posterId = escapeHtml(l.posterUserId);
  const wa = waDigits(l.wa);
  const typeTagKey = postType==='inquiry' ? 'chipInquiries' : postType==='guide' ? 'chipGuides' : 'chipHousing';
  const typeIcon = postType==='inquiry' ? chatIconSvg : postType==='guide' ? bulbIconSvg : houseIconSvg;
  // Several photos become a sideways-swipe gallery (TikTok photo mode); the feed itself still scrolls up/down.
  const photos = safeUrl(l.video) ? [] : (l.mediaList || []).map(safeUrl).filter(Boolean);
  const isGallery = photos.length > 1;
  // Each photo or video sits in a .feed-slide. Once its size is known, fitFeedMedia() shows a
  // landscape room photo whole (over a blurred copy of itself) instead of cropping its sides away.
  const slide = (u, lazy) => `<div class="feed-slide"><img class="feed-backdrop" src="${u}" alt="" aria-hidden="true" draggable="false" ${lazy ? 'loading="lazy"' : ''}><img class="feed-media" data-fit-media src="${u}" alt="" draggable="false" ${lazy ? 'loading="lazy"' : ''}></div>`;
  const mediaHtml = safeUrl(l.video)
    ? `<div class="feed-slide feed-slide--video"><video class="feed-media" data-fit-media src="${safeUrl(l.video)}" muted loop playsinline preload="metadata"></video></div>`
    : isGallery
      ? `<div class="feed-gallery" data-gallery>${photos.map((u,n)=> slide(u, n > 0)).join('')}</div>`
      : (safeUrl(l.media) ? slide(safeUrl(l.media), false) : `<div class="feed-placeholder feed-placeholder--${postType}">${typeIcon}</div>`);
  const dotsHtml = isGallery
    ? `<div class="feed-dots"><button class="feed-gallery-nav" data-gallery-step="-1" aria-label="${t('prevPhoto')}" disabled>${chevronIconSvg}</button>${photos.map((u,n)=>`<button class="feed-dot${n ? '' : ' active'}" data-gallery-dot="${n}" aria-label="${escapeHtml(fmt('photoN', { n: n+1 }))}"></button>`).join('')}<button class="feed-gallery-nav feed-gallery-nav--next" data-gallery-step="1" aria-label="${t('nextPhoto')}">${chevronIconSvg}</button></div>`
    : '';
  // Rooms saved without a description store "—"; don't spend a line of the card on it.
  const desc = String(l.desc || '').trim();
  const hasDesc = desc !== '' && desc !== '—';
  // Only tags that say something: "any gender" and "any nationality" are left out.
  const roomTags = isHousing ? [
    (l.gender && l.gender !== 'any') ? t(genderLabelKey[l.gender] || l.gender) : null,
    (l.nat && l.nat !== 'Any') ? l.nat : null,
    l.bills ? t('billsIncluded') : t('billsShared')
  ].filter(Boolean) : [];
  return `
  <div class="feed-card${isGallery ? ' feed-card--gallery' : ''}${isHousing ? ' feed-card--room' : ''}" data-idx="${i}" data-like-key="${key}" data-listing-id="${key}">
    ${mediaHtml}
    <div class="feed-scrim"></div>
    <div class="feed-heart-burst" data-heart-burst></div>
    ${safeUrl(l.video) ? `<button class="feed-mute" data-mute-toggle="${i}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 9v6h4l5 4V5l-5 4H5z"/><path d="M17 9a3 3 0 010 6" stroke-opacity="0.4"/></svg></button>` : ''}
    <div class="feed-rail">
      <div><button class="lk ${liked?'active':''}" data-like="${key}" aria-pressed="${liked}" aria-label="${t('likeLabel')}">${heartIconSvg}</button><div class="lbl" data-like-count="${key}">${formatCount(count)}</div></div>
      ${wa ? `<div><button class="wa" data-wa="${wa}" aria-label="${t('contactWA')}">${waIconSvg}</button><div class="lbl">${t('contactWA')}</div></div>` : ''}
      ${isForumInquiry ? `<div><button class="ans" data-view-forum-post="${l.forumIndex}">${chatIconSvg}</button><div class="lbl">${t('viewAndAnswer')}</div></div>` : ''}
      <div><button class="sv ${saved?'active':''}" data-save="${key}" aria-pressed="${saved}" aria-label="${t('saveLabel')}">${bookmarkIconSvg}</button><div class="lbl">${t('saveLabel')}</div></div>
      <div><button class="sh" data-share-listing-id="${key}" aria-label="${t('shareLabel')}">${shareIconSvg}</button><div class="lbl">${t('shareLabel')}</div></div>
      ${isMine ? `<div><button class="del" data-delete-post="${key}" data-delete-kind="${isForumInquiry ? 'forum' : 'listing'}" aria-label="${t('deleteLabel')}">${trashIconSvg}</button><div class="lbl">${t('deleteLabel')}</div></div>` : ''}
    </div>
    <div class="feed-content">
      ${dotsHtml}
      ${isHousing ? `
      <div class="feed-title-row">
        <h3>${escapeHtml(t(roomTypeLabelKey[l.type] || l.type))} · ${escapeHtml(l.city)}</h3>
        <span class="feed-price-pill">${escapeHtml(l.rent)} ${t('sarLabel')}${t('perMonth')}</span>
      </div>` : ''}
      <div class="feed-handle">
        <button class="feed-handle-link" ${hasProfile ? `data-view-profile="${posterId}"` : 'disabled'}>
          <span class="feed-avatar-sm">${avatarLetter}</span>
          <span class="handle-name">${isHousing ? '' : t('postedBy') + ' '}${escapeHtml(l.by)}</span>
        </button>
        ${isHousing
          ? roomTags.map(tag=>`<span class="feed-tag">${escapeHtml(tag)}</span>`).join('')
          : isForumInquiry
            ? `<span class="feed-price-pill feed-price-pill--muted">${chatIconSvg}${l.repliesCount}</span>`
            : `<span class="feed-tag">${t(typeTagKey)}</span>`}
      </div>
      ${hasDesc ? `<p class="feed-desc${isHousing ? '' : ' feed-desc--quote'}" ${isHousing ? 'data-desc-toggle' : ''}>${escapeHtml(desc)}</p>` : ''}
      ${isForumInquiry
        ? `<div class="feed-tag-row"><span class="feed-tag">${t('fromCommunity')}</span></div>`
        : (!isHousing && l.natTarget ? `<div class="feed-tag-row"><span class="feed-tag">#${escapeHtml(l.natTarget.replace(/\s+/g,''))}</span></div>` : '')}
    </div>
  </div>
`;
}

/* Cover the card when that crops little (a tall phone photo or video); otherwise show the whole
   photo or video. Room photos are usually landscape or 4:3, and cropping them to a tall phone
   screen hid most of the room. */
function fitFeedMedia(el){
  const w = el.naturalWidth || el.videoWidth, h = el.naturalHeight || el.videoHeight;
  const slide = el.closest('.feed-slide');
  if(!w || !h || !slide || !slide.clientWidth || !slide.clientHeight) return;
  const mediaRatio = w / h, boxRatio = slide.clientWidth / slide.clientHeight;
  // Share of the photo that cover would cut off, on whichever side overflows.
  const cut = mediaRatio > boxRatio ? 1 - boxRatio / mediaRatio : 1 - mediaRatio / boxRatio;
  slide.dataset.fit = cut > 0.2 ? 'contain' : 'cover';
}
function bindFeedMediaFit(wrap){
  wrap.querySelectorAll('[data-fit-media]').forEach(el=>{
    const run = ()=> fitFeedMedia(el);
    if(el.tagName === 'VIDEO'){
      if(el.readyState >= 1) run(); else el.addEventListener('loadedmetadata', run, { once:true });
    } else if(el.complete && el.naturalWidth){ run(); }
    else el.addEventListener('load', run, { once:true });
  });
}
window.addEventListener('resize', ()=> document.querySelectorAll('[data-fit-media]').forEach(fitFeedMedia));

/* Wires up whatever a feed-scroll container of .feed-card elements needs — shared
   by the Feed's listingsGrid and Community's forumFeedScroll. */
function bindFeedCardEvents(wrap, filtered){
  wrap.querySelectorAll('[data-view-forum-post]').forEach(btn=>{
    btn.addEventListener('click', ()=> jumpToForumPost(parseInt(btn.getAttribute('data-view-forum-post'))));
  });
  wrap.querySelectorAll('[data-wa]').forEach(btn=>{
    btn.addEventListener('click', ()=> window.open('https://wa.me/'+btn.getAttribute('data-wa'), '_blank', 'noopener'));
  });
  wrap.querySelectorAll('[data-mute-toggle]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const card = btn.closest('.feed-card');
      const vid = card.querySelector('video');
      if(vid){ vid.muted = !vid.muted; }
    });
  });
  wrap.querySelectorAll('[data-share-listing-id]').forEach(btn=>{
    btn.addEventListener('click', ()=> openListingSharePanel(btn.getAttribute('data-share-listing-id')));
  });
  wrap.querySelectorAll('[data-view-profile]').forEach(btn=>{
    btn.addEventListener('click', ()=> showPublicProfile(btn.getAttribute('data-view-profile')));
  });
  wrap.querySelectorAll('[data-delete-post]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-delete-post');
      if(btn.getAttribute('data-delete-kind') === 'forum') deleteForumPost(id);
      else deleteListing(id);
    });
  });

  /* ---- Likes: tap the heart, or double-tap the card (TikTok's classic gesture) ---- */
  function setLiked(card, key, liked){
    state.feedLikes[key] = liked;
    persistIdSet(LIKED_STORAGE_KEY, state.feedLikes);
    const btn = card.querySelector('[data-like="'+CSS.escape(key)+'"]');
    const lbl = card.querySelector('[data-like-count="'+CSS.escape(key)+'"]');
    if(btn){ btn.classList.toggle('active', liked); btn.setAttribute('aria-pressed', String(liked)); }
    if(lbl){
      const listing = filtered.find(l=> l.id === key);
      if(listing) lbl.textContent = formatCount(likeCount(listing, liked));
    }
  }
  function burstHeart(card){
    const burst = card.querySelector('[data-heart-burst]');
    if(!burst) return;
    burst.innerHTML = heartIconSvg;
    burst.classList.remove('play'); void burst.offsetWidth; burst.classList.add('play');
  }
  wrap.querySelectorAll('[data-like]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.getAttribute('data-like');
      const card = btn.closest('.feed-card');
      const nowLiked = !state.feedLikes[key];
      setLiked(card, key, nowLiked);
      if(nowLiked) burstHeart(card);
    });
  });
  wrap.querySelectorAll('[data-save]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.getAttribute('data-save');
      const nowSaved = !state.feedSaves[key];
      state.feedSaves[key] = nowSaved;
      persistIdSet(SAVED_STORAGE_KEY, state.feedSaves);
      btn.classList.toggle('active', nowSaved);
      btn.setAttribute('aria-pressed', String(nowSaved));
    });
  });
  // One tap hides the card's text and buttons so the whole photo or video can be seen, and the
  // next tap brings them back. A second tap within 320ms is a double tap, which likes instead.
  let lastTap = 0, tapTimer = null;
  wrap.querySelectorAll('.feed-card[data-like-key]').forEach(card=>{
    card.addEventListener('click', (e)=>{
      if(e.target.closest('button')) return; // real controls handle their own taps
      if(e.target.closest('[data-desc-toggle]')) return; // tapping the description opens it
      if(Date.now() - (card._draggedAt || 0) < 400) return; // end of a mouse drag in a gallery
      const now = Date.now();
      if(now - lastTap < 320){
        clearTimeout(tapTimer);
        lastTap = 0;
        const key = card.getAttribute('data-like-key');
        setLiked(card, key, true);
        burstHeart(card);
        return;
      }
      lastTap = now;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(()=> card.classList.toggle('feed-card--clean'), 320);
    });
  });
  wrap.querySelectorAll('[data-desc-toggle]').forEach(p=>{
    p.addEventListener('click', ()=> p.classList.toggle('open'));
  });
  bindFeedMediaFit(wrap);

  // Photo galleries: keep the dots in step with the swipe, and let a dot jump to its photo.
  // In RTL the gallery scrolls the other way and scrollLeft runs from 0 to negative.
  // Fingers swipe the gallery natively; a mouse can't drag a scroll box, so on a
  // computer a drag is turned into one step, and the arrows beside the dots step too.
  wrap.querySelectorAll('[data-gallery]').forEach(gallery=>{
    const card = gallery.closest('.feed-card');
    const dots = card.querySelectorAll('[data-gallery-dot]');
    const prev = card.querySelector('[data-gallery-step="-1"]');
    const next = card.querySelector('[data-gallery-step="1"]');
    const last = dots.length - 1;
    const rtl = ()=> getComputedStyle(gallery).direction === 'rtl';
    const current = ()=> Math.round(Math.abs(gallery.scrollLeft) / gallery.clientWidth);
    const goTo = (n)=>{
      n = Math.max(0, Math.min(last, n));
      gallery.scrollTo({ left: n * gallery.clientWidth * (rtl() ? -1 : 1), behavior: 'smooth' });
    };
    const sync = ()=>{
      const idx = current();
      dots.forEach((d,n)=> d.classList.toggle('active', n===idx));
      if(prev) prev.disabled = idx <= 0;
      if(next) next.disabled = idx >= last;
    };
    gallery.addEventListener('scroll', sync, { passive: true });
    dots.forEach(dot=> dot.addEventListener('click', ()=> goTo(parseInt(dot.getAttribute('data-gallery-dot')))));
    if(prev) prev.addEventListener('click', ()=> goTo(current() - 1));
    if(next) next.addEventListener('click', ()=> goTo(current() + 1));
    let dragX = null;
    gallery.addEventListener('pointerdown', e=>{ if(e.pointerType === 'mouse') dragX = e.clientX; });
    window.addEventListener('pointerup', e=>{
      if(dragX === null) return;
      const dx = e.clientX - dragX;
      dragX = null;
      if(Math.abs(dx) < 40) return; // a click or double-click, not a drag
      card._draggedAt = Date.now();
      const forward = (dx < 0) !== rtl(); // dragging toward the reading start moves forward
      goTo(current() + (forward ? 1 : -1));
    });
  });

  // Autoplay the video currently in view, pause the rest — same feel as a short-video feed.
  const videos = wrap.querySelectorAll('video');
  if(videos.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){ entry.target.play().catch(()=>{}); }
        else{ entry.target.pause(); }
      });
    }, { root: wrap, threshold: 0.6 });
    videos.forEach(v=>io.observe(v));
  }
}

function renderListings(){
  const wrap = document.getElementById('listingsGrid');
  const filtered = filterListings();
  updateFilterUI();
  if(filtered.length===0){
    wrap.innerHTML = `
      <div class="feed-card feed-card--empty">
        <div class="feed-placeholder">${houseIconSvg}</div>
        <div class="feed-empty">
          <strong>${t('noListingsTitle')}</strong>
          <p>${t('noListingsSub')}</p>
          <button id="btnEmptyReset">${t('filtersReset')}</button>
        </div>
      </div>`;
    wrap.querySelector('#btnEmptyReset').addEventListener('click', resetFilters);
    return;
  }
  wrap.innerHTML = filtered.map((l,i)=> buildFeedCardHtml(l,i)).join('');
  bindFeedCardEvents(wrap, filtered);
}

/* ---- Forum render ---- */
async function fetchAndRenderForum(){
  if (!SUPABASE_CONFIGURED) { renderForum(); return; }
  try {
    const { data, error } = await supabaseClient
      .from('forum_posts')
      .select('*, forum_replies(*, app_users(name))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching forum:', error);
      renderForum();
      return;
    }

    forumPosts = data.map(p => ({
      id: p.id,
      cat: p.category,
      q: p.question,
      by: p.posted_by,
      posterUserId: p.poster_user_id,
      votes: p.votes,
      replies: (p.forum_replies || [])
        .slice()
        .sort((a,b)=> new Date(a.created_at) - new Date(b.created_at))
        .map(r => ({
          id: r.id,
          text: r.reply_text,
          by: r.app_users ? (r.app_users.name || t('memberFallback')) : null,
          votes: r.votes || 0,
          posterUserId: r.poster_user_id
        }))
    }));

    if(appUser && !String(appUser.id).startsWith('local-')){
      const { data: myVotes } = await supabaseClient.from('forum_reply_votes').select('reply_id').eq('user_id', appUser.id);
      myReplyVotes = new Set((myVotes||[]).map(v=>v.reply_id));
    } else {
      myReplyVotes = new Set();
    }

    renderForum();
  } catch (err) {
    console.error('Could not reach Supabase for forum posts, showing local data instead:', err);
    renderForum();
  }
}

function renderCatChips(){
  const cats = ["All","Housing","Legal","Jobs","General life","Before arrival"];
  const catKeys = {All:"catAll", Housing:"catHousing", Legal:"catLegal", Jobs:"catJobs", "General life":"catLife", "Before arrival":"catArrival"};
  const row = document.getElementById('catChipRow');
  row.innerHTML = cats.map(c=>`<button class="cat-chip ${state.forumCat===c?'active':''}" data-cat="${c}">${t(catKeys[c])}</button>`).join('');
  row.querySelectorAll('[data-cat]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.forumCat = btn.getAttribute('data-cat');
      document.getElementById('forumFeedScroll').scrollTop = 0;
      renderCatChips(); renderForum();
    });
  });
}

/* Community's Q&A stream reuses the exact same full-bleed card the Feed uses for
   inquiry posts (see buildFeedCardHtml) — same swipe, same like/save/share rail —
   with one addition: an "answer" rail button that opens this post's replies here,
   in place, instead of jumping away. */
function renderForum(){
  const wrap = document.getElementById('forumFeedScroll');
  // Voting or replying re-renders the list: without this the open answers panel jumped back to
  // its top after every tap.
  const prevPanels = [...wrap.querySelectorAll('.feed-replies-panel.open')].map(p=> [p.id, p.scrollTop]);
  const items = (state.forumCat==='All' ? forumPosts : forumPosts.filter(p=>p.cat===state.forumCat))
    .map(p=>{
      const idx = forumPosts.indexOf(p);
      return { id: p.id || ('forum-'+idx), forumIndex: idx, posterUserId: p.posterUserId || null, postType:'inquiry', desc: p.q, by: p.by, repliesCount: (p.replies||[]).length };
    });

  if(!items.length){
    wrap.innerHTML = `
      <div class="feed-card feed-card--empty">
        <div class="feed-placeholder feed-placeholder--inquiry">${chatIconSvg}</div>
        <div class="feed-empty">
          <strong>${t('noQuestionsYet')}</strong>
        </div>
      </div>`;
  } else {
    wrap.innerHTML = items.map((item,i)=>{
      const card = buildFeedCardHtml(item, i);
      const idx = item.forumIndex;
      const post = forumPosts[idx];
      const open = state.openReplies[idx];
      const repliesHtml = `
        <div class="feed-replies-panel ${open?'open':''}" id="feed-replies-${idx}">
          <button class="feed-replies-close" data-close-replies="${idx}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <p class="feed-replies-q">${escapeHtml(post.q)}</p>
          <div class="feed-replies-list">${post.replies.map(r=> renderReply(r)).join('') || `<p class="hint">${t('noHelpersYet')}</p>`}</div>
          ${appUser
            ? `<div class="reply-compose">
                <input type="text" data-reply-input="${idx}" placeholder="${t('replyPh')}">
                <button data-submit-reply="${idx}">${t('replySubmit')}</button>
              </div>`
            : `<p class="hint reply-signin-hint" data-reply-signin="${idx}">${t('replySignInHint')}</p>`}
        </div>`;
      return `<div class="feed-card-wrap">${card}${repliesHtml}</div>`;
    }).join('');
  }

  bindFeedCardEvents(wrap, items);

  wrap.querySelectorAll('[data-view-forum-post]').forEach(btn=>{
    // Inside Community itself, "answer" opens replies in place rather than navigating.
    btn.replaceWith(btn.cloneNode(true));
  });
  wrap.querySelectorAll('.ans[data-view-forum-post]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.getAttribute('data-view-forum-post');
      state.openReplies[idx] = !state.openReplies[idx];
      renderForum();
    });
  });
  wrap.querySelectorAll('[data-close-replies]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.openReplies[btn.getAttribute('data-close-replies')] = false;
      renderForum();
    });
  });
  wrap.querySelectorAll('[data-submit-reply]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = btn.getAttribute('data-submit-reply');
      const input = wrap.querySelector('[data-reply-input="'+idx+'"]');
      const text = input.value.trim();
      if(!text) return;
      submitReply(forumPosts[idx], text);
    });
  });
  wrap.querySelectorAll('[data-reply-signin]').forEach(el=>{
    el.addEventListener('click', ()=> requireSignIn(()=>{}));
  });
  wrap.querySelectorAll('[data-vote-reply]').forEach(btn=>{
    btn.addEventListener('click', ()=> voteOnReply(btn.getAttribute('data-vote-reply')));
  });
  wrap.querySelectorAll('[data-delete-reply]').forEach(btn=>{
    btn.addEventListener('click', ()=> deleteForumReply(btn.getAttribute('data-delete-reply')));
  });

  prevPanels.forEach(([id, top])=>{ const p = document.getElementById(id); if(p) p.scrollTop = top; });

  // Community questions are mirrored into the Feed too (see forumFeedItems),
  // so any change here — a new question, a new reply count — needs to reach it.
  renderListings();
}

/* A reply is either a plain string (old seeded demo data — no author, no
   voting) or an object from Supabase ({id, text, by, votes, posterUserId}).
   Render both without the demo ones looking broken. */
function renderReply(r){
  const isReal = typeof r === 'object' && r !== null;
  const text = isReal ? r.text : r;
  const by = isReal ? r.by : null;
  const canVote = isReal && !!r.id;
  const voted = canVote && myReplyVotes.has(r.id);
  return `<div class="reply">
    <span class="who">↳</span>
    <div class="reply-body">
      <p>${escapeHtml(text)}</p>
      <div class="reply-meta">
        ${by ? `<button class="reply-by" ${r.posterUserId?`data-view-profile="${escapeHtml(r.posterUserId)}"`:'disabled'}>${t('repliedBy')} ${escapeHtml(by)}</button>` : ''}
        ${canVote && appUser && r.posterUserId === appUser.id ? `<button class="reply-delete" data-delete-reply="${escapeHtml(r.id)}" aria-label="${t('deleteLabel')}">${trashIconSvg}</button>` : ''}
        ${canVote ? `<button class="reply-vote ${voted?'voted':''}" data-vote-reply="${escapeHtml(r.id)}" ${voted?'disabled':''}>${upvoteIconSvg}<span>${r.votes||0}</span></button>` : ''}
      </div>
    </div>
  </div>`;
}

/* Jumps from a Feed "View & answer" tap to the actual question in Community,
   opening its replies panel. */
function jumpToForumPost(idx){
  const post = forumPosts[idx];
  if(!post) return;
  state.communitySubTab = 'qa';
  setTab('community');
  document.querySelectorAll('[data-subtab]').forEach(b=> b.classList.toggle('active', b.getAttribute('data-subtab')==='qa'));
  document.getElementById('communityQA').style.display = 'block';
  document.getElementById('communityBuddies').style.display = 'none';
  document.getElementById('communityLeaderboard').style.display = 'none';
  state.forumCat = 'All';
  renderCatChips();
  state.openReplies[idx] = true;
  renderForum();
  const card = document.getElementById('feed-replies-'+idx);
  if(card) scrollCardIntoFeed(card.closest('.feed-card-wrap'), true);
}

async function submitReply(post, text){
  requireSignIn(async ()=>{
    if(!SUPABASE_CONFIGURED || !post.id){
      post.replies.push({ id:null, text, by: appUser.name, votes:0, posterUserId: appUser.id });
      renderForum();
      return;
    }
    try{
      const { error } = await supabaseClient.rpc('create_forum_reply', {
        p_session_token: appUser.sessionToken, p_post_id: post.id, p_reply_text: text
      });
      if(error){ console.error('Error posting reply:', error); return; }
      await fetchAndRenderForum();
    } catch(err){
      console.error('Could not reach Supabase to post reply:', err);
    }
  });
}

async function voteOnReply(replyId){
  requireSignIn(async ()=>{
    if(myReplyVotes.has(replyId)) return; // UI already disables this, but don't trust it blindly
    if(!SUPABASE_CONFIGURED || String(appUser.id).startsWith('local-')){
      myReplyVotes.add(replyId);
      renderForum();
      return;
    }
    try{
      const { error } = await supabaseClient.rpc('vote_on_reply', {
        p_session_token: appUser.sessionToken, p_reply_id: replyId
      });
      if(error) console.error('Error voting on reply:', error);
      await fetchAndRenderForum();
      await fetchLeaderboardData();
      renderLeaderboard();
    } catch(err){
      console.error('Could not reach Supabase to vote on reply:', err);
    }
  });
}

/* ============================= Deleting your own posts ============================= */
/* The Delete buttons only render on the signed-in user's own content; the
   server checks ownership again from the session token (schema.sql §13). */
async function runOwnDelete(rpcName, params, deleteLocally){
  if(!window.confirm(t('deleteConfirm'))) return false;
  if(!SUPABASE_CONFIGURED || String(appUser.id).startsWith('local-')){
    deleteLocally();
    return true;
  }
  try{
    const { error } = await supabaseClient.rpc(rpcName, { p_session_token: appUser.sessionToken, ...params });
    if(error){
      console.error(`Error in ${rpcName}:`, error);
      window.alert(t('deleteFailed'));
      return false;
    }
    return true;
  } catch(err){
    console.error(`Could not reach Supabase for ${rpcName}:`, err);
    window.alert(t('deleteFailed'));
    return false;
  }
}

function deleteListing(listingId){
  requireSignIn(async ()=>{
    const ok = await runOwnDelete('delete_listing', { p_listing_id: listingId }, ()=>{
      listings = listings.filter(l=> l.id !== listingId);
      myListingsCache = myListingsCache.filter(l=> l.id !== listingId);
    });
    if(!ok) return;
    await Promise.all([fetchAndRenderListings(), fetchAndRenderProfileStats()]);
    renderProfile();
  });
}

function deleteForumPost(postId){
  requireSignIn(async ()=>{
    const ok = await runOwnDelete('delete_forum_post', { p_post_id: postId }, ()=>{
      forumPosts = forumPosts.filter(p=> p.id !== postId);
    });
    if(!ok) return;
    state.openReplies = {}; // keyed by list position, which just shifted
    await Promise.all([fetchAndRenderForum(), fetchAndRenderProfileStats(), fetchLeaderboardData()]);
    renderLeaderboard();
    renderProfile();
  });
}

function deleteForumReply(replyId){
  requireSignIn(async ()=>{
    const ok = await runOwnDelete('delete_forum_reply', { p_reply_id: replyId }, ()=>{
      forumPosts.forEach(p=>{ p.replies = p.replies.filter(r=> !(r && r.id === replyId)); });
    });
    if(!ok) return;
    await Promise.all([fetchAndRenderForum(), fetchLeaderboardData()]);
    renderLeaderboard();
    renderProfile();
  });
}

function deleteBuddyProfile(){
  requireSignIn(async ()=>{
    const ok = await runOwnDelete('delete_buddy', {}, ()=>{
      buddies = buddies.filter(b=> b.userId !== appUser.id);
    });
    if(!ok) return;
    await Promise.all([fetchAndRenderBuddies(), fetchLeaderboardData()]);
    renderLeaderboard();
    renderProfile();
  });
}

/* ============================= Sign-in (email code) ============================= */
/* Steps: 'email' -> 'code' -> 'name' (new accounts only). Older accounts use
   'legacy' (username + password), then add their email once through the same
   email/code steps: the server refuses every write until an account has a
   verified email (sanad_session_user in schema.sql). The send-code Edge
   Function (supabase/functions) emails the code; verify_email_code in
   schema.sql checks it. */
const AUTH_STORAGE_KEY = 'sanad_user';
let authStep = 'email';
let authEmail = null;     // the normalized email the current code was sent to
let authLinkUser = null;  // a username account that still needs an email
let authNewUser = null;   // a brand-new email account waiting for its name

function setAuthStep(step){
  authStep = step;
  document.getElementById('authStepEmail').style.display = step==='email' ? 'block' : 'none';
  document.getElementById('authStepCode').style.display = step==='code' ? 'block' : 'none';
  document.getElementById('authStepName').style.display = step==='name' ? 'block' : 'none';
  document.getElementById('authStepLegacy').style.display = step==='legacy' ? 'block' : 'none';
  // Adding an email to a username account is required, so no way back to the username form.
  document.getElementById('btnUseUsername').style.display = authLinkUser ? 'none' : 'block';
  const hint = document.getElementById('authHint');
  if(step==='email') hint.textContent = t(authLinkUser ? 'authHintLink' : 'authHintEmail');
  else if(step==='code'){
    hint.textContent = '';
    const addr = document.createElement('bdi');
    addr.dir = 'ltr'; // keeps the address readable inside Arabic and Urdu text
    addr.textContent = authEmail;
    const [before, after] = t('authHintCode').split('{email}');
    hint.append(before || '', addr, after || '');
  }
  else if(step==='name') hint.textContent = t('authHintName');
  else hint.textContent = t('loginHint');
  hideAuthError();
}
function showAuthError(msg){
  const el = document.getElementById('authError');
  el.textContent = msg;
  el.style.display = 'block';
}
function hideAuthError(){
  document.getElementById('authError').style.display = 'none';
}

function openSignIn(onSuccess){
  pendingSignInAction = onSuccess || null;
  authEmail = null; authLinkUser = null; authNewUser = null;
  ['si-email','si-code','si-name','si-username','si-password'].forEach(id=> document.getElementById(id).value = '');
  setAuthStep('email');
  document.getElementById('signInModal').style.display = 'flex';
}
function closeSignIn(){
  document.getElementById('signInModal').style.display = 'none';
  pendingSignInAction = null;
  authLinkUser = null;
  // A new account that closes before picking a name is still signed in (it shows as "Member").
  if(authNewUser){ const u = authNewUser; authNewUser = null; finishSignIn(u); }
}
function requireSignIn(onReady){
  // A session saved before session tokens existed (or one Supabase has since
  // rotated via a fresh login elsewhere) has no sessionToken — every
  // server-verified action would silently fail, so treat it as signed out
  // and ask for a fresh login instead of surfacing a confusing RPC error.
  if(appUser && SUPABASE_CONFIGURED && !String(appUser.id).startsWith('local-') && !appUser.sessionToken){
    appUser = null;
    persistAppUser();
    renderProfile();
  }
  if(appUser){ onReady(); return; }
  openSignIn(onReady);
}

function persistAppUser(){
  if(appUser) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(appUser));
  else localStorage.removeItem(AUTH_STORAGE_KEY);
}
function restoreAppUser(){
  try{
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if(raw) appUser = JSON.parse(raw);
  } catch(err){ appUser = null; }
}

/* Codes may be typed with Arabic, Urdu, Hindi (Devanagari) or Bengali digits. */
function toLatinDigits(value){
  return String(value||'')
    .replace(/[٠-٩]/g, d=> String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, d=> String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[०-९]/g, d=> String('०१२३४५६७८९'.indexOf(d)))
    .replace(/[০-৯]/g, d=> String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
}
// Same rule as sanad_clean_email in schema.sql.
function normalizeEmail(raw){
  const e = String(raw||'').trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && e.length <= 254 ? e : null;
}

const AUTH_ERROR_KEYS = {
  invalid_email:'authErrorEmail', too_many:'authErrorTooManyCodes', send_failed:'authErrorSendFailed',
  wrong:'authErrorWrongCode', expired:'authErrorCodeExpired', email_taken:'authErrorEmailTaken'
};
// Calls the send-code Edge Function and returns { data } or { error: '<code>' }.
async function callAuthFunction(name, body){
  try{
    const { data, error } = await supabaseClient.functions.invoke(name, { body });
    if(!error) return { data };
    let code = 'network';
    if(error.context && typeof error.context.json === 'function'){
      try{ const j = await error.context.json(); if(j && j.error) code = j.error; } catch(e){}
    }
    console.error(`Sanad: ${name} failed:`, code, error);
    return { error: code };
  } catch(err){
    console.error(`Sanad: could not reach ${name}:`, err);
    return { error: 'network' };
  }
}
function showAuthFunctionError(code){
  showAuthError(t(AUTH_ERROR_KEYS[code] || 'authErrorNetwork'));
}
async function withBusy(btnId, fn){
  const btn = document.getElementById(btnId);
  if(btn.disabled) return;
  btn.disabled = true;
  try{ await fn(); } finally{ btn.disabled = false; }
}

function sendCode(){
  return withBusy('btnSendCode', async ()=>{
    hideAuthError();
    const email = normalizeEmail(document.getElementById('si-email').value);
    if(!email){ showAuthError(t('authErrorEmail')); return; }
    if(SUPABASE_CONFIGURED){
      const { error } = await callAuthFunction('send-code', { email, lang: state.lang });
      if(error){ showAuthFunctionError(error); return; }
    }
    authEmail = email;
    document.getElementById('si-code').value = '';
    setAuthStep('code');
    document.getElementById('si-code').focus();
  });
}
function resendCode(){
  return withBusy('btnResendCode', async ()=>{
    hideAuthError();
    if(SUPABASE_CONFIGURED){
      const { error } = await callAuthFunction('send-code', { email: authEmail, lang: state.lang });
      if(error){ showAuthFunctionError(error); return; }
    }
    document.getElementById('authHint').textContent = t('codeResent');
  });
}

function verifyCode(){
  return withBusy('btnVerifyCode', async ()=>{
    hideAuthError();
    const code = toLatinDigits(document.getElementById('si-code').value).replace(/\D/g, '');
    if(code.length < 4){ showAuthError(t('authErrorCode')); return; }

    if(!SUPABASE_CONFIGURED){
      // No backend configured yet — accept any code so the demo still works offline.
      const user = authLinkUser
        ? { ...authLinkUser, email: authEmail }
        : { id:'local-'+authEmail, name:'', email: authEmail, createdAt: new Date().toISOString(), sessionToken:'local-session-'+Date.now() };
      if(authLinkUser){ authLinkUser = null; finishSignIn(user); }
      else { authNewUser = user; setAuthStep('name'); }
      return;
    }

    let row;
    try{
      const { data, error } = await supabaseClient.rpc('verify_email_code', { p_email: authEmail, p_code: code, p_link_token: authLinkUser ? authLinkUser.sessionToken : null });
      if(error){
        console.error('Sanad: verify_email_code failed:', error);
        // A new account past the per-network sign-up limit (schema.sql §14).
        showAuthError(t((error.message||'').toLowerCase().includes('too often') ? 'authErrorTooOften' : 'authErrorNetwork'));
        return;
      }
      row = Array.isArray(data) ? data[0] : data;
    } catch(err){
      console.error('Sanad: could not reach Supabase to check the code:', err);
      showAuthError(t('authErrorNetwork'));
      return;
    }
    if(!row){ showAuthError(t('authErrorNetwork')); return; }
    if(row.status === 'not_signed_in'){ authLinkUser = null; setAuthStep('legacy'); showAuthError(t('authErrorInvalid')); return; }
    if(row.status !== 'ok'){ showAuthFunctionError(row.status); return; }
    const user = { id: row.id, username: row.username, name: row.name, email: authEmail, createdAt: row.created_at, sessionToken: row.session_token };
    authLinkUser = null;
    // New accounts, and ones that closed the app before picking a name, choose one now.
    if(row.is_new || !row.name){ authNewUser = user; setAuthStep('name'); document.getElementById('si-name').focus(); return; }
    finishSignIn(user);
  });
}

function saveName(){
  return withBusy('btnSaveName', async ()=>{
    hideAuthError();
    const name = document.getElementById('si-name').value.trim();
    if(!name){ showAuthError(t('authErrorName')); return; }
    if(SUPABASE_CONFIGURED && !String(authNewUser.id).startsWith('local-')){
      try{
        const { error } = await supabaseClient.rpc('set_my_name', { p_session_token: authNewUser.sessionToken, p_name: name });
        if(error){ console.error('Sanad: set_my_name failed:', error); showAuthError(t('authErrorNetwork')); return; }
      } catch(err){
        console.error('Sanad: could not reach Supabase to save the name:', err);
        showAuthError(t('authErrorNetwork'));
        return;
      }
    }
    const user = { ...authNewUser, name };
    authNewUser = null;
    finishSignIn(user);
  });
}

async function submitSignIn(){
  const username = document.getElementById('si-username').value.trim();
  const password = document.getElementById('si-password').value;
  hideAuthError();

  if(!username || !password){ showAuthError(t('authErrorMissing')); return; }

  if(!SUPABASE_CONFIGURED){
    // No backend configured yet — accept anything so the demo still works offline.
    authLinkUser = { id:'local-'+username.toLowerCase(), username: username.toLowerCase(), name: username, createdAt: new Date().toISOString(), sessionToken:'local-session-'+Date.now() };
    setAuthStep('email');
    return;
  }
  try{
    const { data, error } = await supabaseClient.rpc('login_user', { p_username: username, p_password: password });
    if(error){
      // Always log the raw error — the banner below only shows a translated
      // summary, and "couldn't reach the server" hides very different causes
      // (schema.sql not run yet, RLS blocking the call, a real network drop).
      console.error('Sanad: login_user failed:', error);
      const msg = (error.message||'').toLowerCase();
      if(msg.includes('invalid username or password')) showAuthError(t('authErrorInvalid'));
      else if(msg.includes('too many failed attempts')) showAuthError(t('authErrorTooMany'));
      else if(error.code === 'PGRST202' || msg.includes('could not find the function')){
        showAuthError('Sign-in isn\'t set up on the database yet — run schema.sql in the Supabase SQL editor (see console for details).');
      } else {
        showAuthError(t('authErrorNetwork') + ' (' + (error.message || error.code || 'unknown error') + ')');
      }
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if(!row){ showAuthError(t('authErrorInvalid')); return; }
    const user = { id: row.id, username: row.username, name: row.name, createdAt: row.created_at, sessionToken: row.session_token };
    const { data: status } = await supabaseClient.rpc('session_status', { p_session_token: user.sessionToken });
    const s = Array.isArray(status) ? status[0] : status;
    if(s && s.email_verified){ finishSignIn({ ...user, email: s.email }); return; }
    authLinkUser = user;
    document.getElementById('si-email').value = '';
    setAuthStep('email');
  } catch(err){
    console.error('Sanad: could not reach Supabase to sign in:', err);
    showAuthError(t('authErrorNetwork') + ' (' + (err && err.message ? err.message : String(err)) + ')');
  }
}

async function finishSignIn(user){
  appUser = user;
  persistAppUser();
  document.getElementById('signInModal').style.display = 'none';
  const action = pendingSignInAction;
  pendingSignInAction = null;
  renderProfile();
  // Refetch anything that depends on "who's signed in" — forum vote state,
  // leaderboard/open-to-work status, share links — so it isn't stale from
  // whatever it looked like before this login (e.g. signed-out placeholders).
  await Promise.all([fetchAndRenderShareLinks(), fetchAndRenderProfileStats(), fetchAndRenderForum(), fetchLeaderboardData()]);
  renderProfile();
  renderLeaderboard();
  renderBuddies();
  if(action) action();
}

/* A saved session can stop working (signed out elsewhere, expired after 90
   days unused) or belong to a username account with no email yet.
   Either way every write would fail, so show it as signed out. */
async function validateStoredSession(){
  if(!appUser || !SUPABASE_CONFIGURED || String(appUser.id).startsWith('local-')) return;
  try{
    const { data, error } = await supabaseClient.rpc('session_status', { p_session_token: appUser.sessionToken });
    if(error){ console.error('Sanad: session_status failed:', error); return; }
    const s = Array.isArray(data) ? data[0] : data;
    if(s && s.signed_in && s.email_verified) return;
    appUser = null;
    persistAppUser();
    renderProfile();
    renderForum();
  } catch(err){
    console.error('Sanad: could not check the saved session:', err);
  }
}

function signOut(){
  if(appUser && SUPABASE_CONFIGURED && !String(appUser.id).startsWith('local-')){
    supabaseClient.rpc('sign_out', { p_session_token: appUser.sessionToken })
      .then(({ error })=>{ if(error) console.error('Sanad: sign_out failed:', error); });
  }
  appUser = null;
  myShareLinks = [];
  persistAppUser();
  renderProfile();
  // Drop the Delete buttons that were only shown on this user's own posts.
  renderForum();
  renderBuddies();
}

/* ---- Profile stats + "Posts"/"Liked"/"Saved" grids ---- */
let profileTab = 'posts';
let myListingsCache = [];

async function fetchAndRenderProfileStats(){
  if(!appUser) return;
  let listingsCount = 0, questionsCount = 0;
  myListingsCache = [];
  if(SUPABASE_CONFIGURED && !String(appUser.id).startsWith('local-')){
    try{
      const [{ count: lc }, { count: qc }, { data: myListings }] = await Promise.all([
        supabaseClient.from('housing_listings').select('id', { count:'exact', head:true }).eq('poster_user_id', appUser.id),
        supabaseClient.from('forum_posts').select('id', { count:'exact', head:true }).eq('poster_user_id', appUser.id),
        supabaseClient.from('housing_listings').select('*').eq('poster_user_id', appUser.id).order('created_at', { ascending:false })
      ]);
      listingsCount = lc || 0;
      questionsCount = qc || 0;
      myListingsCache = myListings || [];
    } catch(err){
      console.error('Could not load profile stats:', err);
    }
  }
  const clicksTotal = myShareLinks.reduce((sum,l)=> sum + (l.clicks||0), 0);
  document.getElementById('statListings').textContent = listingsCount;
  document.getElementById('statQuestions').textContent = questionsCount;
  document.getElementById('statClicks').textContent = clicksTotal;
  renderProfileGrids();
}

function likedListings(){
  // Community questions surfaced in the Feed (see forumFeedItems) are likeable there
  // too, so a liked one needs to show up here alongside liked housing/tips posts.
  return listings.concat(forumFeedItems()).filter(l => state.feedLikes[l.id]);
}
function savedListings(){
  return listings.concat(forumFeedItems()).filter(l => state.feedSaves[l.id]);
}

function profileGridTile(l){
  const isHousing = l.city != null && l.rent != null;
  const icon = isHousing ? houseIconSvg : (l.postType==='inquiry' ? chatIconSvg : bulbIconSvg);
  return `<div class="pf-tile">
    <div class="pf-tile-media">${icon}</div>
    <div class="pf-tile-scrim"></div>
    <div class="pf-tile-info">
      ${isHousing
        ? `<strong>${escapeHtml(l.rent)} ${t('sarLabel')}</strong><span>${escapeHtml(l.city)}</span>`
        : `<span class="pf-tile-snippet">${escapeHtml(String(l.desc||'').slice(0,60))}</span>`}
    </div>
  </div>`;
}

/* Tapping a grid tile (Posts, Liked, or Saved) jumps to where that item actually
   lives — the Feed for a housing/tips post, Community (with replies open) for a question. */
function viewFeedItem(l){
  if(l.forumIndex != null){ jumpToForumPost(l.forumIndex); return; }
  if(!l.id) return;
  state.filters.postType = 'all';
  document.querySelectorAll('#feedTypeChips [data-feed-type]').forEach(b=> b.classList.toggle('active', b.getAttribute('data-feed-type')==='all'));
  setTab('housing');
  renderListings();
  const card = document.querySelector('.feed-card[data-listing-id="'+CSS.escape(l.id)+'"]');
  if(card) scrollCardIntoFeed(card, true);
}

function bindGridTileClicks(gridEl, items){
  const tiles = gridEl.querySelectorAll('.pf-tile');
  items.forEach((l,i)=>{ if(tiles[i]) tiles[i].addEventListener('click', ()=> viewFeedItem(l)); });
}

function renderProfileGrids(){
  const postsGrid = document.getElementById('profilePostsGrid');
  const likedGrid = document.getElementById('profileLikedGrid');
  const savedGrid = document.getElementById('profileSavedGrid');
  const myPosts = myListingsCache.map(l=> ({id:l.id, rent:l.rent, city:l.city, desc:l.description, postType:l.post_type}));
  postsGrid.innerHTML = myPosts.length
    ? myPosts.map(l=> profileGridTile(l)).join('')
    : `<div class="pf-grid-empty">${t('noPostsYet')}</div>`;
  bindGridTileClicks(postsGrid, myPosts);
  const liked = likedListings();
  likedGrid.innerHTML = liked.length
    ? liked.map(l=> profileGridTile(l)).join('')
    : `<div class="pf-grid-empty">${t('noLikedYet')}</div>`;
  bindGridTileClicks(likedGrid, liked);
  const saved = savedListings();
  savedGrid.innerHTML = saved.length
    ? saved.map(l=> profileGridTile(l)).join('')
    : `<div class="pf-grid-empty">${t('noSavedYet')}</div>`;
  bindGridTileClicks(savedGrid, saved);
}

/* ---- Guest (signed-out) inline Liked/Saved shortcuts + language row ---- */
function renderGuestGrids(){
  const likedCountEl = document.getElementById('guestLikedCount');
  const savedCountEl = document.getElementById('guestSavedCount');
  if(!likedCountEl) return; // not on the profile view yet
  const liked = likedListings();
  const saved = savedListings();
  likedCountEl.textContent = fmt('likedCountLabel', { n: liked.length });
  savedCountEl.textContent = fmt('savedCountLabel', { n: saved.length });

  const likedGrid = document.getElementById('guestLikedGrid');
  if(likedGrid.style.display !== 'none'){
    likedGrid.innerHTML = liked.length ? liked.map(l=>profileGridTile(l)).join('') : `<div class="pf-grid-empty">${t('noLikedYet')}</div>`;
    bindGridTileClicks(likedGrid, liked);
  }
  const savedGrid = document.getElementById('guestSavedGrid');
  if(savedGrid.style.display !== 'none'){
    savedGrid.innerHTML = saved.length ? saved.map(l=>profileGridTile(l)).join('') : `<div class="pf-grid-empty">${t('noSavedYet')}</div>`;
    bindGridTileClicks(savedGrid, saved);
  }
}

/* ---- Public profile (tapping a poster's avatar/handle in the feed) ---- */
async function showPublicProfile(userId){
  if(!userId) return;
  setTab('public-profile');
  const avatarEl = document.getElementById('ppAvatar');
  const nameEl = document.getElementById('ppName');
  const countEl = document.getElementById('ppListingCount');
  const gridEl = document.getElementById('ppGrid');
  const badgeEl = document.getElementById('ppTopHelperBadge');
  const contactEl = document.getElementById('ppContactWA');
  const shareBtn = document.getElementById('btnPublicProfileShare');
  avatarEl.textContent = '';
  nameEl.textContent = t('loadingProfile');
  countEl.textContent = '';
  gridEl.innerHTML = '';
  if(badgeEl) badgeEl.style.display = 'none';
  if(contactEl) contactEl.style.display = 'none';
  if(shareBtn) shareBtn.onclick = ()=> openProfileSharePanel(userId);

  const renderInto = (name, theirListings) => {
    avatarEl.textContent = (name || '?').charAt(0).toUpperCase();
    nameEl.textContent = name || t('publicProfileUnavailable');
    countEl.textContent = theirListings.length + ' ' + t('statMyListings').toLowerCase();
    gridEl.innerHTML = theirListings.length
      ? theirListings.map(l=> profileGridTile(l)).join('')
      : `<div class="pf-grid-empty">${t('noPostsYet')}</div>`;
    bindGridTileClicks(gridEl, theirListings);
    if(badgeEl) badgeEl.style.display = isTopHelper(userId) ? 'inline-flex' : 'none';
    if(contactEl){
      const wa = waDigits(openToWorkMap[userId]);
      contactEl.style.display = wa ? 'flex' : 'none';
      contactEl.href = wa ? 'https://wa.me/'+wa : '#';
    }
  };

  if(!SUPABASE_CONFIGURED || String(userId).startsWith('local-')){
    // Nothing to look up outside this tab's own memory — only meaningful for yourself.
    if(appUser && userId === appUser.id){
      renderInto(appUser.name, listings.filter(l=> l.posterUserId === appUser.id));
    } else {
      nameEl.textContent = t('publicProfileUnavailable');
    }
    return;
  }

  try{
    const [{ data: userRows }, { data: theirListings, error }] = await Promise.all([
      supabaseClient.from('app_users').select('id,name').eq('id', userId).limit(1),
      supabaseClient.from('housing_listings').select('*').eq('poster_user_id', userId).order('created_at', { ascending:false })
    ]);
    if(error) console.error('Could not load public profile listings:', error);
    const user = userRows && userRows[0];
    renderInto(user && user.name, (theirListings || []).map(l=>({ id:l.id, rent:l.rent, city:l.city, desc:l.description, postType:l.post_type })));
  } catch(err){
    console.error('Could not load public profile:', err);
    nameEl.textContent = t('publicProfileUnavailable');
  }
}

document.querySelectorAll('[data-ptab]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    profileTab = btn.getAttribute('data-ptab');
    document.querySelectorAll('[data-ptab]').forEach(b=> b.classList.toggle('active', b===btn));
    document.getElementById('profilePostsGrid').style.display = profileTab==='posts' ? 'grid' : 'none';
    document.getElementById('profileLikedGrid').style.display = profileTab==='liked' ? 'grid' : 'none';
    document.getElementById('profileSavedGrid').style.display = profileTab==='saved' ? 'grid' : 'none';
  });
});

function renderProfile(){
  const out = document.getElementById('profileSignedOut');
  const inn = document.getElementById('profileSignedIn');
  renderGuestGrids();
  if(!appUser){
    out.style.display = 'block';
    inn.style.display = 'none';
    return;
  }
  out.style.display = 'none';
  inn.style.display = 'block';
  document.getElementById('profileAvatar').textContent = (appUser.name || appUser.email || appUser.phone || '?').charAt(0).toUpperCase();
  document.getElementById('profileName').textContent = appUser.name || appUser.email || appUser.phone;
  document.getElementById('profileHandle').textContent = appUser.email || appUser.phone || '';
  const year = appUser.createdAt ? new Date(appUser.createdAt).getFullYear() : new Date().getFullYear();
  document.getElementById('profileMemberSince').textContent = t('memberSince') + ' ' + year;
  renderProfileGrids();

  const badgeEl = document.getElementById('profileTopHelperBadge');
  const shareRankBtn = document.getElementById('btnShareMyRank');
  const amTopHelper = isTopHelper(appUser.id);
  if(badgeEl) badgeEl.style.display = amTopHelper ? 'inline-flex' : 'none';
  if(shareRankBtn){
    shareRankBtn.style.display = amTopHelper ? 'flex' : 'none';
    shareRankBtn.onclick = ()=> openProfileSharePanel(appUser.id);
  }

  const isOpen = SUPABASE_CONFIGURED ? !!openToWorkMap[appUser.id] : !!appUser.openToWork;
  const currentWa = SUPABASE_CONFIGURED ? openToWorkMap[appUser.id] : appUser.employerContactWhatsapp;
  const otwToggle = document.getElementById('openToWorkToggle');
  const otwWaField = document.getElementById('openToWorkWaField');
  const otwWaInput = document.getElementById('openToWorkWa');
  if(otwToggle){
    otwToggle.checked = isOpen;
    if(otwWaField) otwWaField.style.display = isOpen ? 'block' : 'none';
    if(otwWaInput && currentWa) otwWaInput.value = currentWa;
  }

  const pages = [
    {key:'guide', label: t('navGuide')},
    {key:'housing', label: t('navHousing')},
    {key:'community', label: t('navCommunity')}
  ];
  const list = document.getElementById('myLinksList');
  list.innerHTML = pages.map(p=>{
    const existing = myShareLinks.find(l=>l.page===p.key);
    if(existing){
      return `<div class="buddy-card">
        <div class="buddy-top"><h3>${p.label}</h3><span style="font-size:12px;color:var(--ink-faint);">${existing.clicks} ${t('clicksLabel')}</span></div>
        <button class="wa-btn" style="background:var(--green);" data-open-share="${p.key}">${shareIconSvg}${t('shareLabel')}</button>
      </div>`;
    }
    return `<div class="buddy-card">
      <div class="buddy-top"><h3>${p.label}</h3></div>
      <button class="wa-btn" style="background:var(--gold);" data-open-share="${p.key}">${shareIconSvg}${t('generateLinkBtn')}</button>
    </div>`;
  }).join('');
  list.querySelectorAll('[data-open-share]').forEach(btn=>{
    btn.addEventListener('click', ()=> openSharePanel(btn.getAttribute('data-open-share')));
  });
}

/* ============================= Share links + click tracking ============================= */
function randomShareCode(){
  return Math.random().toString(36).slice(2, 9);
}

function baseShareUrl(){
  return window.location.origin + window.location.pathname;
}

async function fetchAndRenderShareLinks(){
  if(!appUser){ myShareLinks = []; return; }
  if(!SUPABASE_CONFIGURED){ renderProfile(); return; }
  try{
    const { data, error } = await supabaseClient
      .from('share_links')
      .select('id, page, code, share_clicks(count)')
      .eq('user_id', appUser.id);
    if(error){ console.error('Error loading share links:', error); return; }
    myShareLinks = data.map(l=>({ id:l.id, page:l.page, code:l.code, clicks: (l.share_clicks && l.share_clicks[0]) ? l.share_clicks[0].count : 0 }));
    renderProfile();
  } catch(err){
    console.error('Could not reach Supabase to load share links:', err);
  }
}

async function getOrCreateShareLink(page){
  let existing = myShareLinks.find(l=>l.page===page);
  if(existing) return existing;

  const code = randomShareCode();
  if(!SUPABASE_CONFIGURED){
    existing = { id:'local-'+code, page, code, clicks:0 };
    myShareLinks.push(existing);
    return existing;
  }
  try{
    const { data, error } = await supabaseClient.rpc('create_share_link', { p_session_token: appUser.sessionToken, p_page: page, p_code: code });
    if(error){ console.error('Error creating share link:', error); return { id:null, page, code, clicks:0 }; }
    existing = { id:data, page, code, clicks:0 };
    myShareLinks.push(existing);
    return existing;
  } catch(err){
    console.error('Could not reach Supabase to create share link:', err);
    existing = { id:'local-'+code, page, code, clicks:0 };
    myShareLinks.push(existing);
    return existing;
  }
}

async function openSharePanel(page){
  requireSignIn(async ()=>{
    const link = await getOrCreateShareLink(page);
    const url = `${baseShareUrl()}?ref=${link.code}&page=${page}`;
    document.getElementById('shareLinkInput').value = url;
    document.getElementById('btnShareWhatsapp').href = `https://wa.me/?text=${encodeURIComponent(url)}`;
    document.getElementById('sharePanel').style.display = 'flex';
    renderProfile();
  });
}

/* A listing's share link is just a permalink (?listing=<id>) — no sign-in
   needed, unlike the profile-linked page shares above, since anyone
   should be able to pass along a specific room without an account. */
function openListingSharePanel(listingId){
  if(!listingId) return;
  const url = `${baseShareUrl()}?listing=${encodeURIComponent(listingId)}`;
  document.getElementById('shareLinkInput').value = url;
  document.getElementById('btnShareWhatsapp').href = `https://wa.me/?text=${encodeURIComponent(url)}`;
  document.getElementById('sharePanel').style.display = 'flex';
}

/* Jumps straight to a listing that was opened via a ?listing=<id> link —
   same idea as tapping a shared TikTok link and landing on that exact video. */
function openDeepLinkedListing(){
  const listingId = new URLSearchParams(window.location.search).get('listing');
  if(!listingId) return;
  setTab('housing');
  const card = document.querySelector('.feed-card[data-listing-id="'+CSS.escape(listingId)+'"]');
  if(card) scrollCardIntoFeed(card, false);
}

/* Same no-sign-in permalink pattern as openListingSharePanel, but for a
   profile — this is what makes "Share my rank" land a friend on the
   exact profile rather than just the general leaderboard. */
function openProfileSharePanel(userId){
  if(!userId) return;
  const url = `${baseShareUrl()}?profile=${encodeURIComponent(userId)}`;
  document.getElementById('shareLinkInput').value = url;
  document.getElementById('btnShareWhatsapp').href = `https://wa.me/?text=${encodeURIComponent(url)}`;
  document.getElementById('sharePanel').style.display = 'flex';
}

function openDeepLinkedProfile(){
  const userId = new URLSearchParams(window.location.search).get('profile');
  if(!userId) return;
  showPublicProfile(userId);
}

async function trackIncomingShareCode(){
  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref');
  if(!code || !SUPABASE_CONFIGURED) return;
  try{
    const { data } = await supabaseClient.from('share_links').select('id').eq('code', code).limit(1);
    if(data && data.length){
      await supabaseClient.from('share_clicks').insert([{ share_link_id: data[0].id }]);
    }
  } catch(err){
    console.error('Could not record share click:', err);
  }
}

/* ============================= Buddies ============================= */
function renderBuddies(){
  const wrap = document.getElementById('buddyList');
  if(!buddies.length){
    wrap.innerHTML = `<p style="text-align:center;color:var(--ink-faint);font-size:13px;padding:20px 0;">${t('noBuddiesYet')}</p>`;
    return;
  }
  const helpKeyMap = {Housing:'helpHousing', Paperwork:'helpPaperwork', Orientation:'helpOrientation'};
  wrap.innerHTML = buddies.map(b=>`
    <div class="buddy-card">
      <div class="buddy-top"><h3>${escapeHtml(b.name)}</h3></div>
      <div class="tag-row">${(b.help||[]).map(h=>`<span class="tag">${escapeHtml(t(helpKeyMap[h]||h))}</span>`).join('')}</div>
      <p class="buddy-desc">${escapeHtml(b.bio)}</p>
      <a class="wa-btn" href="https://wa.me/${waDigits(b.wa)}" target="_blank" rel="noopener">${waIconSvg}${t('contactWA')}</a>
      ${appUser && b.userId === appUser.id ? `<button class="buddy-remove" data-delete-buddy>${trashIconSvg}${t('removeBuddyProfile')}</button>` : ''}
    </div>
  `).join('');
  wrap.querySelectorAll('[data-delete-buddy]').forEach(btn=> btn.addEventListener('click', deleteBuddyProfile));
}

async function fetchAndRenderBuddies(){
  if(!SUPABASE_CONFIGURED){ renderBuddies(); return; }
  try{
    const { data, error } = await supabaseClient.from('buddies').select('*, app_users(name)').order('created_at', { ascending:false });
    if(error){ console.error('Error loading buddies:', error); renderBuddies(); return; }
    buddies = data.map(b=>({ userId: b.user_id, name: (b.app_users && b.app_users.name) || 'Buddy', help: b.help_areas || [], bio: b.bio, wa: b.whatsapp }));
    renderBuddies();
  } catch(err){
    console.error('Could not reach Supabase for buddies, showing local data instead:', err);
    renderBuddies();
  }
}

async function submitBuddy(){
  const help = [...document.querySelectorAll('.buddy-help:checked')].map(c=>c.value);
  const bio = document.getElementById('buddy-bio').value.trim() || '—';
  const waInput = document.getElementById('buddy-wa');
  const wa = waDigits(waInput.value);
  if(!help.length){ return; }
  // The card's only contact is WhatsApp; an empty field used to save a made-up number.
  if(!waLooksValid(wa)){ flagWaInput(waInput); return; }

  requireSignIn(async ()=>{
    if(!SUPABASE_CONFIGURED){
      buddies.unshift({ userId: appUser.id, name: appUser.name, help, bio, wa });
      document.getElementById('buddyForm').style.display = 'none';
      renderBuddies();
      return;
    }
    try{
      const { error } = await supabaseClient.rpc('create_buddy', { p_session_token: appUser.sessionToken, p_help_areas: help, p_bio: bio, p_whatsapp: wa });
      if(error){ console.error('Error publishing buddy profile:', error); return; }
      document.getElementById('buddyForm').style.display = 'none';
      await fetchAndRenderBuddies();
    } catch(err){
      console.error('Could not reach Supabase to publish buddy profile:', err);
    }
  });
}

/* ============================= Leaderboard ============================= */
const LEADERBOARD_WEIGHTS = { votes: 3, replies: 1, buddy: 5 };
const TOP_HELPER_BADGE_COUNT = 3;
let leaderboardCache = []; // [{userId, name, replies, votes, isBuddy, score}], sorted best-first
let openToWorkMap = {}; // userId -> whatsapp number, only for opted-in members

function currentMonthLabel(){
  const months = {
    en:["January","February","March","April","May","June","July","August","September","October","November","December"],
    ar:["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
    ur:["جنوری","فروری","مارچ","اپریل","مئی","جون","جولائی","اگست","ستمبر","اکتوبر","نومبر","دسمبر"],
    hi:["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"],
    bn:["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"]
  };
  const now = new Date();
  return months[state.lang][now.getMonth()] + ' ' + now.getFullYear();
}

async function fetchLeaderboardData(){
  if(!SUPABASE_CONFIGURED){ leaderboardCache = []; openToWorkMap = {}; return; }
  try{
    const [{ data: components, error: compError }, { data: openRows, error: openError }] = await Promise.all([
      supabaseClient.from('leaderboard_components').select('*, app_users(name)'),
      supabaseClient.from('open_to_work_directory').select('*')
    ]);
    if(compError){ console.error('Error loading leaderboard:', compError); return; }
    if(openError){ console.error('Error loading open-to-work directory:', openError); }

    const buddyIds = new Set(buddies.map(b=>b.userId).filter(Boolean));
    openToWorkMap = {};
    (openRows||[]).forEach(r=>{ openToWorkMap[r.id] = r.employer_contact_whatsapp; });

    leaderboardCache = (components||[])
      .filter(c=> c.app_users) // the name join can miss if a poster account was deleted
      .map(c=>{
        const replies = c.reply_count_month || 0;
        const votes = c.vote_count_month || 0;
        const isBuddy = buddyIds.has(c.user_id);
        const score = votes*LEADERBOARD_WEIGHTS.votes + replies*LEADERBOARD_WEIGHTS.replies + (isBuddy ? LEADERBOARD_WEIGHTS.buddy : 0);
        return { userId: c.user_id, name: c.app_users.name || t('memberFallback'), replies, votes, isBuddy, score };
      })
      .filter(row=> row.score > 0)
      .sort((a,b)=> b.score - a.score);
  } catch(err){
    console.error('Could not reach Supabase to load the leaderboard:', err);
  }
}

function isTopHelper(userId){
  const idx = leaderboardCache.findIndex(r=> r.userId === userId);
  return idx > -1 && idx < TOP_HELPER_BADGE_COUNT;
}

function renderLeaderboard(){
  const list = document.getElementById('leaderboardList');
  if(!list) return;
  const monthLabel = document.getElementById('leaderboardMonthLabel');
  if(monthLabel) monthLabel.textContent = t('leaderboardMonthLabel') + ' ' + currentMonthLabel();

  const filter = state.lbFilter || 'all';
  const rows = filter==='open' ? leaderboardCache.filter(r=> openToWorkMap[r.userId]) : leaderboardCache;

  if(!rows.length){
    list.innerHTML = `<p style="text-align:center;color:var(--ink-faint);font-size:13px;padding:20px 0;">${t('noHelpersYet')}</p>`;
    return;
  }
  list.innerHTML = rows.map((r,i)=>`
    <div class="lb-row">
      <div class="lb-rank">${i+1}</div>
      <button class="lb-identity" data-view-profile="${escapeHtml(r.userId)}">
        <span class="lb-avatar">${escapeHtml(String(r.name||'?').charAt(0).toUpperCase())}</span>
        <span class="lb-name">${escapeHtml(r.name)}${i<TOP_HELPER_BADGE_COUNT?` <span class="lb-badge">${badgeIconSvg}</span>`:''}</span>
      </button>
      <div class="lb-stats">${r.replies} ${t('lbStatReplies')} · ${r.votes} ${t('lbStatVotes')}</div>
      ${openToWorkMap[r.userId] ? `<a class="wa-btn lb-contact" href="https://wa.me/${waDigits(openToWorkMap[r.userId])}" target="_blank" rel="noopener">${waIconSvg}</a>` : ''}
    </div>
  `).join('');

  list.querySelectorAll('[data-view-profile]').forEach(btn=>{
    btn.addEventListener('click', ()=> showPublicProfile(btn.getAttribute('data-view-profile')));
  });
}

/* ---- Employer opt-in ---- */
async function submitOpenToWorkToggle(enabled){
  requireSignIn(async ()=>{
    const waInput = document.getElementById('openToWorkWa');
    const wa = waInput ? waDigits(waInput.value) : '';
    const errEl = document.getElementById('openToWorkError');
    if(errEl) errEl.style.display = 'none';
    if(enabled && !waLooksValid(wa)){
      if(errEl){ errEl.textContent = t('waInvalid'); errEl.style.display = 'block'; }
      return;
    }

    if(!SUPABASE_CONFIGURED || String(appUser.id).startsWith('local-')){
      appUser.openToWork = enabled;
      appUser.employerContactWhatsapp = enabled ? wa : null;
      renderProfile();
      return;
    }
    try{
      const { error } = await supabaseClient.rpc('set_open_to_work', {
        p_session_token: appUser.sessionToken, p_enabled: enabled, p_whatsapp: enabled ? wa : null
      });
      if(error){
        console.error('Error updating open-to-work status:', error);
        if(errEl){ errEl.textContent = error.message; errEl.style.display = 'block'; }
        document.getElementById('openToWorkToggle').checked = !enabled;
        return;
      }
      appUser.openToWork = enabled;
      await fetchLeaderboardData();
      renderLeaderboard();
      renderProfile();
    } catch(err){
      console.error('Could not reach Supabase to update open-to-work status:', err);
    }
  });
}

/* ---- Full re-render ---- */
function renderAll(){
  applyI18n();
  populateFilterOptions();
  renderGuide();
  syncThemeToggles();
  renderListings();
  renderCatChips();
  renderForum();
  renderBuddies();
  renderProfile();
  renderWorkPage();
  syncWorkEntryPoints();
  syncQcStep2Copy(); // re-sync the composer's dynamic labels after a language switch
}

/* ============================= Events ============================= */
document.querySelectorAll('[data-theme-toggle]').forEach(btn=>{
  btn.addEventListener('click', ()=> applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
});
document.querySelectorAll('[data-lang-btn]').forEach(btn=>{
  btn.addEventListener('click', ()=> setLang(btn.getAttribute('data-lang-btn')));
});
document.querySelectorAll('[data-lang-select]').forEach(sel=>{
  sel.addEventListener('change', ()=> setLang(sel.value));
});
document.querySelectorAll('nav.tabbar button[data-tab]').forEach(btn=>{
  btn.addEventListener('click', ()=> setTab(btn.getAttribute('data-tab')));
});

/* ---- Quick composer: 2-step wizard reachable from any tab via the '+' nav button ---- */
let qcCategory = 'housing';
let qcStep = 1;

function setQuickComposerOpen(open){
  document.getElementById('quickComposer').classList.toggle('open', open);
  document.getElementById('quickComposerScrim').classList.toggle('open', open);
  if(open){ qcStep = 1; showQcStep(1); setQcCategory(qcCategory); }
}
document.getElementById('btnOpenPost').addEventListener('click', ()=>{
  closeFilters();
  setQuickComposerOpen(true);
});
document.getElementById('btnCloseQuickComposer').addEventListener('click', ()=> setQuickComposerOpen(false));
document.getElementById('quickComposerScrim').addEventListener('click', ()=> setQuickComposerOpen(false));
document.getElementById('btnQcBack').addEventListener('click', ()=> showQcStep(1));

function showQcStep(step){
  qcStep = step;
  document.getElementById('qcStep1').style.display = step===1 ? 'block' : 'none';
  document.getElementById('qcStep2').style.display = step===2 ? 'block' : 'none';
  document.getElementById('btnQcNext').style.display = step===1 ? 'flex' : 'none';
  document.getElementById('btnSubmitQuickPost').style.display = step===2 ? 'flex' : 'none';
}

function setQcCategory(cat){
  qcCategory = cat;
  document.querySelectorAll('#qcCatRow [data-qc-cat]').forEach(b=> b.classList.toggle('active', b.getAttribute('data-qc-cat')===cat));
}
document.querySelectorAll('#qcCatRow [data-qc-cat]').forEach(btn=>{
  btn.addEventListener('click', ()=> setQcCategory(btn.getAttribute('data-qc-cat')));
});

function syncQcStep2Copy(){
  const titleKey = qcCategory==='housing' ? 'qcOptHousingTitle' : qcCategory==='inquiry' ? 'qcOptInquiryTitle' : 'qcOptGuideTitle';
  document.getElementById('qcStep2Title').textContent = t(titleKey);
  document.getElementById('qcHousingFields').style.display = qcCategory==='housing' ? 'block' : 'none';
  document.getElementById('qcInquiryFields').style.display = qcCategory==='inquiry' ? 'block' : 'none';
  document.getElementById('qcGuideFields').style.display = qcCategory==='guide' ? 'block' : 'none';
}

document.getElementById('btnQcNext').addEventListener('click', ()=>{
  syncQcStep2Copy();
  showQcStep(2);
});

document.getElementById('qc-nat').addEventListener('change', e=>{
  document.getElementById('qcNatOtherField').style.display = e.target.value === 'other' ? '' : 'none';
});
document.getElementById('qcCityRow').addEventListener('click', e=>{
  const btn = e.target.closest('[data-qc-city]');
  if(!btn) return;
  document.getElementById('qcCityRow').setAttribute('data-selected', btn.getAttribute('data-qc-city'));
  document.querySelectorAll('#qcCityRow [data-qc-city]').forEach(b=> b.classList.toggle('active', b===btn));
});
document.getElementById('qcInquiryCatRow').addEventListener('click', e=>{
  const btn = e.target.closest('[data-qc-i-cat]');
  if(!btn) return;
  document.querySelectorAll('#qcInquiryCatRow [data-qc-i-cat]').forEach(b=> b.classList.toggle('active', b===btn));
});

/* The post-images bucket only takes JPEG/PNG/WebP/GIF up to 5 MB (schema.sql
   section 12), and phone cameras produce 3-8 MB photos or HEIC. Every photo is
   redrawn as a JPEG no wider/taller than 1600 px (usually 200-500 KB), which is
   what makes uploads fast on mobile data and keeps the PC's disk small. GIFs
   (may be animated) and photos the redraw doesn't shrink go up as they are; if
   the browser can't decode a photo, the original goes up and Storage decides. */
const MAX_ROOM_PHOTOS = 10; // create_listing in schema.sql refuses more than this
const MAX_VIDEO_MB = 50;    // listing-videos bucket limit, schema.sql section 12
const MAX_VIDEO_SECONDS = 60;
async function fitImageForUpload(file){
  const okTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const fitsBucket = okTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
  if(file.type === 'image/gif' && fitsBucket) return file;
  try{
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.82));
    if(!blob || (fitsBucket && blob.size >= file.size)) return file;
    return new File([blob], file.name.replace(/\.[^.]*$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch(err){
    return file;
  }
}

// Keep the room WhatsApp field to the 9 digits after +966 while typing or pasting.
document.getElementById('qc-wa').addEventListener('input', e=>{
  const cleaned = saudiMobileDigits(e.target.value);
  if(e.target.value !== cleaned) e.target.value = cleaned;
});

/* Room media is checked as soon as it's picked, so a too-big or too-long video is
   refused before anyone waits for it to upload. roomMediaCheck resolves to false
   once a picked video was refused: the next Publish tap only stops (so nobody
   posts a room without the video they meant to add); a tap after that posts
   without media. Picking files again starts over. */
let roomMediaCheck = Promise.resolve(true);
function showRoomMediaMessage(summary, error){
  const sumEl = document.getElementById('qcMediaSummary');
  const errEl = document.getElementById('qcMediaMsg');
  sumEl.textContent = summary; sumEl.style.display = summary ? 'block' : 'none';
  errEl.textContent = error; errEl.style.display = error ? 'block' : 'none';
}
function showPublishError(msg){
  const el = document.getElementById('qcPublishError');
  el.textContent = msg; el.style.display = msg ? 'block' : 'none';
}
function videoSeconds(file){
  return new Promise(resolve=>{
    const v = document.createElement('video');
    const url = URL.createObjectURL(file);
    const done = (sec)=>{ URL.revokeObjectURL(url); resolve(sec); };
    v.preload = 'metadata';
    v.onloadedmetadata = ()=> done(isFinite(v.duration) ? v.duration : null);
    v.onerror = ()=> done(null); // unknown length: let the size limit decide
    setTimeout(()=> done(null), 8000);
    v.src = url;
  });
}
document.getElementById('qc-video').addEventListener('change', e=>{
  const input = e.target;
  const files = Array.from(input.files || []);
  const video = files.find(f => !f.type.startsWith('image/'));
  showPublishError('');
  if(!files.length){ roomMediaCheck = Promise.resolve(true); showRoomMediaMessage('', ''); return; }
  if(!video){
    roomMediaCheck = Promise.resolve(true);
    const n = Math.min(files.length, MAX_ROOM_PHOTOS);
    showRoomMediaMessage(fmt('mediaPhotosPicked', { n }), files.length > MAX_ROOM_PHOTOS ? fmt('mediaTooManyPhotos', { n: files.length }) : '');
    return;
  }
  const mb = Math.max(0.1, Math.round(video.size / (1024 * 1024) * 10) / 10);
  if(mb > MAX_VIDEO_MB){
    input.value = '';
    roomMediaCheck = Promise.resolve(false);
    showRoomMediaMessage('', fmt('mediaVideoTooBig', { mb }));
    return;
  }
  roomMediaCheck = videoSeconds(video).then(sec=>{
    if(input.files[0] !== files[0]) return true; // picked something else meanwhile
    if(sec !== null && sec > MAX_VIDEO_SECONDS + 0.5){
      input.value = '';
      showRoomMediaMessage('', fmt('mediaVideoTooLong', { s: Math.round(sec) }));
      return false;
    }
    showRoomMediaMessage(fmt('mediaVideoPicked', { mb, s: sec === null ? '?' : Math.round(sec) }), '');
    return true;
  });
});

/* Uploads one file and returns its public URL, or null if it failed. */
async function uploadToBucket(bucket, file, tag){
  // The random part keeps names unguessable and unique; the database only accepts an upload
  // whose exact name request_upload handed out to a signed-in member (schema.sql, section 12).
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(6)), b=> b.toString(16).padStart(2,'0')).join('');
  const path = `${Date.now()}_${tag}_${rand}_${String(file.name || 'file').replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(-60)}`;
  const ticket = await supabaseClient.rpc('request_upload', { p_session_token: appUser && appUser.sessionToken, p_bucket: bucket, p_name: path });
  // PGRST202: the database doesn't have request_upload yet (schema.sql not run), so the
  // old upload rule still applies and the upload can go ahead without a ticket.
  if(ticket.error && ticket.error.code !== 'PGRST202'){ console.error('Upload refused for ' + bucket + ':', ticket.error); return null; }
  const { error } = await supabaseClient.storage.from(bucket).upload(path, file);
  if(error){ console.error('Error uploading to ' + bucket + ':', error); return null; }
  return supabaseClient.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function resetComposerFields(){
  document.getElementById('qc-text').value = '';
  document.getElementById('qc-image').value = '';
  document.getElementById('qc-rent').value = '';
  document.getElementById('qc-wa').value = '';
  document.getElementById('qc-video').value = '';
  document.getElementById('qc-i-text').value = '';
  document.getElementById('qc-nat-other').value = '';
  document.getElementById('qcNatOtherField').style.display = 'none';
  document.getElementById('qcImageUploadStatus').style.display = 'none';
  document.getElementById('qcVideoUploadStatus').style.display = 'none';
  roomMediaCheck = Promise.resolve(true);
  showRoomMediaMessage('', '');
  showPublishError('');
  setQuickComposerOpen(false);
}

function setPostedTypeChip(postedCategory){
  state.filters.postType = postedCategory;
  document.querySelectorAll('#feedTypeChips [data-feed-type]').forEach(b=> b.classList.toggle('active', b.getAttribute('data-feed-type')===postedCategory));
}

document.getElementById('btnSubmitQuickPost').addEventListener('click', async ()=>{
  const category = qcCategory;

  if(category === 'inquiry'){
    const catBtn = document.querySelector('#qcInquiryCatRow .composer-chip.active');
    const category_i = catBtn ? catBtn.getAttribute('data-qc-i-cat') : 'General life';
    const question = document.getElementById('qc-i-text').value.trim();
    if(!question){ document.getElementById('qc-i-text').focus(); return; }
    requireSignIn(async ()=>{
      if(!SUPABASE_CONFIGURED){
        forumPosts.unshift({ cat: category_i, q: question, by: appUser.name, votes: 0, replies: [] });
        resetComposerFields();
        state.forumCat = 'All'; renderCatChips();
        renderForum();
        return;
      }
      try{
        const { error } = await supabaseClient.rpc('create_forum_post', { p_session_token: appUser.sessionToken, p_category: category_i, p_question: question });
        if(error){ console.error('Error posting question:', error); return; }
        resetComposerFields();
        state.forumCat = 'All'; renderCatChips();
        await fetchAndRenderForum();
      } catch(err){
        console.error('Could not reach Supabase to post question:', err);
      }
    });
    return;
  }

  const isHousing = category === 'housing';
  const text = isHousing ? '' : document.getElementById('qc-text').value.trim();
  const imageFile = document.getElementById('qc-image').files[0];

  if(!isHousing && !text){ document.getElementById('qc-text').focus(); return; }

  const cityRow = document.getElementById('qcCityRow');
  const city = cityRow.getAttribute('data-selected') || CITY_KEYS[0];
  const rent = parseInt(document.getElementById('qc-rent').value) || 0;
  const room_type = document.getElementById('qc-roomtype').value;
  const gender_pref = document.getElementById('qc-gender').value;
  const natValue = document.getElementById('qc-nat').value;
  const nationality_pref = natValue === 'all' ? 'Any'
    : natValue === 'other' ? (document.getElementById('qc-nat-other').value.trim() || t('natOther'))
    : natValue;
  const bills_included = document.getElementById('qc-bills').checked;
  // Room posts take a Saudi mobile only: the field shows +966 and holds the 9 digits after it.
  const waLocal = saudiMobileDigits(document.getElementById('qc-wa').value);
  const whatsapp = waLocal ? '966' + waLocal : '';
  // The room field takes up to 10 photos or one video. Photos go to the same bucket
  // (post-images) that tips posts use; a video keeps listing-videos. If a video is
  // among the picked files, that video is used and the photos are left out.
  const roomFiles = Array.from(document.getElementById('qc-video').files || []);
  const videoFile = roomFiles.find(f => !f.type.startsWith('image/')) || null;
  const roomImageFiles = videoFile ? [] : roomFiles.slice(0, MAX_ROOM_PHOTOS);

  if(isHousing && !rent){ document.getElementById('qc-rent').focus(); return; }
  if(isHousing && !whatsapp){ document.getElementById('qc-wa').focus(); return; }
  if(isHousing && !/^5\d{8}$/.test(waLocal)){ flagWaInput(document.getElementById('qc-wa'), 'waSaudiInvalid'); return; }
  if(isHousing && !(await roomMediaCheck)){ roomMediaCheck = Promise.resolve(true); return; } // message is under the field

  requireSignIn(async ()=>{
    const postedCategory = category;
    const submitBtn = document.getElementById('btnSubmitQuickPost');
    if(submitBtn.disabled) return; // already publishing — a second tap must not post twice
    submitBtn.disabled = true;
    showPublishError('');
    try {
      if (!SUPABASE_CONFIGURED) {
        const localImageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
        const localVideoUrl = videoFile ? URL.createObjectURL(videoFile) : null;
        const localRoomImageUrls = roomImageFiles.map(f => URL.createObjectURL(f));
        listings.unshift(isHousing
          ? { id:'local-'+Date.now(), posterUserId: appUser.id, postType: 'housing', city, rent, type: room_type, gender: gender_pref, nat: nationality_pref, bills: bills_included, desc: text || '—', by: appUser.name, wa: whatsapp, video: localVideoUrl, media: localRoomImageUrls[0] || null, mediaList: localRoomImageUrls }
          : { id:'local-'+Date.now(), posterUserId: appUser.id, postType: postedCategory, desc: text, by: appUser.name, media: localImageUrl });
        resetComposerFields();
        setPostedTypeChip(postedCategory);
        renderListings();
        return;
      }

      try {
        let row;
        if (isHousing) {
          let video_url = null;
          const room_media_urls = [];
          const statusEl = document.getElementById('qcVideoUploadStatus');
          if (videoFile) {
            statusEl.textContent = t('uploadingVideo');
            statusEl.style.display = 'block';
            video_url = await uploadToBucket('listing-videos', videoFile, 'v');
            statusEl.style.display = 'none';
            if (!video_url) { showPublishError(t('uploadFailed')); return; }
          }
          if (roomImageFiles.length) {
            // Three at a time: much faster than one by one, without flooding a slow connection.
            // Each photo keeps its slot, so the gallery order matches the order picked.
            const urls = new Array(roomImageFiles.length).fill(null);
            let done = 0, nextIdx = 0;
            const showProgress = ()=>{ statusEl.textContent = fmt('uploadingPhotosProgress', { done, total: roomImageFiles.length }); };
            showProgress(); statusEl.style.display = 'block';
            const worker = async ()=>{
              while (nextIdx < roomImageFiles.length) {
                const n = nextIdx++;
                const photo = await fitImageForUpload(roomImageFiles[n]);
                urls[n] = await uploadToBucket('post-images', photo, n);
                done++; showProgress();
              }
            };
            await Promise.all([worker(), worker(), worker()]);
            statusEl.style.display = 'none';
            if (urls.some(u => !u)) { showPublishError(t('uploadFailed')); return; }
            room_media_urls.push(...urls);
          }
          row = {
            p_post_type: 'housing', p_city: city, p_rent: rent, p_room_type: room_type, p_gender_pref: gender_pref,
            p_nationality_pref: nationality_pref, p_bills_included: bills_included,
            p_description: text || '—', p_whatsapp: whatsapp, p_video_url: video_url, p_media_url: room_media_urls[0] || null
          };
          // Only sent with 2+ photos, so one-photo and video rooms work even before
          // schema.sql adds p_media_urls (see the fallback below).
          if (room_media_urls.length > 1) row.p_media_urls = room_media_urls;
        } else {
          let media_url = null;
          if (imageFile) {
            const statusEl = document.getElementById('qcImageUploadStatus');
            statusEl.style.display = 'block';
            media_url = await uploadToBucket('post-images', await fitImageForUpload(imageFile), 't');
            statusEl.style.display = 'none';
            if (!media_url) { showPublishError(t('uploadFailed')); return; }
          }
          row = { p_post_type: postedCategory, p_description: text, p_media_url: media_url };
        }

        // The server fills in poster_user_id / poster_role from the session token.
        let { error } = await supabaseClient.rpc('create_listing', { p_session_token: appUser.sessionToken, ...row });
        // A database that hasn't run the multi-photo schema.sql yet doesn't know
        // p_media_urls (PGRST202). Publish with the first photo rather than not at all.
        if (error && error.code === 'PGRST202' && row.p_media_urls) {
          console.warn('Sanad: create_listing has no p_media_urls yet — run schema.sql. Publishing with the first photo only.');
          delete row.p_media_urls;
          ({ error } = await supabaseClient.rpc('create_listing', { p_session_token: appUser.sessionToken, ...row }));
        }

        if (error) {
          console.error('Error publishing post:', error);
          showPublishError(t('publishFailed'));
          return;
        }

        resetComposerFields();
        setPostedTypeChip(postedCategory);
        await fetchAndRenderListings();
      } catch (err) {
        console.error('Could not reach Supabase to publish post:', err);
        showPublishError(t('publishFailed'));
      }
    } finally {
      submitBtn.disabled = false;
    }
  });
});

/* ---- Filter bottom sheet ---- */
function setFiltersOpen(open){
  const sheet = document.getElementById('filterSheet');
  const btn = document.getElementById('btnChipFilter');
  if(!sheet) return;
  sheet.classList.toggle('open', open);
  if(btn) btn.setAttribute('aria-expanded', String(open));
  // Only a modal dialog while it's actually a sheet — on desktop it's a static panel.
  const box = sheet.querySelector('.filter-bar');
  if(open){ box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); }
  else{ box.removeAttribute('role'); box.removeAttribute('aria-modal'); }
  if(open) updateFilterUI();
}
function closeFilters(){ setFiltersOpen(false); }

function resetFilters(){
  state.filters = {postType:state.filters.postType, city:'all', budget:'all', nat:'all', gender:'all', roomType:'all'};
  populateFilterOptions();
  renderListings();
}

document.querySelectorAll('[data-close-filters]').forEach(el=>{
  el.addEventListener('click', closeFilters);
});
document.getElementById('btnResetFilters').addEventListener('click', resetFilters);
document.addEventListener('keydown', e=>{
  if(e.key !== 'Escape') return;
  closeFilters();
  setQuickComposerOpen(false);
});
document.getElementById('btnOpenBuddy').addEventListener('click', ()=>{
  const p = document.getElementById('buddyForm');
  p.style.display = p.style.display==='none' ? 'block' : 'none';
});

/* Delegated: every button inside a [data-filter-group] wrapper sets that
   one state.filters key and toggles .active within its own group only. */
document.getElementById('filterSheet').addEventListener('click', e=>{
  const btn = e.target.closest('[data-filter-value]');
  if(!btn) return;
  const groupEl = btn.closest('[data-filter-group]');
  if(!groupEl) return;
  const group = groupEl.getAttribute('data-filter-group');
  state.filters[group] = btn.getAttribute('data-filter-value');
  groupEl.querySelectorAll('[data-filter-value]').forEach(b=> b.classList.toggle('active', b===btn));
  renderListings();
});

/* ---- Sign-in modal (email code) ---- */
document.getElementById('btnProfileSignIn').addEventListener('click', ()=> openSignIn());
document.getElementById('btnSendCode').addEventListener('click', sendCode);
document.getElementById('btnVerifyCode').addEventListener('click', verifyCode);
document.getElementById('btnResendCode').addEventListener('click', resendCode);
document.getElementById('btnChangeEmail').addEventListener('click', ()=> setAuthStep('email'));
document.getElementById('btnSaveName').addEventListener('click', saveName);
document.getElementById('btnUseUsername').addEventListener('click', ()=> setAuthStep('legacy'));
document.getElementById('btnUseEmail').addEventListener('click', ()=> setAuthStep('email'));
document.getElementById('btnSignInSubmit').addEventListener('click', submitSignIn);
[['si-email', sendCode], ['si-code', verifyCode], ['si-name', saveName], ['si-password', submitSignIn]].forEach(([id, fn])=>{
  document.getElementById(id).addEventListener('keydown', e=>{ if(e.key==='Enter') fn(); });
});
document.getElementById('btnSignInCancel').addEventListener('click', closeSignIn);
document.getElementById('btnSignOut').addEventListener('click', signOut);
document.getElementById('btnPublicProfileBack').addEventListener('click', ()=> setTab('housing'));

/* ---- Guest profile shortcuts ---- */
document.getElementById('btnGuestLiked').addEventListener('click', ()=>{
  const grid = document.getElementById('guestLikedGrid');
  const open = grid.style.display === 'none';
  grid.style.display = open ? 'grid' : 'none';
  if(open) renderGuestGrids();
});
document.getElementById('btnGuestSaved').addEventListener('click', ()=>{
  const grid = document.getElementById('guestSavedGrid');
  const open = grid.style.display === 'none';
  grid.style.display = open ? 'grid' : 'none';
  if(open) renderGuestGrids();
});
document.getElementById('btnGuestLanguage').addEventListener('click', ()=>{
  const row = document.getElementById('guestLanguageRow');
  row.style.display = row.style.display === 'none' ? 'flex' : 'none';
});

/* ---- Open-to-work opt-in ---- */
document.getElementById('openToWorkToggle').addEventListener('change', (e)=>{
  const enabled = e.target.checked;
  document.getElementById('openToWorkWaField').style.display = enabled ? 'block' : 'none';
  if(!enabled) submitOpenToWorkToggle(false);
});
document.getElementById('btnSaveOpenToWork').addEventListener('click', ()=> submitOpenToWorkToggle(true));

/* ---- Share panel ---- */
document.querySelectorAll('[data-share-page]').forEach(btn=>{
  btn.addEventListener('click', ()=> openSharePanel(btn.getAttribute('data-share-page')));
});
document.getElementById('btnShareClose').addEventListener('click', ()=>{
  document.getElementById('sharePanel').style.display = 'none';
});
document.getElementById('btnCopyShareLink').addEventListener('click', ()=>{
  const input = document.getElementById('shareLinkInput');
  input.select();
  navigator.clipboard?.writeText(input.value).catch(()=>{});
  const btn = document.getElementById('btnCopyShareLink');
  const original = btn.textContent;
  btn.textContent = t('linkCopied');
  setTimeout(()=>{ btn.textContent = original; }, 1800);
});

/* ---- Community sub-tabs (Q&A / Buddies / Top Helpers) ---- */
document.querySelectorAll('[data-subtab]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    state.communitySubTab = btn.getAttribute('data-subtab');
    document.querySelectorAll('[data-subtab]').forEach(b=>b.classList.toggle('active', b===btn));
    document.getElementById('communityQA').style.display = state.communitySubTab==='qa' ? 'block' : 'none';
    document.getElementById('communityBuddies').style.display = state.communitySubTab==='buddies' ? 'block' : 'none';
    document.getElementById('communityLeaderboard').style.display = state.communitySubTab==='leaderboard' ? 'block' : 'none';
    applyFeedMode();
    if(state.communitySubTab==='qa') fitCommunityFeed();
    if(state.communitySubTab==='leaderboard') renderLeaderboard();
  });
});

document.querySelectorAll('[data-lb-filter]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    state.lbFilter = btn.getAttribute('data-lb-filter');
    document.querySelectorAll('[data-lb-filter]').forEach(b=> b.classList.toggle('active', b===btn));
    renderLeaderboard();
  });
});

document.getElementById('btnSubmitBuddy').addEventListener('click', submitBuddy);

document.querySelectorAll('#feedTypeChips [data-feed-type]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    state.filters.postType = btn.getAttribute('data-feed-type');
    document.querySelectorAll('#feedTypeChips [data-feed-type]').forEach(b=> b.classList.toggle('active', b===btn));
    renderListings();
  });
});
document.getElementById('btnChipFilter').addEventListener('click', ()=>{
  const open = !document.getElementById('filterSheet').classList.contains('open');
  setFiltersOpen(open);
  if(open){ setQuickComposerOpen(false); }
});

/* ============================= Initial load ============================= */
async function initApp(){
  restoreAppUser();
  state.feedLikes = loadIdSet(LIKED_STORAGE_KEY);
  state.feedSaves = loadIdSet(SAVED_STORAGE_KEY);

  // A session saved before session tokens existed, or rotated by a fresh
  // login elsewhere, can't be verified server-side — treat it as signed out
  // rather than routing a not-really-authenticated user past a stale state.
  if(appUser && SUPABASE_CONFIGURED && !String(appUser.id).startsWith('local-') && !appUser.sessionToken){
    appUser = null;
    persistAppUser();
  }

  // A shared link to the work page (…/#work) opens on that page; everything else starts on the Feed.
  const landedOnWork = location.hash === WORK_HASH;
  setTab(landedOnWork ? 'work' : 'housing'); // the Feed is the whole app's landing screen — there's no Home anymore
  renderAll();
  applyFeedMode();
  if(!landedOnWork) setTimeout(maybeShowWelcome, 700);
  await trackIncomingShareCode();
  await Promise.all([fetchAndRenderListings(), fetchAndRenderForum(), fetchAndRenderBuddies(), validateStoredSession()]);
  // Depends on buddies (isBuddy bonus) being loaded above, so it runs after.
  await fetchLeaderboardData();
  renderLeaderboard();
  renderProfile();
  if(appUser){ await Promise.all([fetchAndRenderShareLinks(), fetchAndRenderProfileStats()]); }
  openDeepLinkedListing();
  openDeepLinkedProfile();
}

initApp();
