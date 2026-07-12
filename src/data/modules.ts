import type { ModuleData } from "./types";

export const MODULES: ModuleData[] = [
  {
    id: "cybersafe-world",
    title: "CyberSafe World",
    subtitle: "Your adventure begins",
    icon: "🌍",
    color: "#4D96FF",
    badge: "🗺️",
    badgeName: "Explorer",
    steps: [
      {
        id: "intro-story",
        type: "story",
        title: "Welcome, hero!",
        text: "The internet is a huge, exciting world full of games, videos and friends. But just like the real world, it has places where we must be careful.",
        icon: "🌍",
        mascot: "🦸",
        speech: "Hi! I'm Captain Cyber. Let's explore safely together!",
      },
      {
        id: "intro-quiz-1",
        type: "quiz",
        question: "The internet is like…",
        options: [
          "A boring book",
          "A big world to explore safely",
          "A place only for grown-ups",
        ],
        answer: 1,
        explanation:
          "The internet is a huge world for everyone  but we explore it carefully!",
        icon: "🧭",
      },
      {
        id: "intro-quiz-2",
        type: "quiz",
        question: "What should you do before going online?",
        options: ["Tell a trusted adult", "Keep it a secret", "Click anything"],
        answer: 0,
        explanation:
          "Always let a trusted adult know when you are online. They keep you safe!",
        icon: "🛡️",
      },
    ],
  },
  {
    id: "bully-blocker",
    title: "The Bully Blocker",
    subtitle: "Stand up to cyberbullying",
    icon: "🛡️",
    color: "#FF7A59",
    badge: "💪",
    badgeName: "Defender",
    steps: [
      {
        id: "bully-story",
        type: "story",
        title: "What is cyberbullying?",
        text: "Cyberbullying is when someone is mean to another person using phones, games or messages. It can hurt feelings  even through a screen.",
        icon: "💬",
        mascot: "🦸",
        speech:
          "If someone is unkind online, you can block them and tell a grown-up.",
      },
      {
        id: "bully-quiz-1",
        type: "quiz",
        question: "Someone sends you a mean message. You should…",
        options: [
          "Be mean back",
          "Block them and tell a trusted adult",
          "Keep it secret forever",
        ],
        answer: 1,
        explanation:
          "Blocking and telling a trusted adult is the brave, safe choice.",
        icon: "🚫",
      },
      {
        id: "bully-quiz-2",
        type: "quiz",
        question: "A friend is being bullied online. You can…",
        options: [
          "Join in",
          "Support your friend and tell an adult",
          "Ignore and laugh",
        ],
        answer: 1,
        explanation:
          "Supporting a friend and getting help makes you a true defender!",
        icon: "🤝",
      },
    ],
  },
  {
    id: "phishing-fisher",
    title: "The Phishing Fisher",
    subtitle: "Catch the scams!",
    icon: "🎣",
    color: "#2BC48A",
    badge: "🐟",
    badgeName: "Scam Catcher",
    steps: [
      {
        id: "phish-story",
        type: "story",
        title: "Spot the fake!",
        text: 'Scammers send fake messages saying "You won a prize!" to trick you into clicking bad links. A Phishing Fisher tries to catch you  but you can outsmart them!',
        icon: "🎣",
        mascot: "🦸",
        speech: "If it sounds too good to be true, it probably is a trap!",
      },
      {
        id: "phish-quiz-1",
        type: "quiz",
        question:
          'A message says "Click here to win a free tablet!" You should…',
        options: [
          "Click right away",
          "Ask a grown-up first",
          "Share with all friends",
        ],
        answer: 1,
        explanation:
          "Free prize messages are often scams. Always check with a grown-up!",
        icon: "🎁",
      },
      {
        id: "phish-quiz-2",
        type: "quiz",
        question: "Which link looks safer?",
        options: [
          "cool-free-prize.click",
          "your-school-website.org",
          "win-now-now.biz",
        ],
        answer: 1,
        explanation:
          'Strange or "too fun" links are traps. Trust real, known websites.',
        icon: "🔗",
      },
    ],
  },
  {
    id: "password-castle",
    title: "Password Castle",
    subtitle: "Build a strong fortress",
    icon: "🔐",
    color: "#9B5DE5",
    badge: "🏰",
    badgeName: "Keeper",
    steps: [
      {
        id: "pass-story",
        type: "story",
        title: "Protect your castle!",
        text: "A password is the lock on your castle. A weak password is like a door made of paper. A strong password keeps the bad guys out!",
        icon: "🔐",
        mascot: "🦸",
        speech:
          "Use big, mixed-up words and numbers. Never share your password!",
      },
      {
        id: "pass-quiz-1",
        type: "quiz",
        question: "Which is a STRONG password?",
        options: ["123456", "password", "Sunny-Tiger-42-Rocket"],
        answer: 2,
        explanation:
          "Long, mixed words and numbers make a super-strong password!",
        icon: "💪",
      },
      {
        id: "pass-quiz-2",
        type: "quiz",
        question: "Should you share your password?",
        options: ["Yes, with friends", "No, keep it secret", "Post it online"],
        answer: 1,
        explanation:
          "Keep passwords private  even from friends. You are the Keeper!",
        icon: "🤫",
      },
    ],
  },
  {
    id: "privacy-shield",
    title: "Privacy Shield",
    subtitle: "Guard your info",
    icon: "🛡️",
    color: "#FFC93C",
    badge: "🌟",
    badgeName: "Guardian",
    steps: [
      {
        id: "priv-story",
        type: "story",
        title: "What is private?",
        text: "Your full name, address, school and photos are private. Only share them with people you and your family trust.",
        icon: "🛡️",
        mascot: "🦸",
        speech: "Your info is like treasure. Keep your shield up!",
      },
      {
        id: "priv-quiz-1",
        type: "quiz",
        question: "Which is safe to share online?",
        options: [
          "Your home address",
          "Your favorite color",
          "Your school name",
        ],
        answer: 1,
        explanation:
          "A favorite color is fun and safe. Address and school stay private!",
        icon: "🎨",
      },
      {
        id: "priv-quiz-2",
        type: "quiz",
        question: "A stranger asks for your photo. You should…",
        options: [
          "Send it",
          "Say no and tell a trusted adult",
          "Send a funny one",
        ],
        answer: 1,
        explanation:
          "Never send photos to strangers. Tell a trusted adult right away.",
        icon: "📸",
      },
    ],
  },
];

export function getModule(id: string): ModuleData | undefined {
  return MODULES.find((m) => m.id === id);
}
