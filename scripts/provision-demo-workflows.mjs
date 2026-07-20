import {
  adminAuth,
  adminDb,
  FieldValue,
  requireEnvironment,
} from "./provisioning/admin-client.mjs";

const clubId = "cs-club";
const clubName = "Computer Programming Club";

async function provisionDemoWorkflows() {
  const studentEmail = requireEnvironment("RAMLINK_STUDENT_EMAIL");
  const student = await adminAuth.getUserByEmail(studentEmail);
  const studentName = student.displayName ?? "Demo Student";

  const batch = adminDb.batch();

  batch.set(
    adminDb.collection("joinRequests").doc(`${student.uid}_${clubId}`),
    {
      clubId,
      clubName,
      studentId: student.uid,
      studentName,
      message: "I would like to participate in club projects and workshops.",
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
  );

  batch.set(adminDb.collection("inquiries").doc(`demo-${student.uid}`), {
    clubId,
    clubName,
    studentId: student.uid,
    studentName,
    subject: "Question about weekly meetings",
    message: "May new students attend a meeting before joining?",
    status: "open",
    replies: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  batch.set(adminDb.collection("notifications").doc(`demo-${student.uid}`), {
    userId: student.uid,
    clubId,
    title: "Upcoming campus coding night",
    body: "The Computer Programming Club has an upcoming event.",
    type: "event",
    status: "unread",
    relatedHref: "/events",
    createdAt: FieldValue.serverTimestamp(),
  });

  batch.set(adminDb.collection("reports").doc(`demo-${student.uid}`), {
    reporterId: student.uid,
    reporterName: studentName,
    contentType: "Event",
    contentTitle: "Campus Coding Night",
    reason: "Demonstration report for administrator workflow testing.",
    status: "new",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();
  console.log("RamLink demonstration workflows were provisioned successfully.");
}

provisionDemoWorkflows().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});