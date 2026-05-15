# Fuzzy Logic Imaging Critique System
## Client Requirements Questionnaire

**Project**: Radiograph Student Evaluation with Fuzzy Logic Analysis  
**Client**: Medical University  
**Date**: May 15, 2026  
**Version**: 1.0

---

## Purpose

This questionnaire gathers critical requirements for implementing a fuzzy logic system to evaluate radiograph image critique accuracy (Section 6 of the evaluation form). The system will combine automated image analysis, student self-assessment, and assessor feedback to provide consistent, data-driven evaluation.

---

## Instructions

1. **For Client**: Please complete all sections or mark "TBD" if unknown
2. **For Development Team**: Use responses to finalize scope, technical stack, and timeline
3. **Review Cycle**: Schedule follow-up meeting after client completes this form
4. **Sign-Off**: Client and team lead approve final requirements

---

## Section 1: Data & Historical Records

### 1.1 Historical Evaluation Data
**Q: Do you have historical evaluation records (student + assessor scores) from past cohorts?**

- [ ] Yes, we have digital records
- [ ] Yes, but mostly paper archives
- [ ] Limited records (< 20 evaluations)
- [ ] No historical data available

**If yes, how many records?** _________ evaluations

**Preferred format?**
- [ ] Excel/CSV
- [ ] Database export (SQL)
- [ ] PDF scans
- [ ] Other: _____________

**Date range of available data:** From _________ To _________

**Client Notes:**
```
[Leave space for detailed response]




```

### 1.2 Data Anonymization & Access
**Q: Can historical evaluation data be anonymized and shared for model training?**

- [ ] Yes, can anonymize completely
- [ ] Yes, but with restricted access to development team only
- [ ] Need institutional approval/IRB review first
- [ ] Data sensitivity prevents sharing

**Data ownership/privacy requirements:**
```
[Client should describe any institutional policies]




```

---

## Section 2: Image Management

### 2.1 Current Image Storage
**Q: Where are X-ray images currently stored?**

- [ ] Hospital PACS system
- [ ] Local server (on-campus)
- [ ] Students' personal devices
- [ ] Cloud storage (specify: _____________)
- [ ] No centralized system yet
- [ ] Other: _____________

**Can images be exported from current system?**
- [ ] Yes, easily
- [ ] Yes, with some restrictions
- [ ] No, system prevents export
- [ ] Unknown

### 2.2 Supported Image Formats
**Q: Which image formats should the system accept?**

- [ ] PNG (preferred)
- [ ] JPG/JPEG (preferred)
- [ ] DICOM (medical imaging standard)
- [ ] All of the above
- [ ] Other: _____________

**Q: Maximum file size acceptable per image?**
- [ ] 5 MB
- [ ] 10 MB
- [ ] 20 MB
- [ ] Other: _________ MB

### 2.3 Image Storage & Retention
**Q: Should the system store original images long-term?**

- [ ] Yes, archive all images permanently
- [ ] Yes, archive for 1 year then delete
- [ ] Yes, archive for 3 years then delete
- [ ] No, extract metrics then delete immediately
- [ ] Other policy: _____________

**Q: Who should have access to uploaded images?**

- [ ] Assessors only
- [ ] Assessors + Admin
- [ ] Assessors + Admin + Student (their own)
- [ ] Entire department
- [ ] Other: _____________

**Client Notes on Image Workflow:**
```
[Describe how students/supervisors will obtain and upload images]




```

---

## Section 3: Fuzzy Logic Workflow & Design

### 3.1 Preferred Workflow
**Q: Which approach best fits your workflow?**

**Option A: Auto-Extract + Manual Assessment**
- AI automatically extracts objective metrics from image (kolimasi, artifacts, etc.)
- Assessor manually scores subjective criteria (contrast appropriateness, positioning)
- Fuzzy system compares all scores

**Option B: Manual Scoring Only**
- Student manually scores all criteria
- Assessor manually scores all criteria
- Fuzzy system compares student vs. assessor accuracy

**Option C: Hybrid (Auto + AI Scoring)**
- AI extracts objective metrics
- AI also estimates subjective scores
- Fuzzy system compares student vs. (auto + assessor) scores

**Your preference:**
- [ ] Option A (Auto-Extract + Manual)
- [ ] Option B (Manual Only)
- [ ] Option C (Hybrid with dual AI)
- [ ] Custom approach: _____________

**Rationale:** (Why this approach?)
```




```

### 3.2 Fuzzy Output & Display
**Q: What should assessors see from fuzzy results?**

- [ ] Numeric score only (0-100)
- [ ] Category only (Poor/Fair/Good/Excellent)
- [ ] Both numeric + category
- [ ] Detailed rule breakdown (which rules fired, why)
- [ ] Recommendation (retake: Yes/Maybe/No)
- [ ] All of the above
- [ ] Other: _____________

### 3.3 Assessor Override & Control
**Q: If fuzzy result contradicts assessor's judgment, what should happen?**

- [ ] Assessor can override fuzzy recommendation freely
- [ ] System asks assessor to confirm/explain override
- [ ] Fuzzy is reference only; assessor final decision always
- [ ] Fuzzy result mandatory; assessor cannot override
- [ ] Other: _____________

### 3.4 Data Storage
**Q: Should fuzzy results be stored in the evaluation record?**

- [ ] Yes, store for audit trail + analytics
- [ ] Yes, but only store final recommendation (not intermediate data)
- [ ] No, compute on-demand but don't persist
- [ ] Other: _____________

**Client Notes on Fuzzy Design:**
```
[Additional comments on workflow preferences]




```

---

## Section 4: Crisp Input Extraction (Auto-Scoring)

### 4.1 Which Criteria to Auto-Extract
**Q: Which Section 6 criteria should be automatically extracted from images?**

For each criterion below, choose whether it should be auto-extracted and how important it is.

**Identifikasi** (marker/ID detection)
- [ ] Yes
- [ ] No
- [ ] Maybe
- Priority:
	- [ ] High
	- [ ] Medium
	- [ ] Low

**Penanda** (marker placement accuracy)
- [ ] Yes
- [ ] No
- [ ] Maybe
- Priority:
	- [ ] High
	- [ ] Medium
	- [ ] Low

**Kawasan Dedahan** (exposed area boundaries)
- [ ] Yes
- [ ] No
- [ ] Maybe
- Priority:
	- [ ] High
	- [ ] Medium
	- [ ] Low

**Kolimasi** (collimation sharpness)
- [ ] Yes
- [ ] No
- [ ] Maybe
- Priority:
	- [ ] High
	- [ ] Medium
	- [ ] Low

**Kontras** (brightness/histogram level)
- [ ] Yes
- [ ] No
- [ ] Maybe
- Priority:
	- [ ] High
	- [ ] Medium
	- [ ] Low

**Artifak** (artifacts/dust/defects)
- [ ] Yes
- [ ] No
- [ ] Maybe
- Priority:
	- [ ] High
	- [ ] Medium
	- [ ] Low

**Projeksi** (AP vs. PA vs. Lateral detection)
- [ ] Yes
- [ ] No
- [ ] Maybe
- Priority:
	- [ ] High
	- [ ] Medium
	- [ ] Low

**Other criteria not listed?** _____________

### 4.2 Extraction Method & Accuracy Trade-off
**Q: What extraction method is acceptable?**

| Method | Accuracy | Cost | Time to Implement |
|--------|----------|------|-------------------|
| **Pure Code (OpenCV)** | 70-80% | Free | 1-2 weeks |
| **AI Vision API** (Google/Azure) | 85-90% | $1-5/image | 1 week |
| **Custom ML Model** | 90%+ | Free (post-training) | 4-8 weeks |

**Your preference:**
- [ ] Pure Code (fastest, free, lower accuracy)
- [ ] AI Vision API (balanced cost/accuracy)
- [ ] Custom ML Model (best accuracy, longer timeline)
- [ ] Depends on cost (price limit: $_______ per image)
- [ ] No preference, recommend what you think best

**Acceptable accuracy threshold?** _______ %

(Fuzzy system should match assessor judgment at least this often)

### 4.3 Auto-Extraction Corrections
**Q: If auto-extraction is inaccurate, how should assessor correct it?**

- [ ] Edit numeric value in text box
- [ ] Select from dropdown (1=Poor, 2=Fair, 3=Good, etc.)
- [ ] Slider adjustment
- [ ] Assessor manually scores instead; AI ignored
- [ ] Other: _____________

**Client Notes on Extraction:**
```
[Any concerns about auto-extraction? Domain-specific knowledge needed?]




```

---

## Section 5: Integration & Technical Deployment

### 5.1 System Integration
**Q: Should this integrate with existing systems?**

- [ ] Standalone system (independent)
- [ ] Integrate with current LMS (Moodle, Canvas, etc.)
- [ ] Integrate with hospital PACS
- [ ] Integrate with student records database
- [ ] Other integrations: _____________

**Existing system details:**
```
[Describe current infrastructure, if any]




```

### 5.2 Deployment Location & Infrastructure
**Q: Where should the system be hosted?**

- [ ] Your on-campus server (you provide hardware)
- [ ] Your cloud account (AWS, Azure, Google Cloud)
- [ ] Our managed cloud hosting (recommend: Vercel/AWS)
- [ ] Hybrid (images local, processing cloud)
- [ ] Other: _____________

**Current IT infrastructure:**
```
[Describe servers, databases, network capacity]




```

**Can hospital IT accommodate new web application?**
- [ ] Yes, no issues
- [ ] Yes, but requires security review/approval
- [ ] Uncertain, need to check with IT department
- [ ] No, restricted network environment

### 5.3 Timeline & Phases
**Q: What's your preferred implementation timeline?**

- [ ] Pilot with 1-2 assessors (2-4 weeks)
- [ ] Full department rollout (2-3 months)
- [ ] Phased rollout (pilot → full over 6 months)
- [ ] Timeline flexible; quality more important than speed
- [ ] Specific deadline: _____________

**Preferred phases:**
```
Phase 1: [e.g., manual assessment + fuzzy comparison]
Phase 2: [e.g., add image auto-extraction]
Phase 3: [e.g., analytics dashboard]
```

### 5.4 Data Ownership & Licensing
**Q: Data and system ownership:**

- [ ] University owns all data, system, and trained models
- [ ] Shared ownership with development team
- [ ] Development team retains licensing for reuse on other projects
- [ ] Other: _____________

**For fuzzy rules/trained models:**
- [ ] University owns trained model (cannot be reused elsewhere)
- [ ] Development team can use rules for research/publication
- [ ] Models must be university-proprietary
- [ ] Flexible, discuss later

---

## Section 6: Privacy, Compliance & Security

### 6.1 Image Content
**Q: Are these real patient X-rays or practice/dummy images?**

- [ ] Real patient images (requires privacy protection)
- [ ] Anonymized patient images (stripped of identifiers)
- [ ] Student practice/dummy images (lower privacy concern)
- [ ] Mix of real and practice

### 6.2 Regulatory Compliance
**Q: Which regulatory standards apply?**

- [ ] HIPAA (US healthcare)
- [ ] GDPR (EU data protection)
- [ ] Local institutional policy
- [ ] Hospital accreditation standards
- [ ] None specified
- [ ] Other: _____________

**Compliance requirements:**
```
[Describe specific audit/security requirements]




```

### 6.3 Institutional Review
**Q: Does this project require approval before implementation?**

- [ ] Yes, IRB review required
- [ ] Yes, Ethics committee review required
- [ ] Yes, Hospital IT security review required
- [ ] No formal approval needed
- [ ] Uncertain, need to check with department

**Expected approval timeline:** _________ weeks

### 6.4 Data Security
**Q: Security requirements:**

- [ ] Encrypted data at rest
- [ ] Encrypted data in transit (HTTPS/TLS)
- [ ] Access control (login required, role-based)
- [ ] Audit logging (track who accesses what)
- [ ] All of the above
- [ ] Other: _____________

### 6.5 Data Retention & Deletion
**Q: Image retention policy:**

- [ ] Delete immediately after extraction (no storage)
- [ ] Keep for 1 semester, then auto-delete
- [ ] Keep for 1 year, then auto-delete
- [ ] Archive permanently
- [ ] Other: _____________

**Student access to own data?**
- [ ] Yes, students can view their evaluations + feedback
- [ ] Yes, but only after final grading
- [ ] No, assessor confidentiality required
- [ ] Other: _____________

**Client Notes on Privacy:**
```
[Any institutional policies or concerns?]




```

---

## Section 7: Assessor Experience & Adoption

### 7.1 Number of Users
**Q: How many assessors will use this system?**

**Pilot phase:** _________ assessors

**Full deployment:** _________ assessors

**Additional users (admin, supervisors):** _________

### 7.2 Assessor Familiarity with AI/Fuzzy Logic
**Q: What's assessors' background with fuzzy logic?**

- [ ] Experts (understand FIS, membership functions, rules)
- [ ] Knowledgeable (understand basic concepts)
- [ ] Minimal knowledge (need training)
- [ ] No background at all (black box acceptable)

**Training needs?**
- [ ] Yes, full training required
- [ ] Yes, brief orientation sufficient
- [ ] No, can learn via UI
- [ ] Other: _____________

### 7.3 Fuzzy Output Presentation
**Q: How detailed should fuzzy explanations be?**

**Simple:** "Your fuzzy score: 72/100 (Good)"

**Detailed:** "Fuzzy score: 72/100 (Good) because: identifikasi accurate, kolimasi slightly overrated by student, artifacts detected"

**Very Detailed:** "Rule activations: [Rule 5: 0.8], [Rule 7: 0.6]... Membership values: identifikasi_diff = -0.2 (Accurate)..."

**Preference:**
- [ ] Simple (hide complexity)
- [ ] Detailed (show reasoning)
- [ ] Very Detailed (full transparency)
- [ ] Let assessor choose in settings

### 7.4 Assessor Feedback on System
**Q: How will you gather assessor feedback post-launch?**

- [ ] Built-in feedback form in UI
- [ ] Monthly focus group meetings
- [ ] Quarterly surveys
- [ ] Informal discussions
- [ ] Other: _____________

**Feedback frequency:** Every _________ weeks

**Client Notes on Adoption:**
```
[Concerns about assessor buy-in? Known resistances?]




```

---

## Section 8: Fuzzy System Specifics

### 8.1 Primary Use Case
**Q: What is the main goal of fuzzy logic here?**

- [ ] Rate accuracy of student's self-critique (main focus)
- [ ] Recommend whether image retake is needed
- [ ] Identify common error patterns in student cohorts
- [ ] Reduce time assessor spends scoring
- [ ] Ensure consistent grading across assessors
- [ ] Other: _____________

**What's most important to you?**
- [ ] Consistency (same rules applied fairly)
- [ ] Accuracy (matches expert judgment)
- [ ] Transparency (understandable reasoning)
- [ ] Speed (quick results)
- [ ] Cost (low implementation expense)

### 8.2 Fuzzy Rule Design
**Q: Should fuzzy rules prioritize certain criteria?**

Example: "Kolimasi accuracy is MORE important than contrast accuracy"

- [ ] All criteria equally weighted
- [ ] Some criteria are critical (list below)
- [ ] Different weightings by projection type (AP vs. PA vs. Lateral)
- [ ] Flexible, determine during rule tuning

**Critical criteria (if any):**
```
Criterion: Why is it critical?
________: ___________________________
________: ___________________________
________: ___________________________
```

### 8.3 Different Projections
**Q: Do evaluation standards differ by projection type?**

- [ ] No, same criteria apply to all projections
- [ ] Yes, AP and PA have different requirements
- [ ] Yes, Lateral significantly different
- [ ] Yes, other variations: _____________

**How should fuzzy adapt?**
- [ ] Single universal ruleset
- [ ] Separate rules per projection type
- [ ] Hybrid (shared + projection-specific rules)

### 8.4 Rule Tuning & Optimization
**Q: Do you have past evaluations where assessor rated overall performance?**

(e.g., "Overall this critique was: Poor/Fair/Good/Excellent")

- [ ] Yes, many (50+)
- [ ] Yes, some (10-50)
- [ ] Yes, very few (< 10)
- [ ] No, only per-criterion scores available

**Can we use these to train GA optimizer?**
- [ ] Yes, use historical labels to tune fuzzy system
- [ ] Yes, but with human expert review
- [ ] No, prefer expert-designed rules only
- [ ] Uncertain

**Client Notes on Fuzzy Design:**
```
[Domain expertise on radiography evaluation? Specific rules you'd recommend?]




```

---

## Section 9: Reporting & Analytics

### 9.1 Reports Needed
**Q: What reports/dashboards would be valuable?**

- [ ] Per-student performance trends (over time)
- [ ] Cohort-level statistics (class average, distribution)
- [ ] Common error patterns (e.g., students systematically overrate contrast)
- [ ] Assessor comparison (who scores strictest/most lenient)
- [ ] System accuracy report (fuzzy vs. assessor alignment)
- [ ] Projection-type analysis (which types are hardest)
- [ ] Image quality analysis (common defects in submitted images)
- [ ] Other: _____________

### 9.2 Report Access & Audience
**Q: Who needs access to reports?**

- [ ] Individual assessors (own evaluations only)
- [ ] Instructors/Supervisors (department-level view)
- [ ] Department heads/Administrators
- [ ] Accreditation bodies (compliance reporting)
- [ ] Other: _____________

### 9.3 Analytics Frequency
**Q: When should reports be generated?**

- [ ] Real-time (automatic, always available)
- [ ] Daily
- [ ] Weekly
- [ ] End of semester
- [ ] On-demand (assessor requests)
- [ ] Other: _____________

**Client Notes on Analytics:**
```
[Specific business questions analytics should answer?]




```

---

## Section 10: Success Metrics & Evaluation

### 10.1 How Will You Measure Success?
**Q: What indicates this project is working well?**

- [ ] Reduced time per evaluation (target: _________ % faster)
- [ ] Improved consistency between assessors (target: _________ % agreement)
- [ ] Better student feedback quality (subjective assessment)
- [ ] Fuzzy accuracy matches assessor judgment (target: _________ % accuracy)
- [ ] Increased adoption/usage rates (target: _________ % of evaluations use fuzzy)
- [ ] Specific cost savings (target: $ _________ saved annually)
- [ ] Improved student learning outcomes (measured by: _____________)
- [ ] Other: _____________

**Most important metric:** _____________

### 10.2 Evaluation Timeline
**Q: When will you evaluate if system is successful?**

- [ ] After first semester (_________ weeks)
- [ ] After first full year
- [ ] After full adoption (all assessors trained)
- [ ] Continuous monitoring
- [ ] Other: _____________

### 10.3 Success/Failure Criteria
**Q: What would be a failure?**

```
If fuzzy system: [describe scenario that would indicate failure]
__________________________________________________

Then we would: [rollback? Iterate? Abandon?]
__________________________________________________
```

---

## Section 11: Risks & Contingencies

### 11.1 Known Risks
**Q: What are your concerns about this project?**

- [ ] Over-reliance on AI recommendations
- [ ] Privacy/compliance issues with images
- [ ] Assessor resistance to new system
- [ ] Technical reliability (system downtime)
- [ ] Cost exceeds budget
- [ ] Timeline slips
- [ ] Poor fuzzy accuracy (doesn't match expert judgment)
- [ ] Other: _____________

**Highest risk:** _____________

### 11.2 Contingency Plans
**Q: If fuzzy system fails or produces poor results, what's the plan?**

- [ ] Revert to 100% manual assessment
- [ ] Keep fuzzy as optional reference tool (not mandatory)
- [ ] Pause, retrain, relaunch
- [ ] Abandon fuzzy, use basic digital forms only
- [ ] Other: _____________

### 11.3 Resource Constraints
**Q: Potential resource limitations:**

**IT Support Available:**
- [ ] Full-time support
- [ ] Part-time support (hours/week: _______)
- [ ] Minimal support (emergency only)
- [ ] None; rely on external team

**Budget:**
- [ ] Flexible, no hard limit
- [ ] Fixed budget: $ _____________
- [ ] Budget constrained, but can discuss

**Staffing:**
- [ ] Dedicated project coordinator
- [ ] Shared responsibility
- [ ] Limited availability (describe: _____________)

---

## Section 12: Legal & Governance

### 12.1 Data Agreement
**Q: Can we execute a Data Processing Agreement?**

- [ ] Yes, no issues
- [ ] Yes, need to route through university legal
- [ ] Yes, but hospital legal must review
- [ ] Uncertain, need to check

**Estimated approval time:** _________ weeks

### 12.2 Intellectual Property
**Q: IP ownership for trained fuzzy models:**

- [ ] University owns all IP
- [ ] Development team retains licensing for research
- [ ] Open-source model (publicly available)
- [ ] Proprietary to development team, licensed to university
- [ ] Discuss later

### 12.3 Liability & Warranty
**Q: Liability expectations:**

- [ ] System provided "as-is" (no warranty)
- [ ] Development team provides SLA (e.g., 99.5% uptime)
- [ ] University accepts liability for student assessment
- [ ] Shared liability model (discuss specifics)
- [ ] Other: _____________

---

## Section 13: Sign-Off & Next Steps

### 13.1 Approvals
**Client Representative:** ___________________________

**Title:** ___________________________

**Email:** ___________________________

**Phone:** ___________________________

**Date Completed:** ___________________________

**Signature:** ___________________________

---

### 13.2 Development Team Review
**Technical Lead:** ___________________________

**Review Date:** ___________________________

**Initial Feasibility Assessment:**
- [ ] Feasible with proposed scope
- [ ] Feasible with modifications (list below)
- [ ] Requires additional information
- [ ] Infeasible as stated (explain below)

**Notes:**
```
[Technical team comments on requirements]




```

---

### 13.3 Follow-Up Meeting
**Scheduled Date:** ___________________________

**Purpose:** Review requirements, clarify unknowns, finalize scope

**Attendees:**
- [ ] Client Project Lead
- [ ] Client Technical Lead
- [ ] Development Team Lead
- [ ] Development Architect
- [ ] Other: _____________

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **CRISP Input** | Objective, measurable values extracted from X-ray images (e.g., edge sharpness = 0.85) |
| **Fuzzy Inference System (FIS)** | System that uses fuzzy logic to map inputs to outputs using linguistic rules |
| **Membership Function** | Defines how a value belongs to a fuzzy set (e.g., "contrast = moderately high") |
| **Mamdani FIS** | Type of FIS using if-then rules with fuzzy outputs |
| **Defuzzification** | Converting fuzzy output back to crisp numeric value |
| **GA (Genetic Algorithm)** | Optimization method that tunes fuzzy parameters automatically |
| **FCM (Fuzzy C-Means)** | Clustering algorithm to group similar evaluation patterns |
| **PACS** | Picture Archiving and Communication System (hospital medical imaging) |
| **DICOM** | Digital Imaging and Communications in Medicine (medical image standard) |
| **PHI** | Protected Health Information (regulated medical data) |
| **HIPAA** | Health Insurance Portability and Accountability Act (US regulation) |
| **GDPR** | General Data Protection Regulation (EU regulation) |
| **IRB** | Institutional Review Board (ethics oversight) |

---

## Appendix B: References & Resources

- **Fuzzy Logic Architecture**: See `fuzzy-architecture.md`
- **Data Engineering Tasks**: See `data-engineer-tasks.md`
- **Project Repository**: [GitHub link, if applicable]
- **Technical Stack**: Next.js, Prisma, PostgreSQL, Python (scikit-fuzzy), OpenCV

---

## Appendix C: Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | May 15, 2026 | Initial questionnaire | Development Team |
|  |  |  |  |
|  |  |  |  |

---

**Document End**

For questions or clarifications, contact: [Development Team Contact Info]
