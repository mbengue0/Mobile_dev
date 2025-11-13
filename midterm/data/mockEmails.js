const names = [
  'Alice Johnson',
  'Bob Smith',
  'Caroline Shaw',
  'David Kim',
  'Evelyn Chen',
  'Frank Garcia',
  'Grace Lee',
  'Henry Adams',
  'Irene Walker',
  'Jack Thompson',
  'Karen Miller',
  'Leo Turner',
  'Mia Sanchez',
  'Noah Rivera',
  'Olivia Brooks',
  'Paul Hughes',
  'Quincy Reed',
  'Rita Flores',
  'Sam Cooper',
  'Tina Ward',
  'Uma Patel',
  'Victor King',
  'Wendy Scott',
  'Xavier Long',
  'Yara Stone',
  'Zack Carter',
];

const subjects = [
  'Meeting follow-up',
  'Your invoice is ready',
  'Welcome aboard!',
  'Action required',
  'Schedule confirmation',
  'Lunch this week?',
  'Sprint planning',
  'Reminder: submit report',
  'Invitation: Team Event',
  'Status update request',
];

const previews = [
  'Hi there, just circling back on our last conversation...',
  'Please find the attached invoice for your records...',
  'We are excited to have you join the team...',
  'Could you take a moment to review the document...',
  'Confirming our meeting for tomorrow at 10am...',
  'Are you free for lunch on Thursday...',
  'Here are the tickets and scope for next sprint...',
  'Kind reminder to submit your monthly report...',
  'You are invited to our upcoming event...',
  'Can you share the latest status by EOD...',
];

function randomPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pad2(n) {
  return n.toString().padStart(2, '0');
}

const emails = Array.from({ length: 50 }).map((_, i) => {
  const fromName = randomPick(names);
  const toName = randomPick(names);
  const date = new Date(Date.now() - Math.floor(Math.random() * 14) * 86400000);
  const time = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  return {
    id: `m_${i}`,
    from: { name: fromName, email: fromName.toLowerCase().replace(/\s+/g, '.') + '@mail.com' },
    to: { name: toName, email: toName.toLowerCase().replace(/\s+/g, '.') + '@mail.com' },
    subject: randomPick(subjects),
    preview: randomPick(previews),
    read: Math.random() > 0.4,
    starred: Math.random() > 0.75,
    important: Math.random() > 0.8,
    time,
    label: randomPick(['inbox', 'sent', 'drafts']),
    date: date.toISOString(),
  };
});

export function listEmails(filter = 'inbox') {
  if (filter === 'all') return emails;
  if (filter === 'starred') return emails.filter((e) => e.starred);
  if (filter === 'snoozed') return [];
  if (filter === 'important') return emails.filter((e) => e.important);
  return emails.filter((e) => e.label === filter);
}

export function searchEmails(query, list) {
  const q = (query || '').toLowerCase();
  if (!q) return list;
  return list.filter(
    (e) =>
      e.from.name.toLowerCase().includes(q) ||
      e.subject.toLowerCase().includes(q) ||
      e.preview.toLowerCase().includes(q)
  );
}

export function toggleStar(id) {
  const e = emails.find((x) => x.id === id);
  if (e) e.starred = !e.starred;
}

export function archiveEmail(id) {
  const e = emails.find((x) => x.id === id);
  if (e) e.label = 'all';
}

export function deleteEmail(id) {
  const idx = emails.findIndex((x) => x.id === id);
  if (idx !== -1) emails.splice(idx, 1);
}

export function sendMockEmail({ to, subject, body }) {
  emails.unshift({
    id: `m_${Date.now()}`,
    from: { name: 'You', email: 'you@mail.com' },
    to: { name: to, email: `${to.toLowerCase().replace(/\s+/g, '.')}@mail.com` },
    subject,
    preview: body.slice(0, 80),
    read: false,
    starred: false,
    important: false,
    time: 'now',
    label: 'sent',
    date: new Date().toISOString(),
  });
}

export default emails;


