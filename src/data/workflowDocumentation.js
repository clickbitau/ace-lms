export const WORKFLOW_MODULES = [
  // ── OVERVIEW ──
  {
    id: 'admin-dashboard',
    title: 'Executive Dashboard & Analytics Hub',
    group: 'OVERVIEW',
    role: 'admin',
    liveRoute: '/admin',
    icon: 'LayoutDashboard',
    summary: 'The central nerve center providing real-time KPI visibility, recent learner activities, Q&A moderation backlog, and automated microservice health monitoring.',
    problemSolved: 'Eliminates siloed tracking. In traditional institutions, tracking revenue, student drop-offs, unanswered questions, and system infrastructure requires four different tools. This dashboard aggregates all operational intelligence into a single unified screen with zero manual reporting overhead.',
    dualPerspective: {
      adminView: 'Full administrative command: tracks total revenue ($), active student enrollments, completion ratios, automated Stripe webhook listeners, and pending course authoring drafts.',
      studentView: 'Students experience the inverse view on their student dashboard: personal active enrollments, module completion percentage, certificate milestones, and upcoming assignment deadlines.'
    },
    entities: [
      { name: 'Total Courses', type: 'Metric Counter', description: 'Active curriculum count across published and draft offerings.', lifecycle: 'Increments on course creation; updates live on status change.' },
      { name: 'Enrolled Learners', type: 'Metric Counter', description: 'Unique registered students active in one or more curriculum modules.', lifecycle: 'Real-time increment upon payment/enrollment.' },
      { name: 'Total Revenue', type: 'Currency (USD)', description: 'Gross collected tuition fees reconciled from all integrated payment gateways.', lifecycle: 'Updated instantly via webhook listeners.' },
      { name: 'Certificates Issued', type: 'Metric Counter', description: 'Total cryptographically verifiable credentials earned by students.', lifecycle: 'Triggered automatically when a student hits 100% completion.' },
      { name: 'Learner Activity Feed', type: 'Table Stream', description: 'Recent enrollments, assigned courses, progress meters, and status tags.', lifecycle: 'Streaming real-time student events.' },
      { name: 'Q&A Moderation Stream', type: 'Table Queue', description: 'Live student inquiries awaiting instructor replies or marked as resolved.', lifecycle: 'Open -> Answered -> Resolved.' },
      { name: 'Automated Service Health', type: 'System Monitors', description: 'Status of Stripe listeners, Email queues, Transcoders, and PDF signers.', lifecycle: 'Operational -> Degraded -> Offline.' }
    ],
    actions: [
      { label: 'View All Enrollments', variant: 'ghost', description: 'Navigates to the full student enrollment registry.', destination: '/admin/enrollments' },
      { label: 'Open Moderation', variant: 'ghost', description: 'Directly opens the discussion thread moderation center.', destination: '/admin/discussions' },
      { label: 'Reply', variant: 'primary', description: 'Jumps directly into a specific student question to provide answers.', destination: '/admin/discussions' },
      { label: 'Metric Quick-Hub Cards', variant: 'card', description: 'Clicking any mini-metric filters and opens the respective module (Assignments, Reviews, Coupons).', destination: 'Contextual routes' }
    ],
    userJourney: [
      { step: 1, title: 'Morning Review', description: 'Admin logs in and checks the Needs Grading and Student Q&A mini counters.' },
      { step: 2, title: 'Health Verification', description: 'Verifies Stripe Webhooks and Certificate PDF Signer show Operational green status.' },
      { step: 3, title: 'Moderation Response', description: 'Clicks Reply on any pending question in the Q&A moderation queue to answer students.' },
      { step: 4, title: 'Financial Audit', description: 'Reviews zero chargebacks banner and reconciles gross daily revenue.' }
    ]
  },

  // ── CONTENT ──
  {
    id: 'admin-courses',
    title: 'Course Management & Curriculum Registry',
    group: 'CONTENT',
    role: 'both',
    liveRoute: '/admin/courses',
    icon: 'BookOpen',
    summary: 'The master course inventory allowing administrators to publish, draft, version-control, price, and author learning modules.',
    problemSolved: 'Replaces messy spreadsheets and manual content uploads. Solves course versioning conflicts: admins can edit a draft version without breaking active learners enrolled in published versions.',
    dualPerspective: {
      adminView: 'Create new course offerings, edit pricing, manage published vs. draft versions, configure thumbnail assets, and launch the drag-and-drop Course Authoring Studio.',
      studentView: 'Students view the public catalog (/courses) or detail page (/course/:slug), inspecting syllabus topics, previewing sample lessons, checking reviews, and checking out.'
    },
    entities: [
      { name: 'Course Title & Code', type: 'Identity', description: 'Public curriculum name and unique identifier code (e.g. LEAD-101).', lifecycle: 'Configured during initial course setup.' },
      { name: 'Category & Difficulty', type: 'Taxonomy', description: 'Discipline classification (Leadership, Dev, Design) and target skill level.', lifecycle: 'Used by catalog search filters.' },
      { name: 'Publication Status', type: 'State Enum', description: 'Published (visible to students), Draft (under authoring), Archived.', lifecycle: 'Draft -> Published -> Archived.' },
      { name: 'Published Version', type: 'SemVer string', description: 'Currently active version immutable snapshot serving enrolled students.', lifecycle: 'Locked upon publication.' },
      { name: 'Tuition Fee ($)', type: 'Price Currency', description: 'Enrollment fee charged to students at checkout.', lifecycle: 'Editable; coupons can discount this.' },
      { name: 'Total Enrollments', type: 'Count Metric', description: 'Quantity of active students enrolled in this curriculum.', lifecycle: 'Increments automatically upon checkout.' }
    ],
    actions: [
      { label: 'Create New Course', variant: 'primary', description: 'Opens modal to register title, code, price, category, and initial version.', destination: 'Modal -> Authoring' },
      { label: 'Curriculum Studio (Author)', variant: 'secondary', description: 'Launches full visual curriculum builder for lessons and content blocks.', destination: '/admin/courses/:id/author' },
      { label: 'Edit Course Details', variant: 'ghost', description: 'Modifies pricing, category, description, and thumbnail image.', destination: 'Edit Modal' },
      { label: 'Publish / Unpublish', variant: 'accent', description: 'Toggles visibility to prospective and enrolled students.', destination: 'State update' }
    ],
    userJourney: [
      { step: 1, title: 'Course Ideation', description: 'Admin clicks Create New Course, inputs title, slug, price, and category.' },
      { step: 2, title: 'Authoring Curriculum', description: 'Admin clicks Curriculum Studio to add sections, video blocks, slides, and quizzes.' },
      { step: 3, title: 'Release to Catalog', description: 'Admin publishes version 1.0; course immediately appears in student catalog.' },
      { step: 4, title: 'Learner Enrollment', description: 'Students discover the course, purchase via checkout, and start learning.' }
    ]
  },

  {
    id: 'course-authoring',
    title: 'Curriculum Authoring Studio',
    group: 'CONTENT',
    role: 'admin',
    liveRoute: '/admin/courses',
    icon: 'Layers',
    summary: 'Visual studio for architecting sections, lessons, multimedia blocks (Video, Audio, Slides, Rich Text), checklists, and graded quizzes.',
    problemSolved: 'Eliminates developer dependency for content changes. Instructors can structure courses with multi-modal content types (presentation slides, audio podcasts, code walkthroughs) and live test preview without writing HTML.',
    dualPerspective: {
      adminView: 'Add sections, create lessons, insert multimedia blocks, configure passing thresholds on quizzes, upload transcripts and slide decks.',
      studentView: 'Experience the rendered lessons inside the Course Player (/student/learn/:id) with progress tracking and instant quiz grading.'
    },
    entities: [
      { name: 'Section / Module', type: 'Container', description: 'Top-level chapter containing a sequence of focused lessons.', lifecycle: 'Created, ordered, published.' },
      { name: 'Lesson', type: 'Unit', description: 'Single learning session with title, duration, and content block attachments.', lifecycle: 'Draft -> Published.' },
      { name: 'Content Block Type', type: 'Block Enum', description: 'Video Player, Audio Lecture, Slide Deck, Rich Document, Action Checklist, or Quiz.', lifecycle: 'Created in authoring studio.' },
      { name: 'Passing Score (%)', type: 'Quiz Metric', description: 'Minimum score threshold required on quiz blocks (e.g. 70%) to unlock completion.', lifecycle: 'Enforced at quiz grading.' },
      { name: 'Version History', type: 'Version Log', description: 'Track draft changes vs published snapshots for zero-downtime content updates.', lifecycle: 'Draft v1.1 -> Publish.' }
    ],
    actions: [
      { label: 'Add Section', variant: 'secondary', description: 'Creates a new curriculum module header.', destination: 'Inline form' },
      { label: 'Add Lesson', variant: 'secondary', description: 'Appends a lesson to the selected curriculum module.', destination: 'Inline modal' },
      { label: 'Add Content Block', variant: 'primary', description: 'Selects Video, Audio, Slides, Document, Checklist, or Quiz block.', destination: 'Block Builder' },
      { label: 'Publish Changes', variant: 'success', description: 'Commits draft changes to the live course version.', destination: 'Release to students' }
    ],
    userJourney: [
      { step: 1, title: 'Structure Sections', description: 'Instructor defines Section 1 (Foundations), Section 2 (Deep Dive).' },
      { step: 2, title: 'Attach Content Blocks', description: 'Attaches an MP4 video, PDF reference document, and a 5-question knowledge quiz.' },
      { step: 3, title: 'Configure Quiz Pass Gate', description: 'Sets 80% passing standard and correct answers with explanations.' },
      { step: 4, title: 'Preview & Commit', description: 'Switches to Preview Mode to test interactive learner experience, then publishes.' }
    ]
  },

  {
    id: 'admin-assignments',
    title: 'Assignment Management & Grading Studio',
    group: 'CONTENT',
    role: 'both',
    liveRoute: '/admin/assignments',
    icon: 'ClipboardCheck',
    summary: 'The central hub for administering project coursework, setting deadlines, inspecting student PDF/DOCX artifacts, and recording numerical grades with feedback.',
    problemSolved: 'Replaces cluttered email submissions. Solves the grading bottleneck with real in-browser document previews (zero alert errors), automated deadline flags, and instant student notification.',
    dualPerspective: {
      adminView: 'Create assignments, attach specification briefs, inspect student submissions via DocumentViewerModal, award points (e.g. 92/100), and write instructor recommendations.',
      studentView: 'Students view assignments under /student/assignments, download teacher briefs, upload coursework artifacts (PDF, Word), and view instructor grades and feedback.'
    },
    entities: [
      { name: 'Assignment Title & Course', type: 'Association', description: 'Project name linked directly to its parent course curriculum.', lifecycle: 'Defined by instructor.' },
      { name: 'Specification Brief', type: 'Artifact File', description: 'Official teacher PDF or reference guide attached for student download.', lifecycle: 'Uploaded at creation.' },
      { name: 'Allowed Formats', type: 'Validation Rule', description: 'Permitted submission file extensions (PDF, DOCX, DOC, ZIP).', lifecycle: 'Validated client-side upon file select.' },
      { name: 'Deadline & Overdue Flag', type: 'Datetime / State', description: 'Due date; late submissions are flagged with amber/red tags.', lifecycle: 'Pending -> Submitted -> Late / On-time.' },
      { name: 'Max Marks & Passing Score', type: 'Grading Metric', description: 'Maximum total points (e.g. 100) and required threshold (e.g. 70).', lifecycle: 'Configured by instructor.' },
      { name: 'Student Submission File', type: 'Binary Data / DataURL', description: 'Uploaded student coursework with real inspection preview and download.', lifecycle: 'Stored base64 upon student upload.' },
      { name: 'Grade & Feedback', type: 'Assessment', description: 'Numerical score and qualitative recommendations sent to student.', lifecycle: 'Submitted -> Graded.' }
    ],
    actions: [
      { label: 'Create Assignment', variant: 'primary', description: 'Opens modal to specify title, course, deadline, allowed formats, and attach brief.', destination: 'Create Modal' },
      { label: 'Grade / Edit Grade', variant: 'secondary', description: 'Opens grading modal with student details, submitted file info, and score inputs.', destination: 'Grading Modal' },
      { label: 'View File (Document Viewer)', variant: 'primary', description: 'Launches DocumentViewerModal with zoom, print, popout, and verified document download.', destination: 'DocumentViewerModal' },
      { label: 'Save Grade & Notify Student', variant: 'success', description: 'Records score, generates student notification, and recalculates course progress.', destination: 'State update' }
    ],
    userJourney: [
      { step: 1, title: 'Project Creation', description: 'Instructor creates "Quarterly Strategy Pitch", attaches brief, and sets deadline.' },
      { step: 2, title: 'Student Submission', description: 'Student reads brief, completes pitch deck, and uploads PDF coursework.' },
      { step: 3, title: 'Artifact Inspection', description: 'Instructor clicks View File to examine student PDF in the document viewer.' },
      { step: 4, title: 'Grading & Feedback', description: 'Instructor inputs score (95/100) with encouraging feedback and notifies student.' }
    ]
  },

  {
    id: 'admin-discussions',
    title: 'Discussions & Student Q&A Moderation',
    group: 'CONTENT',
    role: 'both',
    liveRoute: '/admin/discussions',
    icon: 'MessagesSquare',
    summary: 'Interactive community forum and Q&A ticketing center where students ask questions regarding specific lessons and instructors provide verified answers.',
    problemSolved: 'Eliminates lost queries in private emails. When a student asks a question during a lesson, it is captured with course/lesson context so other students can benefit from the answer.',
    dualPerspective: {
      adminView: 'Filter unanswered inquiries, filter by course, post official instructor answers, mark threads as resolved, or pin key discussions.',
      studentView: 'Ask questions directly inside the lesson player or community feed, receive answers, and mark their problem as solved.'
    },
    entities: [
      { name: 'Question Title & Body', type: 'Text Content', description: 'Student problem statement, code snippet, or theoretical question.', lifecycle: 'Posted by student.' },
      { name: 'Course Association', type: 'Link', description: 'Identifies which course and module the question relates to.', lifecycle: 'Captured at time of inquiry.' },
      { name: 'Reply Count', type: 'Counter', description: 'Number of instructor and peer answers on the thread.', lifecycle: '0 = Needs Reply; >0 = Active.' },
      { name: 'Resolution State', type: 'Status Boolean', description: 'Open inquiry vs. Resolved by instructor answer.', lifecycle: 'Open -> Resolved.' },
      { name: 'Author Persona', type: 'User Identity', description: 'Student name, avatar, and role tag.', lifecycle: 'Inherited from auth state.' }
    ],
    actions: [
      { label: 'Post Instructor Reply', variant: 'primary', description: 'Submits an official answer badge on the discussion thread.', destination: 'Thread View' },
      { label: 'Mark as Resolved', variant: 'success', description: 'Updates status tag to Resolved and removes from moderation backlog.', destination: 'State update' },
      { label: 'Filter: Needs Reply', variant: 'ghost', description: 'Filters view to show only questions with zero replies.', destination: 'Filter bar' }
    ],
    userJourney: [
      { step: 1, title: 'Student Inquiry', description: 'Student gets stuck on Docker lesson and posts question: "CORS error on port 8080".' },
      { step: 2, title: 'Admin Alert', description: 'Admin sees badge "1 awaiting reply" in topbar notification and dashboard.' },
      { step: 3, title: 'Instructor Solution', description: 'Admin navigates to thread and posts explanatory code fix.' },
      { step: 4, title: 'Resolution', description: 'Thread is marked Resolved and remains visible for all future cohort learners.' }
    ]
  },

  {
    id: 'admin-media',
    title: 'Media Library & Digital Asset Transcoder',
    group: 'CONTENT',
    role: 'admin',
    liveRoute: '/admin/media',
    icon: 'HardDrive',
    summary: 'Cloud object asset vault managing video lectures, audio podcasts, presentation slide decks, and reference PDF documents with storage analytics.',
    problemSolved: 'Prevents broken asset links and bloated hosting costs. Provides centralized asset management where video files, transcripts, and handouts can be uploaded once and linked across multiple course modules.',
    dualPerspective: {
      adminView: 'Upload new media files, monitor transcoder status (processing/completed), preview files, copy embed tokens, and track GB quota.',
      studentView: 'Streams optimized media smoothly inside the course player without buffering delays.'
    },
    entities: [
      { name: 'Asset Name & Format', type: 'File Metadata', description: 'Original filename, extension (MP4, MP3, PDF, PPTX), and MIME type.', lifecycle: 'Captured on upload.' },
      { name: 'File Size (MB/GB)', type: 'Storage Metric', description: 'Disk usage contributing to the total cloud storage allocation.', lifecycle: 'Calculated upon upload.' },
      { name: 'Transcoding Status', type: 'Pipeline State', description: 'Ready, Processing, Optimized, or Failed.', lifecycle: 'Processing -> Ready.' },
      { name: 'Usage Links', type: 'Association List', description: 'List of courses and lessons actively referencing this asset.', lifecycle: 'Linked during authoring.' }
    ],
    actions: [
      { label: 'Upload New Asset', variant: 'primary', description: 'Drag-and-drop file upload to cloud media repository.', destination: 'Upload Dropzone' },
      { label: 'Preview Media', variant: 'secondary', description: 'Launches audio/video modal preview or document inspection.', destination: 'Preview modal' },
      { label: 'Delete Asset', variant: 'danger', description: 'Permanently removes asset and checks for broken lesson references.', destination: 'Confirmation modal' }
    ],
    userJourney: [
      { step: 1, title: 'Upload Raw Lecture', description: 'Admin drags 4K lecture video into the Media Library.' },
      { step: 2, title: 'Automated Transcoding', description: 'Transcoder pipeline generates adaptive web streams and updates status to Ready.' },
      { step: 3, title: 'Curriculum Linking', description: 'Admin links the asset to Lesson 3 in the Course Authoring Studio.' }
    ]
  },

  // ── OPERATIONS ──
  {
    id: 'admin-reviews',
    title: 'Student Reviews & Sentiment Moderation',
    group: 'OPERATIONS',
    role: 'both',
    liveRoute: '/admin/reviews',
    icon: 'MessageSquare',
    summary: 'Review moderation queue displaying student star ratings, testimonials, and average customer satisfaction metrics per course.',
    problemSolved: 'Maintains platform quality. Allows instructors to review student feedback, identify modules needing improvement, and approve verified testimonials for course landing pages.',
    dualPerspective: {
      adminView: 'Inspect student ratings (1-5 stars), read written feedback, approve reviews for landing page display, or unpublish spam.',
      studentView: 'Submit ratings upon completing courses and read verified student reviews before enrolling in new masterclasses.'
    },
    entities: [
      { name: 'Star Rating (1-5)', type: 'Numerical Score', description: 'Quantitative evaluation of course quality and instructional delivery.', lifecycle: 'Provided by student.' },
      { name: 'Reviewer Identity', type: 'User Persona', description: 'Student name, avatar, enrolled course, and verified completion badge.', lifecycle: 'Linked to user record.' },
      { name: 'Review Comment', type: 'Testimonial', description: 'Detailed student review explaining strengths and curriculum takeaways.', lifecycle: 'Draft -> Approved.' },
      { name: 'Moderation Status', type: 'Enum', description: 'Published (visible on public landing page) or Hidden.', lifecycle: 'Toggled by admin.' }
    ],
    actions: [
      { label: 'Approve / Publish', variant: 'success', description: 'Features testimonial on the public course sales page.', destination: 'State update' },
      { label: 'Hide Review', variant: 'ghost', description: 'Removes review from public visibility while keeping record for quality analytics.', destination: 'State update' },
      { label: 'Filter by Rating', variant: 'secondary', description: 'Filters view to 5-star, 4-star, or flagged low-rating reviews.', destination: 'Filter bar' }
    ],
    userJourney: [
      { step: 1, title: 'Course Completion', description: 'Student finishes last lesson and submits a 5-star review: "Game changer for leadership!"' },
      { step: 2, title: 'Admin Review', description: 'Admin reviews the comment in the Reviews moderation queue.' },
      { step: 3, title: 'Public Showcase', description: 'Admin clicks Approve; the testimonial appears dynamically on /course/leadership-fundamentals.' }
    ]
  },

  {
    id: 'admin-coupons',
    title: 'Coupons & Promotional Campaign Engine',
    group: 'OPERATIONS',
    role: 'admin',
    liveRoute: '/admin/coupons',
    icon: 'Tag',
    summary: 'Campaign discount generator managing percentage and fixed promo codes, redemption limits, course restrictions, and expiration dates.',
    problemSolved: 'Powers marketing campaigns without developer assistance. Enforces strict expiration timestamps, usage caps, and minimum order values to protect course revenue margins.',
    dualPerspective: {
      adminView: 'Create coupon codes (e.g. FLASH30, WELCOME20), set discount type, track total redemption count, and deactivate campaigns.',
      studentView: 'Enter promo codes during checkout (/checkout/:id), seeing instant price recalculations, savings summaries, and remove buttons.'
    },
    entities: [
      { name: 'Coupon Code', type: 'Uppercase String', description: 'Unique alphanumeric promo key (e.g. WELCOME20, SPRING50).', lifecycle: 'Configured by admin.' },
      { name: 'Discount Type', type: 'Enum', description: 'Percentage (% OFF) or Fixed Dollar Amount ($ OFF).', lifecycle: 'Configured at creation.' },
      { name: 'Discount Value', type: 'Number', description: 'Magnitude of discount (e.g. 20 for 20% or $20).', lifecycle: 'Used in checkout formula.' },
      { name: 'Redemptions / Max Uses', type: 'Usage Counter', description: 'Tracks redemptions vs maximum allowed claims (e.g. 42 / 500 used).', lifecycle: 'Increments on each paid checkout.' },
      { name: 'Expiration Date', type: 'Date', description: 'Final date the code can be redeemed (valid through 23:59:59 of that date).', lifecycle: 'Active -> Expired.' },
      { name: 'Minimum Spend ($)', type: 'Currency Rule', description: 'Minimum cart price required before the discount applies.', lifecycle: 'Enforced at checkout.' },
      { name: 'Active Status', type: 'Boolean', description: 'Master toggle to enable or instantly pause promotion.', lifecycle: 'Active <-> Paused.' }
    ],
    actions: [
      { label: 'Create Coupon', variant: 'primary', description: 'Opens modal to specify code, discount type, value, cap, and expiry.', destination: 'Create Code Modal' },
      { label: 'Toggle Status', variant: 'secondary', description: 'Instantly activates or deactivates a promo code.', destination: 'State update' },
      { label: 'Delete Coupon', variant: 'danger', description: 'Permanently removes promotion code from system.', destination: 'Confirmation' }
    ],
    userJourney: [
      { step: 1, title: 'Campaign Setup', description: 'Admin creates FLASH30: 30% off, max 100 uses, expires end of month.' },
      { step: 2, title: 'Student Applies Code', description: 'Student types FLASH30 at checkout; price drops from $169 to $118.30.' },
      { step: 3, title: 'Automated Accounting', description: 'Checkout increments redemption count to 1/100 and stores discount on invoice.' }
    ]
  },

  {
    id: 'admin-enrollments',
    title: 'Enrollment Records & Student Progress Roster',
    group: 'OPERATIONS',
    role: 'admin',
    liveRoute: '/admin/enrollments',
    icon: 'Users',
    summary: 'Comprehensive roster of all registered students, their enrolled courses, completion percentage, active vs completed states, and manual enrollment controls.',
    problemSolved: 'Enables instructors to track learner engagement, identify students falling behind, and issue manual course access for scholarships or enterprise teams without requiring payment.',
    dualPerspective: {
      adminView: 'Inspect all student enrollments, search by student name or course, view granular completion progress (e.g. 78%), or manually enroll a student.',
      studentView: 'Students see their enrolled courses displayed on their My Learning dashboard (/student) with progress bars and continue buttons.'
    },
    entities: [
      { name: 'Student Identity', type: 'User Persona', description: 'Full name, email address, and avatar initials.', lifecycle: 'Created upon user signup.' },
      { name: 'Enrolled Course', type: 'Course Reference', description: 'Course name and code assigned to this student.', lifecycle: 'Assigned on enrollment.' },
      { name: 'Progress Percentage', type: 'Dynamic Metric (0-100%)', description: 'Real-time calculation based on completed lessons, video watch time, and passed quizzes.', lifecycle: 'Updated on each lesson completion.' },
      { name: 'Enrollment Status', type: 'State Enum', description: 'Active (currently studying) or Completed (graduated, certificate unlocked).', lifecycle: 'Active -> Completed.' },
      { name: 'Enrolled Timestamp', type: 'Date', description: 'Exact date and time access was granted.', lifecycle: 'Immutable log.' }
    ],
    actions: [
      { label: 'Manual Enroll Student', variant: 'primary', description: 'Grants instant course access to a student without payment.', destination: 'Enroll Modal' },
      { label: 'Filter by Course', variant: 'secondary', description: 'Filters student list by specific curriculum cohort.', destination: 'Dropdown filter' },
      { label: 'Search Learner', variant: 'input', description: 'Real-time search by student name or email address.', destination: 'Search input' }
    ],
    userJourney: [
      { step: 1, title: 'Enrollment Verification', description: 'Admin verifies an enterprise student has been assigned Advanced Management.' },
      { step: 2, title: 'Progress Tracking', description: 'Admin observes student is at 80% progress and passed module 4 quiz.' },
      { step: 3, title: 'Graduation Trigger', description: 'Student completes final module; status transitions to Completed automatically.' }
    ]
  },

  {
    id: 'admin-payments',
    title: 'Payment Records & Automated Invoice Reconciliation',
    group: 'OPERATIONS',
    role: 'both',
    liveRoute: '/admin/payments',
    icon: 'CreditCard',
    summary: 'Audit log of all financial transactions across Stripe, PayPal, Razorpay, and Local payment rails, including discounts, net amounts, and downloadable tax invoices.',
    problemSolved: 'Replaces messy payment gateway dashboards. Harmonizes disparate payment gateways into a unified ledger with zero billing reconciliation lag and automatic downloadable tax invoices.',
    dualPerspective: {
      adminView: 'Inspect global revenue, filter by gateway or payment status (Paid, Pending, Refunded), audit discounts, and view transaction receipts.',
      studentView: 'Students access /student/payments to inspect personal transactions, download official PDF invoices, and verify coupon discounts.'
    },
    entities: [
      { name: 'Invoice Number', type: 'Audit Key', description: 'Sequential fiscal reference (e.g. INV-2024-001).', lifecycle: 'Generated on checkout.' },
      { name: 'Payment Gateway', type: 'Processor Enum', description: 'Stripe (Cards), PayPal, Razorpay (UPI), or Local (bKash/Nagad).', lifecycle: 'Selected at checkout.' },
      { name: 'Transaction ID', type: 'Cryptographic String', description: 'Processor confirmation session ID (e.g. stripe_txn_abc123).', lifecycle: 'Recorded from gateway webhook.' },
      { name: 'Subtotal & Net Paid', type: 'Financial Amounts', description: 'Original tuition fee, coupon discount subtracted, and final charged amount.', lifecycle: 'Calculated at payment.' },
      { name: 'Coupon Applied', type: 'Promo Code', description: 'The discount code used to reduce payment (or null).', lifecycle: 'Recorded from cart state.' },
      { name: 'Transaction Status', type: 'State Enum', description: 'Paid, Pending Webhook Settlement, or Refunded.', lifecycle: 'Pending -> Paid.' }
    ],
    actions: [
      { label: 'View / Download Invoice', variant: 'secondary', description: 'Opens full-page printable invoice with itemized line items and tax details.', destination: 'Invoice Modal' },
      { label: 'Filter by Gateway', variant: 'ghost', description: 'Isolates payments processed via Stripe vs PayPal vs Local rails.', destination: 'Filter tabs' },
      { label: 'Search Transaction', variant: 'input', description: 'Searches by invoice number, learner name, or transaction hash.', destination: 'Search bar' }
    ],
    userJourney: [
      { step: 1, title: 'Tuition Payment', description: 'Student checks out using Stripe credit card with WELCOME20 coupon.' },
      { step: 2, title: 'Instant Ledger Update', description: 'System records $149 paid, generates INV-2024-002, and logs discount.' },
      { step: 3, title: 'Invoice Access', description: 'Student and Admin can view and download the official tax invoice at any time.' }
    ]
  },

  {
    id: 'admin-certificates',
    title: 'Certificate Registry & Public Verification Engine',
    group: 'OPERATIONS',
    role: 'both',
    liveRoute: '/admin/certificates',
    icon: 'Award',
    summary: 'Master registry of all issued credentials, verification codes, issuing timestamps, and instant online cryptographic validation.',
    problemSolved: 'Eliminates credential fraud and delays. When a student completes a course, their certificate is instantly generated, signed with a unique verification code, and publicly verifiable online by employers.',
    dualPerspective: {
      adminView: 'Inspect all issued credentials, search by verification code, audit issuing dates, revoke credentials if required, and test public verification links.',
      studentView: 'Students access /student/certificates to view earned awards, download certificate PDFs, or share public verification URLs (/verify/:code).'
    },
    entities: [
      { name: 'Verification Code', type: 'Security Token', description: 'Unique alphanumeric credential hash (e.g. CERT-LMS-2024-001).', lifecycle: 'Generated on course completion.' },
      { name: 'Recipient Learner', type: 'User Persona', description: 'Student full name and authenticated identity.', lifecycle: 'Baked into certificate artifact.' },
      { name: 'Curriculum Certified', type: 'Course Reference', description: 'Name of the completed course and credit hours.', lifecycle: 'Linked to course record.' },
      { name: 'Issued Timestamp', type: 'Date', description: 'Official date the credential was awarded.', lifecycle: 'Immutable date.' },
      { name: 'Authenticity Status', type: 'Validation State', description: 'Verified (Valid Credential) or Revoked.', lifecycle: 'Verified -> Revoked (if needed).' }
    ],
    actions: [
      { label: 'Verify Online (Public Link)', variant: 'secondary', description: 'Opens public verification portal (/verify/:code) showing official credential proof.', destination: '/verify/:code' },
      { label: 'Download Certificate Artifact', variant: 'primary', description: 'Downloads client-side certificate document with official seal and code.', destination: 'File download' },
      { label: 'Search by Code', variant: 'input', description: 'Instant lookup by student name or verification code.', destination: 'Search input' }
    ],
    userJourney: [
      { step: 1, title: 'Curriculum Completion', description: 'Student finishes 100% of lessons and passes required milestone assignments.' },
      { step: 2, title: 'Automated Issuance', description: 'Platform generates CERT-LMS-2024-001 and awards certificate to student profile.' },
      { step: 3, title: 'Employer Verification', description: 'Employer visits /verify/CERT-LMS-2024-001 and sees instant cryptographic validation.' }
    ]
  },

  {
    id: 'admin-reports',
    title: 'Platform Reports & Analytics Intelligence',
    group: 'OPERATIONS',
    role: 'admin',
    liveRoute: '/admin/reports',
    icon: 'BarChart3',
    summary: 'Executive reporting dashboard tracking learner retention, drop-off rates, revenue trends, completion speed, and CSV export capabilities.',
    problemSolved: 'Replaces guessing with empirical metrics. Pinpoints which lessons cause student drop-offs and tracks monthly revenue growth across curriculum categories.',
    dualPerspective: {
      adminView: 'View revenue charts, course completion rates, cohort progress comparisons, and export CSV audit data.',
      studentView: 'Students do not see platform reports; their personal progress is reflected cleanly in their profile metrics.'
    },
    entities: [
      { name: 'Revenue Growth (%)', type: 'Trend Metric', description: 'Month-over-month tuition revenue comparison.', lifecycle: 'Recalculated monthly.' },
      { name: 'Average Completion Rate (%)', type: 'Engagement Metric', description: 'Percentage of enrolled students who complete all modules.', lifecycle: 'Aggregated across courses.' },
      { name: 'Drop-off Analysis', type: 'Curriculum Metric', description: 'Identifies lessons with highest incomplete rates for instructional revision.', lifecycle: 'Updated on lesson exits.' },
      { name: 'Exportable CSV Data', type: 'Data File', description: 'Raw operational, student, and payment data formatted for BI tools.', lifecycle: 'Generated on export request.' }
    ],
    actions: [
      { label: 'Export Audit Data (CSV)', variant: 'primary', description: 'Downloads full student, course, and payment data formatted for Excel or Tableau.', destination: 'CSV download' },
      { label: 'Filter Date Range', variant: 'secondary', description: 'Customizes date window (Last 7 days, 30 days, Year to Date).', destination: 'Date picker' }
    ],
    userJourney: [
      { step: 1, title: 'Monthly Executive Review', description: 'Administrator opens Reports to examine student retention and monthly revenue.' },
      { step: 2, title: 'Curriculum Optimization', description: 'Observes Lesson 4 in Web Dev has lower completion; instructs author to add video.' },
      { step: 3, title: 'Stakeholder Reporting', description: 'Clicks Export CSV to generate financial report for platform stakeholders.' }
    ]
  },

  {
    id: 'admin-settings',
    title: 'Platform System Settings & Integration Hub',
    group: 'SYSTEM',
    role: 'admin',
    liveRoute: '/admin/settings',
    icon: 'Settings',
    summary: 'System configuration console managing organization branding, payment gateway API keys, webhook endpoints, email SMTP, and demo data reset.',
    problemSolved: 'Centralizes platform maintenance. Allows administrators to switch between Test and Live payment modes, customize branding, and restore sample data with a single click.',
    dualPerspective: {
      adminView: 'Configure platform name, support email, Stripe publishable keys, webhook secret tokens, and toggle sandbox mode.',
      studentView: 'Students experience the configured branding, support contacts, and live payment processing.'
    },
    entities: [
      { name: 'Platform Name & Logo', type: 'Branding', description: 'Organization name displayed in sidebar, headers, and certificates.', lifecycle: 'Configured by admin.' },
      { name: 'Payment Environment', type: 'Mode Enum', description: 'Sandbox / Test Mode vs Live Production Processing.', lifecycle: 'Toggled in settings.' },
      { name: 'Webhook Endpoint URL', type: 'Integration', description: 'Target destination for Stripe and PayPal payment confirmation pings.', lifecycle: 'Registered with processor.' },
      { name: 'Demo Data State', type: 'Database State', description: 'Sample courses, students, submissions, and payments.', lifecycle: 'Can be reset at any time.' }
    ],
    actions: [
      { label: 'Save Configuration', variant: 'primary', description: 'Persists branding, integration keys, and payment settings.', destination: 'Local storage save' },
      { label: 'Reset Demo Data', variant: 'danger', description: 'Restores default sample courses, students, discussions, and certificates.', destination: 'Context reset' }
    ],
    userJourney: [
      { step: 1, title: 'Initial Branding', description: 'Admin enters Training LMS and support email: support@traininglms.com.' },
      { step: 2, title: 'Gateway Connection', description: 'Enters Stripe test API keys and verifies webhook connectivity.' },
      { step: 3, title: 'Demo Testing', description: 'Simulates sample purchases, then uses Reset Demo Data when testing completes.' }
    ]
  },

  // ── STUDENT VIEW ──
  {
    id: 'student-dashboard',
    title: 'Student Learning Dashboard (My Learning)',
    group: 'STUDENT VIEW',
    role: 'student',
    liveRoute: '/student',
    icon: 'LayoutDashboard',
    summary: 'The primary workspace for enrolled students displaying in-progress courses, progress meters, upcoming assignment deadlines, and quick certificate links.',
    problemSolved: 'Eliminates friction in continuing studies. Students instantly see exactly which lesson they left off on, how many days remain for assignments, and their graduation certificates.',
    dualPerspective: {
      adminView: 'Admins monitor this student activity aggregated across all courses in the executive dashboard and enrollment records.',
      studentView: 'Personal student cockpit: cards for in-progress courses with one-click "Continue Learning", upcoming homework deadlines, and earned diplomas.'
    },
    entities: [
      { name: 'In-Progress Courses', type: 'Card List', description: 'Enrolled courses with thumbnail, category badge, and percentage completed.', lifecycle: '0% -> 100% completed.' },
      { name: 'Progress Bar (%)', type: 'Visual Meter', description: 'Completed lessons and passed quizzes relative to total curriculum.', lifecycle: 'Advances on lesson completions.' },
      { name: 'Upcoming Deadlines', type: 'Timeline List', description: 'Assignments requiring submission with due dates and countdown timer.', lifecycle: 'Due today -> Overdue -> Submitted.' },
      { name: 'Recent Certificates', type: 'Award List', description: 'Earned certificates ready for instant download and verification.', lifecycle: 'Populates on graduation.' }
    ],
    actions: [
      { label: 'Continue Learning', variant: 'primary', description: 'Launches full-screen Course Player directly into the active lesson.', destination: '/student/learn/:courseId' },
      { label: 'View All Assignments', variant: 'secondary', description: 'Navigates to student coursework submission hub.', destination: '/student/assignments' },
      { label: 'Download Certificate', variant: 'ghost', description: 'Downloads client-side verified certificate artifact.', destination: 'File download' }
    ],
    userJourney: [
      { step: 1, title: 'Student Login', description: 'Ava Thompson opens /student and sees Leadership Fundamentals is at 45%.' },
      { step: 2, title: 'Deadline Check', description: 'Notices "Quarterly Strategy Pitch" assignment is due in 3 days.' },
      { step: 3, title: 'Resume Coursework', description: 'Clicks Continue Learning to resume the next video lecture.' }
    ]
  },

  {
    id: 'student-assignments',
    title: 'Student Assignment Submission Hub',
    group: 'STUDENT VIEW',
    role: 'student',
    liveRoute: '/student/assignments',
    icon: 'ClipboardCheck',
    summary: 'Dedicated assignment management interface for students to download project briefs, upload coursework files, inspect submissions, and review instructor grades.',
    problemSolved: 'Eliminates submission ambiguity. Students receive instant format validation (e.g. PDF/DOCX), submission timestamps, preview access, and instructor score breakdown.',
    dualPerspective: {
      adminView: 'Instructors grade these submissions in the Assignment Grading studio (/admin/assignments) and provide feedback.',
      studentView: 'Students download teacher briefs, upload coursework, track grading status (Graded vs Pending Review), and view instructor recommendations.'
    },
    entities: [
      { name: 'Coursework Title', type: 'Project Name', description: 'Project name, course code, and objective.', lifecycle: 'Defined by instructor.' },
      { name: 'Project Brief', type: 'Teacher Artifact', description: 'Official specification document with full project instructions.', lifecycle: 'Downloadable by student.' },
      { name: 'Due Date Status', type: 'Countdown', description: 'Due today, x days remaining, or Overdue warning.', lifecycle: 'Calculated from deadline.' },
      { name: 'Submission Artifact', type: 'Uploaded File', description: 'Student submitted file with size, timestamp, and preview launcher.', lifecycle: 'Uploaded via FileReader.' },
      { name: 'Grade & Feedback', type: 'Evaluation', description: 'Earned score (e.g. 95/100) and instructor written recommendations.', lifecycle: 'Visible once graded.' }
    ],
    actions: [
      { label: 'View Brief', variant: 'secondary', description: 'Opens DocumentViewerModal to inspect project specifications and rubric.', destination: 'DocumentViewerModal' },
      { label: 'Upload File & Submit', variant: 'primary', description: 'Selects file, validates format, inputs optional student note, and submits.', destination: 'Upload form' },
      { label: 'View File (Submission)', variant: 'ghost', description: 'Launches DocumentViewerModal to verify submitted coursework.', destination: 'DocumentViewerModal' },
      { label: 'Resubmit', variant: 'secondary', description: 'Allows uploading revised coursework before final grading.', destination: 'Upload form' }
    ],
    userJourney: [
      { step: 1, title: 'Inspect Rubric', description: 'Student clicks View Brief to study project requirements in the document viewer.' },
      { step: 2, title: 'File Upload', description: 'Selects strategy_pitch.pdf; system verifies PDF extension and stores artifact.' },
      { step: 3, title: 'Submission Confirmation', description: 'Green alert confirms submission; status updates to Submitted.' },
      { step: 4, title: 'Grade Review', description: 'Later, student views score 95/100 and reads instructor feedback.' }
    ]
  },

  {
    id: 'student-catalog',
    title: 'Public Course Catalog & Enrollment Directory',
    group: 'STUDENT VIEW',
    role: 'student',
    liveRoute: '/courses',
    icon: 'BookOpen',
    summary: 'Public course marketplace where students discover courses, filter by category and skill level, view syllabus previews, and proceed to checkout.',
    problemSolved: 'Drives student acquisition. Delivers a storefront with real-time course search, rating badges, instructor credentials, and direct checkout integration.',
    dualPerspective: {
      adminView: 'Admins curate this catalog by publishing courses and setting promotional pricing in Course Management.',
      studentView: 'Prospective and enrolled learners browse courses, inspect syllabus details, and enroll.'
    },
    entities: [
      { name: 'Course Card', type: 'Directory Item', description: 'Cover image, course code, title, instructor name, and star rating.', lifecycle: 'Rendered from catalog.' },
      { name: 'Curriculum Highlights', type: 'Summary', description: 'Lesson count, estimated duration (hours), and certificate badge.', lifecycle: 'Derived from lessons.' },
      { name: 'Price & Promo Badge', type: 'Pricing', description: 'Course tuition fee with discount flags.', lifecycle: 'Configured by admin.' }
    ],
    actions: [
      { label: 'View Details', variant: 'secondary', description: 'Opens full landing page with syllabus, instructor bio, and reviews.', destination: '/course/:slug' },
      { label: 'Enroll Now', variant: 'primary', description: 'Jumps directly to secure multi-gateway checkout page.', destination: '/checkout/:courseId' }
    ],
    userJourney: [
      { step: 1, title: 'Catalog Search', description: 'Student searches for "Leadership" and filters by Advanced level.' },
      { step: 2, title: 'Review Inspection', description: 'Clicks course card to inspect curriculum syllabus and 5-star student reviews.' },
      { step: 3, title: 'Enrollment Launch', description: 'Clicks Enroll Now to proceed to checkout.' }
    ]
  },

  {
    id: 'student-payments',
    title: 'Student Payment History & Tax Invoices',
    group: 'STUDENT VIEW',
    role: 'student',
    liveRoute: '/student/payments',
    icon: 'CreditCard',
    summary: 'Personal billing ledger where students inspect tuition payments, view applied coupon discounts, and download printable tax invoices.',
    problemSolved: 'Eliminates billing support inquiries. Students can download corporate expense receipts and verify their promotional discount codes independently.',
    dualPerspective: {
      adminView: 'Admins reconcile these same payments globally in the administrative Payment Records ledger.',
      studentView: 'Students view personal payments, invoice numbers (INV-2024-001), payment gateway used, and download PDF receipts.'
    },
    entities: [
      { name: 'Invoice Reference', type: 'Legal Key', description: 'Sequential invoice number generated upon checkout.', lifecycle: 'Issued on payment.' },
      { name: 'Course Enrolled', type: 'Product', description: 'Course purchased in this billing transaction.', lifecycle: 'Linked to course.' },
      { name: 'Gross & Discount', type: 'Amounts', description: 'Original price, coupon code applied (e.g. WELCOME20), and savings.', lifecycle: 'Audited at payment.' },
      { name: 'Paid Total ($)', type: 'Charged Total', description: 'Final settled amount charged to student payment method.', lifecycle: 'Reconciled via gateway.' }
    ],
    actions: [
      { label: 'Download Invoice', variant: 'secondary', description: 'Opens full-page printable invoice with company tax registration.', destination: 'Invoice Modal' }
    ],
    userJourney: [
      { step: 1, title: 'Corporate Reimbursement', description: 'Student needs receipt to submit for employer tuition reimbursement.' },
      { step: 2, title: 'Invoice Download', description: 'Opens Payment History, clicks Download Invoice, and prints official tax receipt.' }
    ]
  },

  {
    id: 'student-certificates',
    title: 'Student Earned Credentials & Certificates',
    group: 'STUDENT VIEW',
    role: 'student',
    liveRoute: '/student/certificates',
    icon: 'Award',
    summary: 'Personal credential locker where students view completed degrees, download high-resolution certificates, and share public verification links.',
    problemSolved: 'Provides permanent, verifiable proof of skills. Students can instantly showcase certified credentials on LinkedIn or provide verification links to employers.',
    dualPerspective: {
      adminView: 'Admins audit global issued credentials and verify codes in the Certificate Registry.',
      studentView: 'Students celebrate graduation milestones, download official certificate artifacts, and verify credentials.'
    },
    entities: [
      { name: 'Certificate Title', type: 'Credential', description: 'Official credential award linked to completed curriculum.', lifecycle: 'Awarded at 100% completion.' },
      { name: 'Verification Code', type: 'Hash', description: 'Unique code (e.g. CERT-LMS-2024-001) for employer validation.', lifecycle: 'Generated on completion.' },
      { name: 'Issue Date', type: 'Date', description: 'Formal graduation date.', lifecycle: 'Immutable log.' }
    ],
    actions: [
      { label: 'Download PDF Certificate', variant: 'primary', description: 'Downloads client-side signed credential document.', destination: 'File download' },
      { label: 'Verify Online', variant: 'secondary', description: 'Opens public verification portal showing certified proof.', destination: '/verify/:code' }
    ],
    userJourney: [
      { step: 1, title: 'Graduation Trigger', description: 'Student completes final module; diploma unlocked notification fires.' },
      { step: 2, title: 'Certificate Download', description: 'Student downloads credential file with official code and seal.' },
      { step: 3, title: 'Career Sharing', description: 'Copies online verification link and adds to resume and LinkedIn profile.' }
    ]
  },

  {
    id: 'student-profile',
    title: 'Student Profile & Account Management',
    group: 'STUDENT VIEW',
    role: 'student',
    liveRoute: '/student/profile',
    icon: 'User',
    summary: 'Student personal settings managing profile avatar, contact details, learning stats summary, and earned credential history.',
    problemSolved: 'Gives learners complete ownership of their identity, avatar appearance, and personal learning records in compliance with privacy standards.',
    dualPerspective: {
      adminView: 'Instructors see student avatars and names in submissions and discussion threads.',
      studentView: 'Students update their full name, bio, profile photo, and review their enrolled course history.'
    },
    entities: [
      { name: 'Full Name & Email', type: 'Identity', description: 'Student personal name and login contact address.', lifecycle: 'Editable by student.' },
      { name: 'Avatar Image', type: 'Image Asset', description: 'Profile picture shown across discussions and assignments.', lifecycle: 'Uploaded via FileReader.' },
      { name: 'Learning Statistics', type: 'Summary', description: 'Completed courses count, total study hours, and earned certificates.', lifecycle: 'Aggregated live.' }
    ],
    actions: [
      { label: 'Upload Avatar', variant: 'secondary', description: 'Uploads personal photo with client-side image validation.', destination: 'File input' },
      { label: 'Save Changes', variant: 'primary', description: 'Persists profile information across student layout.', destination: 'Context update' }
    ],
    userJourney: [
      { step: 1, title: 'Profile Setup', description: 'Student updates name to Ava Thompson and uploads professional avatar.' },
      { step: 2, title: 'Persistence', description: 'New avatar and initials appear instantly in topbar, sidebar, and discussion threads.' }
    ]
  },

  {
    id: 'course-player',
    title: 'Learning Player & Interactive Lesson Studio',
    group: 'STUDENT VIEW',
    role: 'student',
    liveRoute: '/student',
    icon: 'Play',
    summary: 'Full-screen immersive learning player supporting Video, Audio podcast streaming, Slide presentations, Reading articles, Checklists, and Quizzes with right answer revelation.',
    problemSolved: 'Replaces boring passive video players. Delivers active learning with interactive slides, task checklists, and immediate quiz feedback that highlights correct answers and explains mistakes.',
    dualPerspective: {
      adminView: 'Curated and published in the Curriculum Authoring Studio (/admin/courses/:id/author).',
      studentView: 'Immersive full-screen environment: sidebar curriculum navigation, video player with playback speeds, presentation slides, and knowledge quizzes.'
    },
    entities: [
      { name: 'Curriculum Sidebar', type: 'Lesson Index', description: 'Collapsible section tree with checkmark completion indicators.', lifecycle: 'Updates as lessons finish.' },
      { name: 'Video Player', type: 'Media Stream', description: 'HTML5 video player with scrubber, volume, and playback speed controls.', lifecycle: 'Tracks watch progress.' },
      { name: 'Slide Deck Viewer', type: 'Presentation', description: 'Interactive presentation slides with forward/backward navigation and notes.', lifecycle: 'Slide 1 of N.' },
      { name: 'Knowledge Quiz', type: 'Assessment', description: 'Multiple choice questions with passing score threshold (e.g. 70%).', lifecycle: 'Unsubmitted -> Graded.' },
      { name: 'Right Answer Display', type: 'Educational Feedback', description: 'Emerald green highlight for correct answers; red highlight for wrong student choices with explanation.', lifecycle: 'Revealed on quiz submission.' }
    ],
    actions: [
      { label: 'Submit Answers & Grade', variant: 'primary', description: 'Calculates quiz score, evaluates passing standard, and reveals correct answers.', destination: 'Quiz evaluation' },
      { label: 'Retake Quiz', variant: 'secondary', description: 'Resets quiz answers to allow student to study and achieve passing score.', destination: 'Quiz reset' },
      { label: 'Mark Lesson Completed', variant: 'success', description: 'Records lesson completion, updates course progress, and advances to next lesson.', destination: 'Progress update' }
    ],
    userJourney: [
      { step: 1, title: 'Watch Video Lesson', description: 'Student watches Lesson 1 video and follows along with slide deck.' },
      { step: 2, title: 'Take Knowledge Quiz', description: 'Answers 2 questions and clicks Submit Answers & Grade.' },
      { step: 3, title: 'Review Correct Answers', description: 'System shows 100% score with green correct answer badges and explanations.' },
      { step: 4, title: 'Advance Curriculum', description: 'Clicks Mark Lesson Completed and advances seamlessly to Lesson 2.' }
    ]
  }
];
