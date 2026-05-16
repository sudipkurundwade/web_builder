const fs = require("fs");
const path = require("path");

const outputDir = path.join(process.cwd(), "reports");
const outputFile = path.join(outputDir, "DT_ISE2_EventEase_Report.pdf");

const page = {
  width: 595.28,
  height: 841.89,
  marginLeft: 54,
  marginRight: 54,
  marginTop: 54,
  marginBottom: 58,
};

const maxTextWidth = page.width - page.marginLeft - page.marginRight;
const pages = [];
let current = [];
let y = page.height - page.marginTop;
let pageNumber = 1;

function escapePdfText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function estimateWidth(text, size, bold = false) {
  const factor = bold ? 0.55 : 0.51;
  return text.length * size * factor;
}

function wrapText(text, size, bold = false, indent = 0) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  const available = maxTextWidth - indent;

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (estimateWidth(candidate, size, bold) <= available || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function finishPage() {
  current.push({
    text: `Page ${pageNumber}`,
    x: page.width / 2 - 18,
    y: 28,
    size: 9,
    font: "F1",
  });
  pages.push(current);
  current = [];
  pageNumber += 1;
  y = page.height - page.marginTop;
}

function ensureSpace(heightNeeded) {
  if (y - heightNeeded < page.marginBottom) {
    finishPage();
  }
}

function addText(text, options = {}) {
  const size = options.size || 11;
  const leading = options.leading || Math.round(size * 1.45);
  const font = options.bold ? "F2" : "F1";
  const indent = options.indent || 0;
  const before = options.before || 0;
  const after = options.after || 0;
  const lines = wrapText(text, size, options.bold, indent);

  ensureSpace(before + lines.length * leading + after);
  y -= before;

  for (const line of lines) {
    current.push({
      text: line,
      x: page.marginLeft + indent,
      y,
      size,
      font,
    });
    y -= leading;
  }

  y -= after;
}

function addCentered(text, options = {}) {
  const size = options.size || 16;
  const font = options.bold === false ? "F1" : "F2";
  const before = options.before || 0;
  const after = options.after || 0;
  ensureSpace(before + size * 1.6 + after);
  y -= before;
  current.push({
    text,
    x: (page.width - estimateWidth(text, size, font === "F2")) / 2,
    y,
    size,
    font,
  });
  y -= Math.round(size * 1.6) + after;
}

function addHeading(text) {
  addText(text, { size: 15, bold: true, before: 12, after: 4, leading: 19 });
}

function addSubheading(text) {
  addText(text, { size: 12, bold: true, before: 8, after: 2, leading: 16 });
}

function addParagraph(text) {
  addText(text, { size: 11, leading: 16, after: 2 });
}

function addBullet(text) {
  addText(`- ${text}`, { size: 11, leading: 16, indent: 14, after: 1 });
}

function addBlank(lines = 1) {
  ensureSpace(lines * 12);
  y -= lines * 12;
}

function addPrototypeBox(title, lines) {
  addSubheading(title);
  for (const line of lines) addBullet(line);
}

addCentered("ISE 2 Case Study Report", { size: 20, before: 40, after: 8 });
addCentered("Design Thinking Method", { size: 16, after: 20 });
addText("Project Title: EventEase - College Event Discovery and Registration App", {
  size: 13,
  bold: true,
  leading: 19,
  after: 8,
});
addText("Student Name: ________________________________", { size: 12, leading: 18 });
addText("Roll Number: _________________________________", { size: 12, leading: 18 });
addText("Class: _______________________________________", { size: 12, leading: 18 });
addText("Subject: DTE / Design Thinking", { size: 12, leading: 18, after: 18 });

addHeading("Project Introduction");
addParagraph(
  "EventEase is a College Event Discovery and Registration App designed to help students find, register for, and track college events in one place. In many colleges, event information is shared through WhatsApp groups, posters, classroom announcements, or social media pages. Because of this scattered communication, students often miss useful workshops, seminars, technical competitions, sports events, cultural programs, guest lectures, and club activities."
);
addParagraph(
  "The main aim of EventEase is to create a centralized platform where students can view all upcoming events, check details, register easily, receive reminders, and give feedback after attending. It also supports event organizers by helping them manage participant lists, send updates, and collect feedback in an organized way."
);

addHeading("Need of the Project");
addParagraph(
  "This project is needed because students do not always receive event information at the correct time. Messages in groups may get ignored or buried under other chats. Posters may not reach every student, and verbal announcements are easy to forget. A single digital platform can improve communication between event organizers and students."
);
addParagraph(
  "EventEase can increase student participation, reduce confusion, and make event management smoother. It is useful for students who want to improve their skills, participate in competitions, attend workshops, and stay active in college life."
);

addHeading("Target Users");
addBullet("College students from all departments and years.");
addBullet("Event coordinators and student club members.");
addBullet("Faculty event in-charges.");
addBullet("Training and placement departments.");
addBullet("College administration teams.");

addHeading("Scope of the Project");
addBullet("Technical events such as coding contests, hackathons, and project exhibitions.");
addBullet("Cultural programs such as dance, music, drama, and art competitions.");
addBullet("Sports events and college tournaments.");
addBullet("Workshops, seminars, guest lectures, and webinars.");
addBullet("Club activities, training sessions, and placement preparation events.");

addHeading("Objectives of the Project");
addBullet("To provide all college event details in one place.");
addBullet("To make student registration simple and quick.");
addBullet("To send reminders before registration deadlines and event timings.");
addBullet("To reduce confusion about venue, rules, eligibility, and fees.");
addBullet("To help organizers manage participants and feedback easily.");
addBullet("To increase overall student participation in college activities.");

addHeading("Expected Benefits");
addBullet("Students save time while searching for event information.");
addBullet("Students do not miss important event updates and deadlines.");
addBullet("Organizers can manage registrations in a more systematic way.");
addBullet("Faculty members can track participation and event response.");
addBullet("Communication becomes clear, fast, and organized.");
addBullet("Certificates and feedback can be handled digitally in future versions.");

addHeading("1. Empathize Phase");
addSubheading("Objective of Study");
addParagraph(
  "The objective of the empathize phase is to understand the difficulties faced by college students while finding information about events, workshops, seminars, competitions, and cultural activities. This phase focuses on identifying real user needs, frustrations, and expectations."
);
addSubheading("Technique Used");
addParagraph("User Interviews");
addSubheading("Process");
addParagraph(
  "I interviewed students from different branches and years to understand how they currently receive information about college events. I asked questions related to event awareness, registration methods, reminders, participation problems, and communication gaps."
);
addParagraph("Sample questions asked during the interview:");
addBullet("How do you usually get information about college events?");
addBullet("Have you ever missed an event because you did not know about it?");
addBullet("Do you find the event registration process easy?");
addBullet("Do you get reminders before event deadlines?");
addBullet("Would you like one app where all college events are listed?");
addSubheading("Observations / Data Collected");
addParagraph(
  "Many students said that they get event information through WhatsApp groups, posters, friends, or classroom announcements. Some students miss events because messages get lost in large groups. Some students are interested in events but forget registration deadlines. Students also face difficulty finding important details such as date, time, venue, registration fee, eligibility, rules, and contact person."
);
addParagraph(
  "Some students said that they came to know about an event only after the registration deadline was over. Others said that posters do not always provide complete information. Many students depend on friends for updates, which is not always reliable."
);
addSubheading("User Insights");
addParagraph(
  "Students need a single and organized platform where they can discover all college events, register easily, receive reminders, and track their participation. They prefer a mobile-friendly system because they use smartphones daily. They want short, clear, and updated event information with confirmation after registration."
);

addHeading("2. Define Phase");
addSubheading("Problem Statement");
addParagraph(
  "College students often miss important events because event information is scattered across WhatsApp groups, posters, classroom announcements, and social media. Due to this, students face confusion about event dates, deadlines, venue, eligibility, fees, rules, and the registration process."
);
addSubheading("Technique Used");
addParagraph("User Persona and How Might We Questions");
addSubheading("User Persona");
addBullet("Name: Ananya Patil");
addBullet("Age: 19 years");
addBullet("Role: Second-year Engineering Student");
addBullet("Department: Computer Engineering");
addBullet("Needs: Easy access to event details, simple registration, deadline reminders, and participation tracking.");
addBullet("Pain Points: Misses event updates, forgets deadlines, receives incomplete information, and finds it difficult to search old messages in groups.");
addSubheading("Point of View Statement");
addParagraph(
  "A college student needs a centralized and easy-to-use platform to discover and register for college events because scattered event information causes confusion and reduces student participation."
);
addSubheading("How Might We Questions");
addBullet("How might we help students find all college events in one place?");
addBullet("How might we make event registration quick and simple?");
addBullet("How might we remind students about deadlines and event timings?");
addBullet("How might we help organizers manage registrations easily?");
addBullet("How might we increase student participation in college activities?");

addHeading("3. Ideate Phase");
addSubheading("Objective of Ideation");
addParagraph(
  "The objective of the ideation phase is to generate different possible solutions for helping students discover college events, register easily, and receive timely reminders. This phase focuses on improving communication between event organizers and students."
);
addSubheading("Technique Used");
addParagraph("Brainstorming");
addSubheading("Idea Generation Process");
addParagraph(
  "In this phase, different ideas were collected by thinking from the point of view of both students and event organizers. The main focus was to create a simple and useful solution that can reduce confusion about events and increase student participation."
);
addParagraph("Ideas were generated based on these questions:");
addBullet("How can students find all events in one place?");
addBullet("How can registration be made simple?");
addBullet("How can students remember event deadlines?");
addBullet("How can organizers manage participants easily?");
addSubheading("List of Ideas");
addBullet("Centralized college event listing app.");
addBullet("Category-wise event filters such as technical, cultural, sports, workshop, and seminar.");
addBullet("One-click event registration.");
addBullet("Reminder notifications before registration deadlines.");
addBullet("Event calendar view.");
addBullet("Search option to find events by name.");
addBullet("Save or bookmark event option.");
addBullet("QR code check-in at event venue.");
addBullet("Digital participation certificate.");
addBullet("Student participation history.");
addBullet("Organizer dashboard to add and update events.");
addBullet("Feedback form after event completion.");
addBullet("Personalized event suggestions based on student interests.");
addBullet("Downloadable participant list for organizers.");
addSubheading("Final Selected Idea");
addParagraph(
  "The final selected idea is EventEase: College Event Discovery and Registration App. This app will provide all college event details in one place. Students can search events, filter by category, view event details, register online, receive reminders, and track their participation."
);
addSubheading("Reason for Selecting This Idea");
addParagraph(
  "This idea was selected because it solves the main problem of scattered event information. It is simple to use, practical for college students, and helpful for both students and organizers. It can increase student participation and make event management more organized."
);
addSubheading("Expected Outcome");
addParagraph(
  "The expected outcome is that students will not miss important events and organizers will be able to manage registrations more easily. The app will save time, reduce confusion, and improve communication in the college."
);

addHeading("4. Prototype Phase");
addSubheading("Technique Used");
addParagraph("Low Fidelity Paper Prototyping");
addSubheading("Prototype Features");
addParagraph("Student-side features:");
addBullet("View upcoming events.");
addBullet("Filter events by category.");
addBullet("Search events by name.");
addBullet("Register for events.");
addBullet("Receive reminders and updates.");
addBullet("View registered events in My Events.");
addBullet("Submit feedback after attending.");
addBullet("Download digital certificates in future versions.");
addParagraph("Organizer-side features:");
addBullet("Add a new event.");
addBullet("Edit event details.");
addBullet("View registration list.");
addBullet("Send event announcements.");
addBullet("Mark attendance using QR code.");
addBullet("Upload certificates.");
addSubheading("Design / Structure");
addParagraph(
  "The prototype is designed as a simple mobile application. The home page shows upcoming events with event name, date, time, venue, and category. Students can select an event to view full details such as rules, eligibility, registration fee, deadline, and organizer contact. After registration, the event is added to the My Events section."
);
addSubheading("Description of Prototype");
addParagraph(
  "The paper prototype represents a mobile app that helps students discover and register for college events. It reduces confusion by keeping all information in one place. The prototype also includes reminders so students do not miss deadlines or event timings."
);
addSubheading("Prototype Screens to Draw by Hand");
addBullet("Login / Sign Up Screen");
addBullet("Home Page with Upcoming Events");
addBullet("Category Filter Page");
addBullet("Event Details Page");
addBullet("Registration Form");
addBullet("Confirmation / Ticket Screen");
addBullet("My Events Page");
addBullet("Feedback / Certificate Page");
addSubheading("Prototype Flow");
addParagraph(
  "Login -> Home Page -> Select Category -> View Event Details -> Register -> Confirmation -> Reminder -> Attend Event -> Feedback -> Certificate"
);
addPrototypeBox("Simple Prototype Wireframe Notes", [
  "Login Screen: Student enters email or roll number and password.",
  "Home Screen: Upcoming events are shown as a list with category filters.",
  "Event Details Screen: Shows date, time, venue, eligibility, fee, rules, and contact person.",
  "Registration Screen: Student fills name, roll number, department, and year.",
  "Confirmation Screen: Displays registration success message and event ticket.",
  "My Events Screen: Shows registered events and reminders.",
]);

addHeading("5. Test Phase");
addSubheading("Technique Used");
addParagraph("User Testing");
addSubheading("Testing Process");
addParagraph(
  "The paper prototype was shown to a few students. They were asked to use the prototype flow from login to event discovery, registration, and reminder checking. Their feedback was collected to improve the design. Students were also asked whether the app would help them participate in more college events."
);
addSubheading("Feedback Received");
addParagraph(
  "Students found the app useful because it saves time and avoids missing event updates. They liked the category filter, reminder option, and My Events page. Some students suggested adding event popularity, calendar sync, certificate download, and a bookmark option. Organizers suggested that the participant list should be downloadable in Excel format."
);
addSubheading("Issues Identified");
addBullet("Too many notifications may irritate users.");
addBullet("Some students may not check the app regularly.");
addBullet("Event details must be updated by organizers on time.");
addBullet("Registration confirmation should be clear.");
addBullet("Internet access is required for real-time updates.");
addSubheading("Improvements Made");
addBullet("Added notification settings for students.");
addBullet("Added calendar sync option.");
addBullet("Added clear registration confirmation message.");
addBullet("Added event update alerts.");
addBullet("Added digital certificate download option.");
addBullet("Added feedback form after event completion.");
addBullet("Added organizer dashboard.");
addBullet("Added QR code attendance system.");
addBullet("Added option to download participant list.");

addHeading("Limitations");
addBullet("The app requires internet access.");
addBullet("Organizers must update event details regularly.");
addBullet("Students need to install or use the app.");
addBullet("Incorrect event details may create confusion.");
addBullet("Notifications must be managed properly.");

addHeading("Future Scope");
addBullet("AI-based event recommendations based on student interests.");
addBullet("Integration with college ERP or student portal.");
addBullet("Automatic certificate generation.");
addBullet("Event popularity analytics.");
addBullet("Multi-college event listing.");
addBullet("In-app payment for paid events.");
addBullet("Chatbot for event-related queries.");

addHeading("Conclusion");
addParagraph(
  "EventEase is a useful solution for improving student participation in college events. By using the Design Thinking process, the problem was studied from the student's point of view. The app helps students discover events, register easily, get reminders, and manage their participation in one place."
);
addParagraph(
  "Through the five phases of Design Thinking - Empathize, Define, Ideate, Prototype, and Test - a practical and student-friendly solution was developed. This system can make college events more organized, accessible, and successful."
);

finishPage();

function streamForPage(items) {
  const commands = [];
  commands.push("q");
  for (const item of items) {
    commands.push("BT");
    commands.push(`/${item.font} ${item.size} Tf`);
    commands.push(`${item.x.toFixed(2)} ${item.y.toFixed(2)} Td`);
    commands.push(`(${escapePdfText(item.text)}) Tj`);
    commands.push("ET");
  }
  commands.push("Q");
  return commands.join("\n");
}

function buildPdf() {
  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  const pageRefs = [];
  let objectId = 5;
  for (const pageItems of pages) {
    const pageObjectId = objectId++;
    const contentObjectId = objectId++;
    pageRefs.push(`${pageObjectId} 0 R`);
    const content = streamForPage(pageItems);
    objects[contentObjectId] = `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`;
    objects[pageObjectId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
  }

  objects[2] = `<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pages.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 1; i < objects.length; i += 1) {
    offsets[i] = Buffer.byteLength(pdf, "utf8");
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return pdf;
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, buildPdf(), "binary");
console.log(outputFile);
