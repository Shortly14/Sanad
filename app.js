/* ============================= Supabase ============================= */
// Replace with your project details from Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = "https://api.thesannad.com";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzkwNDU0MTM0LCJleHAiOjE5NDgxMzQxMzR9.8O74oaHNmyzsZz2i4md35He-E3TODOFPOi4hk3j4uK0";

// True once you swap in your real project URL/key. Until then the app runs
// on local in-memory data only, so every button still works — it just won't
// save anywhere or sync between visitors.
const SUPABASE_CONFIGURED = !SUPABASE_URL.includes("YOUR_PROJECT_ID") && !SUPABASE_ANON_KEY.includes("YOUR_ANON_PUBLIC_KEY");

const supabaseClient = SUPABASE_CONFIGURED ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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
  lblWhatsapp:"WhatsApp number",
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
  videoLabel:"Room video (optional)", videoHint:"A short walkthrough gets far more replies than photos alone.", uploadingVideo:"Uploading video...",
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
  soundTicker:"Original sound · Sanad Housing", likeLabel:"Like", saveLabel:"Save",
  statMyListings:"Listings", statMyQuestions:"Questions", statMyClicks:"Link clicks",
  tabMyPosts:"Posts", tabLiked:"Liked", memberSince:"Member since",
  noPostsYet:"No listings posted yet", noLikedYet:"Rooms you like will show up here", noSavedYet:"Things you save will show up here",
  backBtn:"Back", loadingProfile:"Loading…", publicProfileUnavailable:"Profile not available",
  communityTabLeaderboard:"Top Helpers", leaderboardMonthLabel:"Top Helpers —",
  lbFilterAll:"Everyone", lbFilterOpenToWork:"Open to work", lbStatReplies:"replies", lbStatVotes:"upvotes",
  noHelpersYet:"No one's earned this yet this month — answer a question to be the first!",
  badgeTopHelper:"Top Helper this month", shareMyRank:"Share my rank",
  openToWorkToggleLabel:"Visible to employers looking to hire",
  openToWorkHint:"Turning this on shows your name and lets employers message you on WhatsApp from the Top Helpers list.",
  openToWorkWhatsappLabel:"WhatsApp number to show employers", saveBtn:"Save",
  composerNewPost:"New post",
  qcStep1Title:"What do you want to post?", qcStep1Sub:"Pick one — you can change your mind anytime before you submit.",
  qcOptHousingTitle:"Room or bed space", qcOptHousingSub:"You have a spare space and need a tenant",
  qcOptInquiryTitle:"Question", qcOptInquirySub:"Get an answer from people who've done it",
  qcOptGuideTitle:"Tip", qcOptGuideSub:"Something you learned that could help others",
  qcAdvancedToggle:"Add more details (optional)", qcNext:"Next", qcPublish:"Publish", sarLabel:"SAR",
  guestSavedLabel:"Saved", guestLanguageLabel:"Language", guestLanguageValue:"العربية · English · اردو",
  likedCountLabel:"{n} liked on this phone", savedCountLabel:"{n} saved on this phone",
  signInBtnShort:"Log in / Sign up",
  authErrorInvalid:"Wrong username or password.", authErrorTooMany:"Too many wrong attempts. Wait 15 minutes and try again.", authErrorMissing:"Enter a username and password.", authErrorNetwork:"Couldn't reach the server — try again.", authErrorShort:"Password must be at least 6 characters.", authErrorTaken:"That username is already taken.", loginHint:"Log in with your username and password.", loginTabLabel:"Log in", signInSubmit:"Log in", signupHint:"Pick a username and password — that's all you need.", signupTabLabel:"Sign up",
  lblUsername:"Username", lblPassword:"Password",
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
  lblWhatsapp:"رقم واتساب",
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
  videoLabel:"فيديو الغرفة (اختياري)", videoHint:"جولة قصيرة بالفيديو تحصل على ردود أكثر بكثير من الصور فقط.", uploadingVideo:"جارٍ رفع الفيديو...",
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
  soundTicker:"صوت أصلي · سند للإسكان", likeLabel:"إعجاب", saveLabel:"احفظ",
  statMyListings:"الإعلانات", statMyQuestions:"الأسئلة", statMyClicks:"نقرات الروابط",
  tabMyPosts:"إعلاناتي", tabLiked:"أعجبني", memberSince:"عضو منذ",
  noPostsYet:"لم تنشر أي إعلان بعد", noLikedYet:"الغرف التي تعجبك ستظهر هنا", noSavedYet:"الأشياء التي تحفظها ستظهر هنا",
  backBtn:"رجوع", loadingProfile:"جارٍ التحميل…", publicProfileUnavailable:"الملف الشخصي غير متاح",
  communityTabLeaderboard:"الأكثر مساعدة", leaderboardMonthLabel:"الأكثر مساعدة —",
  lbFilterAll:"الجميع", lbFilterOpenToWork:"متاح للعمل", lbStatReplies:"ردود", lbStatVotes:"إعجابات",
  noHelpersYet:"لم يحقق أحد هذا بعد هذا الشهر — أجب عن سؤال لتكون الأول!",
  badgeTopHelper:"الأكثر مساعدة هذا الشهر", shareMyRank:"شارك ترتيبي",
  openToWorkToggleLabel:"مرئي لأصحاب العمل الباحثين عن موظفين",
  openToWorkHint:"تفعيل هذا يُظهر اسمك ويسمح لأصحاب العمل بمراسلتك عبر واتساب من قائمة الأكثر مساعدة.",
  openToWorkWhatsappLabel:"رقم واتساب لعرضه على أصحاب العمل", saveBtn:"حفظ",
  composerNewPost:"منشور جديد",
  qcStep1Title:"وش تبغى تنشر؟", qcStep1Sub:"اختر واحد. تقدر ترجع وتغيّر رأيك في أي وقت قبل النشر.",
  qcOptHousingTitle:"غرفة أو سرير", qcOptHousingSub:"عندك مكان فاضي وتبغى ساكن",
  qcOptInquiryTitle:"سؤال", qcOptInquirySub:"احصل على إجابة من ناس جربوا قبلك",
  qcOptGuideTitle:"نصيحة", qcOptGuideSub:"شي تعلمته وتبغى غيرك يستفيد منه",
  qcAdvancedToggle:"أضف تفاصيل إضافية (اختياري)", qcNext:"التالي", qcPublish:"انشر الآن", sarLabel:"ريال",
  guestSavedLabel:"المحفوظات", guestLanguageLabel:"اللغة", guestLanguageValue:"العربية · English · اردو",
  likedCountLabel:"{n} إعجاب على هذا الجهاز", savedCountLabel:"{n} محفوظ على هذا الجهاز",
  signInBtnShort:"تسجيل الدخول / إنشاء حساب",
  authErrorInvalid:"اسم المستخدم أو كلمة المرور غير صحيحة.", authErrorTooMany:"محاولات خاطئة كثيرة. انتظر ١٥ دقيقة ثم حاول مرة أخرى.", authErrorMissing:"أدخل اسم المستخدم وكلمة المرور.", authErrorNetwork:"تعذر الوصول إلى الخادم — حاول مرة أخرى.", authErrorShort:"يجب أن تتكون كلمة المرور من ٦ أحرف على الأقل.", authErrorTaken:"اسم المستخدم هذا مُستخدم بالفعل.", loginHint:"سجّل الدخول باسم المستخدم وكلمة المرور.", loginTabLabel:"تسجيل الدخول", signInSubmit:"تسجيل الدخول", signupHint:"اختر اسم مستخدم وكلمة مرور — هذا كل ما تحتاجه.", signupTabLabel:"إنشاء حساب",
  lblUsername:"اسم المستخدم", lblPassword:"كلمة المرور",
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
  lblWhatsapp:"واٹس ایپ نمبر",
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
  videoLabel:"کمرے کی ویڈیو (اختیاری)", videoHint:"ایک مختصر ویڈیو صرف تصاویر کے مقابلے میں کہیں زیادہ جوابات لاتی ہے۔", uploadingVideo:"ویڈیو اپ لوڈ ہو رہی ہے...",
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
  soundTicker:"اصل آواز · سند ہاؤسنگ", likeLabel:"پسند", saveLabel:"محفوظ کریں",
  statMyListings:"لسٹنگز", statMyQuestions:"سوالات", statMyClicks:"لنک کلکس",
  tabMyPosts:"پوسٹس", tabLiked:"پسندیدہ", memberSince:"رکن بننے کی تاریخ",
  noPostsYet:"ابھی تک کوئی لسٹنگ پوسٹ نہیں کی گئی", noLikedYet:"آپ کے پسندیدہ کمرے یہاں نظر آئیں گے", noSavedYet:"آپ کی محفوظ کردہ چیزیں یہاں نظر آئیں گی",
  backBtn:"واپس", loadingProfile:"لوڈ ہو رہا ہے…", publicProfileUnavailable:"پروفائل دستیاب نہیں",
  communityTabLeaderboard:"ٹاپ ہیلپرز", leaderboardMonthLabel:"ٹاپ ہیلپرز —",
  lbFilterAll:"سب", lbFilterOpenToWork:"کام کے لیے دستیاب", lbStatReplies:"جوابات", lbStatVotes:"اپووٹس",
  noHelpersYet:"اس مہینے ابھی تک کسی نے یہ حاصل نہیں کیا — پہلا بننے کے لیے کسی سوال کا جواب دیں!",
  badgeTopHelper:"اس مہینے کا ٹاپ ہیلپر", shareMyRank:"میری رینک شیئر کریں",
  openToWorkToggleLabel:"ملازمت دینے والوں کو نظر آئیں",
  openToWorkHint:"اسے آن کرنے سے آپ کا نام نظر آئے گا اور آجر ٹاپ ہیلپرز لسٹ سے آپ کو واٹس ایپ پر پیغام بھیج سکیں گے۔",
  openToWorkWhatsappLabel:"آجروں کو دکھانے کے لیے واٹس ایپ نمبر", saveBtn:"محفوظ کریں",
  composerNewPost:"نئی پوسٹ",
  qcStep1Title:"آپ کیا پوسٹ کرنا چاہتے ہیں؟", qcStep1Sub:"ایک منتخب کریں — جمع کرانے سے پہلے کسی بھی وقت بدل سکتے ہیں۔",
  qcOptHousingTitle:"کمرہ یا بیڈ اسپیس", qcOptHousingSub:"آپ کے پاس خالی جگہ ہے اور کرایہ دار چاہیے",
  qcOptInquiryTitle:"سوال", qcOptInquirySub:"تجربہ کار لوگوں سے جواب حاصل کریں",
  qcOptGuideTitle:"تجویز", qcOptGuideSub:"کچھ سیکھا جو دوسروں کے کام آ سکتا ہے",
  qcAdvancedToggle:"مزید تفصیلات شامل کریں (اختیاری)", qcNext:"اگلا", qcPublish:"شائع کریں", sarLabel:"SAR",
  guestSavedLabel:"محفوظ شدہ", guestLanguageLabel:"زبان", guestLanguageValue:"العربية · English · اردو",
  likedCountLabel:"اس فون پر {n} پسند", savedCountLabel:"اس فون پر {n} محفوظ",
  signInBtnShort:"لاگ ان / اکاؤنٹ بنائیں",
  authErrorInvalid:"غلط یوزرنیم یا پاس ورڈ۔", authErrorTooMany:"بہت زیادہ غلط کوششیں۔ ۱۵ منٹ انتظار کریں اور دوبارہ کوشش کریں۔", authErrorMissing:"یوزرنیم اور پاس ورڈ درج کریں۔", authErrorNetwork:"سرور تک رسائی نہیں ہو سکی — دوبارہ کوشش کریں۔", authErrorShort:"پاس ورڈ کم از کم ۶ حروف کا ہونا چاہیے۔", authErrorTaken:"یہ یوزرنیم پہلے سے لیا جا چکا ہے۔", loginHint:"اپنے یوزرنیم اور پاس ورڈ سے لاگ ان کریں۔", loginTabLabel:"لاگ ان", signInSubmit:"لاگ ان", signupHint:"ایک یوزرنیم اور پاس ورڈ منتخب کریں — بس اتنا ہی چاہیے۔", signupTabLabel:"اکاؤنٹ بنائیں",
  lblUsername:"یوزرنیم", lblPassword:"پاس ورڈ",
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
]
};

/* ============================= Housing listings ============================= */
/* Placeholder data shown briefly while the real rows load from Supabase (see fetchAndRenderListings). */
let listings = [
 {id:"demo-1", city:"Riyadh", rent:550, type:"shared", gender:"male", nat:"Any", bills:true,
  desc:"3-bedroom flat near Olaya, 15 min walk to metro. 2 flatmates already, both Pakistani. Kitchen shared, AC in every room.",
  by:"Owner", wa:"966501234567"},
 {id:"demo-2", city:"Jeddah", rent:700, type:"private", gender:"any", nat:"Filipino", bills:false,
  desc:"Private room in Al Rawdah, close to Corniche. Bills split evenly between 4 tenants. Prefer Filipino or Southeast Asian tenant.",
  by:"Tenant", wa:"966502345678"},
 {id:"demo-3", city:"Dammam/Khobar", rent:450, type:"bed", gender:"male", nat:"Indian", bills:true,
  desc:"Bed space in shared labor accommodation near Khobar Corniche, 6 beds total, cleaning rota in place, water and electricity included.",
  by:"Tenant", wa:"966503456789"},
 {id:"demo-4", city:"Makkah", rent:900, type:"private", gender:"female", nat:"Arab", bills:true,
  desc:"Furnished private room for a working woman, close to Haram bus route. Quiet building, Arabic-speaking flatmates preferred.",
  by:"Owner", wa:"966504567890"},
 {id:"demo-5", city:"Madinah", rent:600, type:"shared", gender:"any", nat:"Any", bills:false,
  desc:"Shared room available near King Fahd road, 2 people currently, open to any nationality. Bills split monthly by usage.",
  by:"Tenant", wa:"966505678901"},
 {id:"demo-6", city:"Hail", rent:400, type:"bed", gender:"male", nat:"Bangladeshi", bills:true,
  desc:"Simple bed space, factory workers' housing block, walking distance to industrial area. All utilities included in rent.",
  by:"Owner", wa:"966506789012"},
 {id:"demo-7", city:"Riyadh", rent:1100, type:"private", gender:"any", nat:"Any", bills:true,
  desc:"Modern private room in a new building near King Fahd Road, gym access included, professional flatmates, all bills covered.",
  by:"Owner", wa:"966507890123"},
 {id:"demo-8", city:"Jeddah", rent:520, type:"shared", gender:"male", nat:"Indian", bills:true,
  desc:"Shared room close to Al Balad, 3 Indian flatmates, walking distance to bus stop, water and electricity included in rent.",
  by:"Tenant", wa:"966508901234"}
];

/* ============================= Forum data ============================= */
/* Placeholder data shown briefly while the real rows load from Supabase (see fetchAndRenderForum). */
let forumPosts = [
 {cat:"Housing", q:"Can I share an Iqama address with roommates who aren't my family?", by:"New in Riyadh", votes:14,
  replies:["Yes, many shared flats register the lease under one tenant's name — just make sure your municipal address on Absher matches where you actually live.",
   "We did this for 2 years in Jeddah, no issues, just keep a copy of the rent agreement in case anyone asks."]},
 {cat:"Legal", q:"My employer is delaying my Iqama renewal — what should I do?", by:"Worried_Worker", votes:22,
  replies:["Check your Iqama status directly on Muqeem first. If it's genuinely overdue, you can raise it through Qiwa's labor complaint feature."]},
 {cat:"Jobs", q:"Is it normal for a new employer to ask for a fee to process my transfer?", by:"Fahad_K", votes:31,
  replies:["No — transfer of sponsorship fees paid by the worker are not standard practice. Verify everything through Qiwa directly rather than a middleman.",
   "Be cautious, this is a common scam pattern. Ask your new employer to handle it officially."]},
 {cat:"General life", q:"Best way to send money home without high fees?", by:"RemitteeRiyadh", votes:18,
  replies:["Compare rates between your bank's app and licensed remittance companies — rates change weekly, so check both before sending."]},
 {cat:"Housing", q:"Any tips for finding female-only shared housing in Makkah?", by:"Amina_S", votes:9,
  replies:["Ask around at your workplace first — most listings for women-only flats circulate by word of mouth before they're posted anywhere."]},
 {cat:"Legal", q:"Do I need Nafath to open a bank account or just Absher?", by:"NewArrival22", votes:12,
  replies:["You'll likely need both — Absher registration first, then Nafath for identity verification at the bank or in their app."]},
 {cat:"Jobs", q:"How long does a standard Qiwa contract transfer usually take?", by:"Sana_T", votes:7,
  replies:["It varies, but once both employers confirm on Qiwa it's often processed within a couple of weeks. Follow up directly on the platform."]},
 {cat:"General life", q:"Which is cheaper for a first month — hotel or shared bed space?", by:"JustLanded", votes:15,
  replies:["Bed space, by far, if you can find one through a trusted contact — hotels add up fast in the first two weeks."]}
];
/* Reply ids the signed-in user has already upvoted this session (see fetchAndRenderForum). */
let myReplyVotes = new Set();

/* ============================= Buddies ============================= */
/* Placeholder data shown briefly while the real rows load from Supabase (see fetchAndRenderBuddies). */
let buddies = [
 {name:"Waseem A.", help:["Housing","Paperwork"], bio:"3 years in Riyadh, happy to help with Absher/Nafath setup and finding shared housing near Olaya.", wa:"966509012345"},
 {name:"Grace M.", help:["Orientation","Housing"], bio:"Been in Jeddah for 2 years, know the ropes around Al Balad and Corniche housing options.", wa:"966509123456"}
];

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

/* ============================= State & render ============================= */
let state = {
  lang:'en', tab:'housing',
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
/* wa.me only takes digits — also keeps a stored number from breaking out of an href. */
function waDigits(value){
  return String(value ?? '').replace(/[^0-9]/g,'');
}

function applyI18n(){
  document.documentElement.lang = state.lang;
  document.documentElement.dir = (state.lang==='ar'||state.lang==='ur') ? 'rtl' : 'ltr';
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
    b.classList.toggle('active', b.getAttribute('data-lang-btn')===state.lang);
  });
  document.title = state.lang==='en' ? "Sanad · سند — Your support system in Saudi Arabia" : translations[state.lang].brandName + " — " + translations[state.lang].brandTag;
}

function setTab(tab){
  state.tab = tab;
  document.querySelectorAll('section.view').forEach(s=>s.classList.remove('active'));
  document.getElementById('view-'+tab).classList.add('active');
  document.querySelectorAll('nav.tabbar button[data-tab]').forEach(b=>b.classList.toggle('active', b.getAttribute('data-tab')===tab));
  window.scrollTo({top:0, behavior:'instant'});
  applyFeedMode();
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

/* ============================= Cities & shared lookups ============================= */
const CITY_KEYS = ["Riyadh","Jeddah","Dammam/Khobar","Makkah","Madinah","Hail"];
const CITY_LABELS = {
  en:CITY_KEYS,
  ar:["الرياض","جدة","الدمام/الخبر","مكة","المدينة","حائل"],
  ur:["ریاض","جدہ","دمام/خبر","مکہ","مدینہ","حائل"]
};
const NAT_KEYS = ["Any","Indian","Pakistani","Filipino","Arab","Bangladeshi"];
const NAT_LABELS = {
  en:["Any nationality pref.","Indian","Pakistani","Filipino","Arab","Bangladeshi"],
  ar:["أي جنسية","هندي","باكستاني","فلبيني","عربي","بنغلاديشي"],
  ur:["کوئی بھی قومیت","بھارتی","پاکستانی","فلپائنی","عرب","بنگلہ دیشی"]
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
      media: l.media_url
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
const noteIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>';
const chatIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 01-8.5 8.5c-1.35 0-2.61-.34-3.7-.94L3 21l1.94-5.8A8.5 8.5 0 1121 11.5z"/></svg>';
const bulbIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a6 6 0 00-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-1.5c0-.6.3-1.2.8-1.6A6 6 0 0012 2z"/></svg>';
const upvoteIconSvg = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5l7 8H5l7-8z"/></svg>';
const badgeIconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 5.6L21 8.5l-4.5 4.2L17.6 19 12 15.8 6.4 19l1.1-6.3L3 8.5l6.4-.9L12 2z"/></svg>';

/* Deterministic "since forever" like counts so a listing's number doesn't jump on
   every re-render — same feel as TikTok's counter without needing a backend. */
function seedFromString(str){
  let h = 0;
  for(let i=0;i<str.length;i++){ h = (h*31 + str.charCodeAt(i)) >>> 0; }
  return h;
}
function baseLikeCount(l){
  return 40 + (seedFromString(l.city + l.rent + l.desc) % 260);
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
  const count = baseLikeCount(l) + (liked ? 1 : 0);
  const hasProfile = !!l.posterUserId;
  const avatarLetter = escapeHtml(String(isHousing ? l.city : (l.by || l.city || '?')).charAt(0).toUpperCase());
  const posterId = escapeHtml(l.posterUserId);
  const wa = waDigits(l.wa);
  const typeTagKey = postType==='inquiry' ? 'chipInquiries' : postType==='guide' ? 'chipGuides' : 'chipHousing';
  const typeIcon = postType==='inquiry' ? chatIconSvg : postType==='guide' ? bulbIconSvg : houseIconSvg;
  const mediaHtml = safeUrl(l.video)
    ? `<video class="feed-media" src="${safeUrl(l.video)}" muted loop playsinline></video>`
    : (safeUrl(l.media) ? `<img class="feed-media" src="${safeUrl(l.media)}" alt="">` : `<div class="feed-placeholder feed-placeholder--${postType}">${typeIcon}</div>`);
  return `
  <div class="feed-card" data-idx="${i}" data-like-key="${key}" data-listing-id="${key}">
    ${mediaHtml}
    <div class="feed-scrim"></div>
    <div class="feed-heart-burst" data-heart-burst></div>
    ${safeUrl(l.video) ? `<button class="feed-mute" data-mute-toggle="${i}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 9v6h4l5 4V5l-5 4H5z"/><path d="M17 9a3 3 0 010 6" stroke-opacity="0.4"/></svg></button>` : ''}
    <div class="feed-rail">
      <button class="feed-avatar-wrap" ${hasProfile ? `data-view-profile="${posterId}"` : 'disabled'}><div class="feed-avatar">${avatarLetter}</div></button>
      <div><button class="lk ${liked?'active':''}" data-like="${key}" aria-pressed="${liked}">${heartIconSvg}</button><div class="lbl" data-like-count="${key}">${formatCount(count)}</div></div>
      ${wa ? `<div><button class="wa" data-wa="${wa}">${waIconSvg}</button><div class="lbl">${t('contactWA')}</div></div>` : ''}
      ${isForumInquiry ? `<div><button class="ans" data-view-forum-post="${l.forumIndex}">${chatIconSvg}</button><div class="lbl">${t('viewAndAnswer')}</div></div>` : ''}
      <div><button class="sv ${saved?'active':''}" data-save="${key}" aria-pressed="${saved}">${bookmarkIconSvg}</button><div class="lbl">${t('saveLabel')}</div></div>
      <div><button class="sh" data-share-listing-id="${key}">${shareIconSvg}</button><div class="lbl">${t('shareLabel')}</div></div>
    </div>
    <div class="feed-content">
      <div class="feed-handle">
        <button class="feed-handle-link" ${hasProfile ? `data-view-profile="${posterId}"` : 'disabled'}>
          <span class="feed-avatar-sm">${avatarLetter}</span>
          <span class="handle-name">${t('postedBy')} ${escapeHtml(l.by)}</span>
        </button>
        ${isHousing
          ? `<span class="feed-price-pill">${escapeHtml(l.rent)} ${t('sarLabel')}${t('perMonth')}</span>`
          : isForumInquiry
            ? `<span class="feed-price-pill feed-price-pill--muted">${chatIconSvg}${l.repliesCount}</span>`
            : `<span class="feed-tag">${t(typeTagKey)}</span>`}
      </div>
      ${isHousing ? `<h3>${escapeHtml(t(roomTypeLabelKey[l.type] || l.type))} · ${escapeHtml(l.city)}</h3>` : ''}
      <p class="feed-desc${isHousing ? '' : ' feed-desc--quote'}">${escapeHtml(l.desc)}</p>
      ${isHousing ? `
      <div class="feed-tag-row">
        <span class="feed-tag">#${escapeHtml(String(t(genderLabelKey[l.gender] || l.gender)).replace(/\s+/g,''))}</span>
        <span class="feed-tag">#${escapeHtml(String(l.nat==='Any' ? t('natAny') : l.nat).replace(/\s+/g,''))}</span>
        <span class="feed-tag">#${(l.bills ? t('billsIncluded') : t('billsShared')).replace(/\s+/g,'')}</span>
      </div>` : isForumInquiry
        ? `<div class="feed-tag-row"><span class="feed-tag">${t('fromCommunity')}</span></div>`
        : (l.natTarget ? `<div class="feed-tag-row"><span class="feed-tag">#${escapeHtml(l.natTarget.replace(/\s+/g,''))}</span></div>` : '')}
      <div class="feed-sound"><span class="feed-sound-ic">${noteIconSvg}</span><span class="feed-sound-track"><span>${t('soundTicker')}</span><span>${t('soundTicker')}</span></span></div>
    </div>
  </div>
`;
}

/* Wires up whatever a feed-scroll container of .feed-card elements needs — shared
   by the Feed's listingsGrid and Community's forumFeedScroll. */
function bindFeedCardEvents(wrap, filtered){
  wrap.querySelectorAll('[data-view-forum-post]').forEach(btn=>{
    btn.addEventListener('click', ()=> jumpToForumPost(parseInt(btn.getAttribute('data-view-forum-post'))));
  });
  wrap.querySelectorAll('[data-wa]').forEach(btn=>{
    btn.addEventListener('click', ()=> window.open('https://wa.me/'+btn.getAttribute('data-wa'), '_blank'));
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

  /* ---- Likes: tap the heart, or double-tap the card (TikTok's classic gesture) ---- */
  function setLiked(card, key, liked){
    state.feedLikes[key] = liked;
    persistIdSet(LIKED_STORAGE_KEY, state.feedLikes);
    const btn = card.querySelector('[data-like="'+CSS.escape(key)+'"]');
    const lbl = card.querySelector('[data-like-count="'+CSS.escape(key)+'"]');
    if(btn){ btn.classList.toggle('active', liked); btn.setAttribute('aria-pressed', String(liked)); }
    if(lbl){
      const listing = filtered.find(l=> l.id === key);
      if(listing) lbl.textContent = formatCount(baseLikeCount(listing) + (liked?1:0));
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
  let lastTap = 0;
  wrap.querySelectorAll('.feed-card[data-like-key]').forEach(card=>{
    card.addEventListener('click', (e)=>{
      if(e.target.closest('button')) return; // real controls handle their own taps
      const now = Date.now();
      if(now - lastTap < 320){
        const key = card.getAttribute('data-like-key');
        setLiked(card, key, true);
        burstHeart(card);
      }
      lastTap = now;
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
      votes: p.votes,
      replies: (p.forum_replies || [])
        .slice()
        .sort((a,b)=> new Date(a.created_at) - new Date(b.created_at))
        .map(r => ({
          id: r.id,
          text: r.reply_text,
          by: r.app_users ? r.app_users.name : null,
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
  const cats = ["All","Housing","Legal","Jobs","General life"];
  const catKeys = {All:"catAll", Housing:"catHousing", Legal:"catLegal", Jobs:"catJobs", "General life":"catLife"};
  const row = document.getElementById('catChipRow');
  row.innerHTML = cats.map(c=>`<button class="cat-chip ${state.forumCat===c?'active':''}" data-cat="${c}">${t(catKeys[c])}</button>`).join('');
  row.querySelectorAll('[data-cat]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.forumCat = btn.getAttribute('data-cat');
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
          <strong>${t('noHelpersYet')}</strong>
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
  if(card) card.closest('.feed-card-wrap').scrollIntoView({ behavior:'smooth', block:'start' });
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

/* ============================= Sign-in (username + password) ============================= */
const AUTH_STORAGE_KEY = 'sanad_user';
let authMode = 'login'; // 'login' | 'signup'

function setAuthMode(mode){
  authMode = mode;
  document.getElementById('authTabLogin').classList.toggle('active', mode==='login');
  document.getElementById('authTabSignup').classList.toggle('active', mode==='signup');
  document.getElementById('signupNameField').style.display = mode==='signup' ? 'block' : 'none';
  document.getElementById('authHint').textContent = t(mode==='signup' ? 'signupHint' : 'loginHint');
  document.getElementById('btnSignInSubmit').textContent = t(mode==='signup' ? 'signupTabLabel' : 'signInSubmit');
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
  document.getElementById('si-name').value = '';
  document.getElementById('si-username').value = '';
  document.getElementById('si-password').value = '';
  setAuthMode('login');
  document.getElementById('signInModal').style.display = 'flex';
}
function closeSignIn(){
  document.getElementById('signInModal').style.display = 'none';
  pendingSignInAction = null;
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

async function submitSignIn(){
  const username = document.getElementById('si-username').value.trim();
  const password = document.getElementById('si-password').value;
  const name = document.getElementById('si-name').value.trim();
  hideAuthError();

  if(!username || !password){ showAuthError(t('authErrorMissing')); return; }
  if(authMode==='signup' && password.length < 6){ showAuthError(t('authErrorShort')); return; }

  if(!SUPABASE_CONFIGURED){
    // No backend configured yet — accept anything so the demo still works offline.
    appUser = { id:'local-'+username.toLowerCase(), username: username.toLowerCase(), name: name || username, createdAt: new Date().toISOString(), sessionToken:'local-session-'+Date.now() };
  } else {
    try{
      const fn = authMode==='signup' ? 'signup_user' : 'login_user';
      const params = authMode==='signup'
        ? { p_username: username, p_password: password, p_name: name || username }
        : { p_username: username, p_password: password };
      const { data, error } = await supabaseClient.rpc(fn, params);
      if(error){
        // Always log the raw error — the banner below only shows a translated
        // summary, and "couldn't reach the server" hides very different causes
        // (schema.sql not run yet, RLS blocking the call, a real network drop).
        console.error(`Sanad: ${fn} failed:`, error);
        const msg = (error.message||'').toLowerCase();
        if(msg.includes('taken')) showAuthError(t('authErrorTaken'));
        else if(msg.includes('least') || msg.includes('at least 3')) showAuthError(t('authErrorShort'));
        else if(msg.includes('invalid username or password')) showAuthError(t('authErrorInvalid'));
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
      appUser = { id: row.id, username: row.username, name: row.name, createdAt: row.created_at, sessionToken: row.session_token };
    } catch(err){
      console.error('Sanad: could not reach Supabase to sign in:', err);
      showAuthError(t('authErrorNetwork') + ' (' + (err && err.message ? err.message : String(err)) + ')');
      return;
    }
  }

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
  if(action) action();
}

function signOut(){
  appUser = null;
  myShareLinks = [];
  persistAppUser();
  renderProfile();
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
  if(card) card.scrollIntoView({ behavior:'smooth', block:'start' });
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
  document.getElementById('profileAvatar').textContent = (appUser.name || appUser.phone || '?').charAt(0).toUpperCase();
  document.getElementById('profileName').textContent = appUser.name || appUser.phone;
  document.getElementById('profileHandle').textContent = appUser.phone || '';
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
  if(card) card.scrollIntoView({ behavior:'instant', block:'start' });
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
    </div>
  `).join('');
}

async function fetchAndRenderBuddies(){
  if(!SUPABASE_CONFIGURED){ renderBuddies(); return; }
  try{
    const { data, error } = await supabaseClient.from('buddies').select('*, app_users(name)').order('created_at', { ascending:false });
    if(error){ console.error('Error loading buddies:', error); renderBuddies(); return; }
    buddies = data.map(b=>({ userId: b.user_id, name: b.app_users ? b.app_users.name : 'Buddy', help: b.help_areas || [], bio: b.bio, wa: b.whatsapp }));
    renderBuddies();
  } catch(err){
    console.error('Could not reach Supabase for buddies, showing local data instead:', err);
    renderBuddies();
  }
}

async function submitBuddy(){
  const help = [...document.querySelectorAll('.buddy-help:checked')].map(c=>c.value);
  const bio = document.getElementById('buddy-bio').value.trim() || '—';
  const wa = (document.getElementById('buddy-wa').value || '966500000000').replace(/[^0-9]/g,'');
  if(!help.length){ return; }

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
    ur:["جنوری","فروری","مارچ","اپریل","مئی","جون","جولائی","اگست","ستمبر","اکتوبر","نومبر","دسمبر"]
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
        return { userId: c.user_id, name: c.app_users.name, replies, votes, isBuddy, score };
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
    const wa = waInput ? waInput.value.replace(/[^0-9]/g,'') : '';
    const errEl = document.getElementById('openToWorkError');
    if(errEl) errEl.style.display = 'none';

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
  renderListings();
  renderCatChips();
  renderForum();
  renderBuddies();
  renderProfile();
  syncQcStep2Copy(); // re-sync the composer's dynamic labels after a language switch
}

/* ============================= Events ============================= */
document.querySelectorAll('[data-lang-btn]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    state.lang = btn.getAttribute('data-lang-btn');
    renderAll();
  });
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

document.getElementById('qcToggleAdvanced').addEventListener('click', ()=>{
  const panel = document.getElementById('qcAdvancedFields');
  const open = panel.style.display === 'none';
  panel.style.display = open ? 'block' : 'none';
  document.getElementById('qcToggleAdvanced').classList.toggle('open', open);
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
  document.getElementById('qcAdvancedFields').style.display = 'none';
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
  const whatsapp = document.getElementById('qc-wa').value.trim();
  const videoFile = document.getElementById('qc-video').files[0];

  if(isHousing && !rent){ document.getElementById('qc-rent').focus(); return; }
  if(isHousing && !whatsapp){ document.getElementById('qc-wa').focus(); return; }

  requireSignIn(async ()=>{
    const postedCategory = category;

    if (!SUPABASE_CONFIGURED) {
      const localImageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
      const localVideoUrl = videoFile ? URL.createObjectURL(videoFile) : null;
      listings.unshift(isHousing
        ? { id:'local-'+Date.now(), posterUserId: appUser.id, postType: 'housing', city, rent, type: room_type, gender: gender_pref, nat: nationality_pref, bills: bills_included, desc: text || '—', by: appUser.name, wa: whatsapp, video: localVideoUrl }
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
        if (videoFile) {
          const statusEl = document.getElementById('qcVideoUploadStatus');
          statusEl.style.display = 'block';
          const path = `${Date.now()}_${videoFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
          const { error: uploadError } = await supabaseClient.storage.from('listing-videos').upload(path, videoFile);
          statusEl.style.display = 'none';
          if (uploadError) console.error('Error uploading video:', uploadError);
          else video_url = supabaseClient.storage.from('listing-videos').getPublicUrl(path).data.publicUrl;
        }
        row = {
          p_post_type: 'housing', p_city: city, p_rent: rent, p_room_type: room_type, p_gender_pref: gender_pref,
          p_nationality_pref: nationality_pref, p_bills_included: bills_included,
          p_description: text || '—', p_whatsapp: whatsapp, p_video_url: video_url
        };
      } else {
        let media_url = null;
        if (imageFile) {
          const statusEl = document.getElementById('qcImageUploadStatus');
          statusEl.style.display = 'block';
          const path = `${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
          const { error: uploadError } = await supabaseClient.storage.from('post-images').upload(path, imageFile);
          statusEl.style.display = 'none';
          if (uploadError) console.error('Error uploading image:', uploadError);
          else media_url = supabaseClient.storage.from('post-images').getPublicUrl(path).data.publicUrl;
        }
        row = { p_post_type: postedCategory, p_description: text, p_media_url: media_url };
      }

      // The server fills in poster_user_id / poster_role from the session token.
      const { error } = await supabaseClient.rpc('create_listing', { p_session_token: appUser.sessionToken, ...row });

      if (error) {
        console.error('Error publishing post:', error);
        return;
      }

      resetComposerFields();
      setPostedTypeChip(postedCategory);
      await fetchAndRenderListings();
    } catch (err) {
      console.error('Could not reach Supabase to publish post:', err);
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

/* ---- Sign-in modal (username + password) ---- */
document.getElementById('btnProfileSignIn').addEventListener('click', ()=> openSignIn());
document.getElementById('btnSignInSubmit').addEventListener('click', submitSignIn);
document.querySelectorAll('[data-auth-tab]').forEach(btn=>{
  btn.addEventListener('click', ()=> setAuthMode(btn.getAttribute('data-auth-tab')));
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

  setTab('housing'); // the Feed is the whole app's landing screen — there's no Home anymore
  renderAll();
  applyFeedMode();
  await trackIncomingShareCode();
  await Promise.all([fetchAndRenderListings(), fetchAndRenderForum(), fetchAndRenderBuddies()]);
  // Depends on buddies (isBuddy bonus) being loaded above, so it runs after.
  await fetchLeaderboardData();
  renderLeaderboard();
  renderProfile();
  if(appUser){ await Promise.all([fetchAndRenderShareLinks(), fetchAndRenderProfileStats()]); }
  openDeepLinkedListing();
  openDeepLinkedProfile();
}

initApp();
