import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const MORNING_WISHES = [
  "Good morning! Ready to grow your business today? Check your pending invoices.",
  "Rise and shine! A new day of opportunities awaits. Review your quotations.",
  "Good morning! Start strong — your customers are counting on you.",
  "New day, new deals! Check what's pending and keep the momentum going.",
  "Good morning! Success is built one invoice at a time. Let's get to it.",
  "Morning check-in time! Review your business activity for a productive day.",
  "Good morning! Your business doesn't stop — stay on top of your finances today.",
];

const DAILY_WISH_ID = 'daily-morning-wish';

export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Smart Billing',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0D9488',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    finalStatus = status;
  }

  if (finalStatus === 'granted') {
    await scheduleDailyMorningWish();
  }

  return finalStatus === 'granted';
}

export async function scheduleDailyMorningWish(): Promise<void> {
  try {
    // Cancel existing to avoid duplicates, then reschedule with a fresh message
    await Notifications.cancelScheduledNotificationAsync(DAILY_WISH_ID).catch(() => {});

    const dayIndex = new Date().getDay(); // 0=Sun … 6=Sat
    const body = MORNING_WISHES[dayIndex % MORNING_WISHES.length];

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_WISH_ID,
      content: {
        title: 'Good Morning! 🌅',
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 7,
        minute: 0,
      },
    });
  } catch (e) {
    // Silently fail on simulators or when permissions are denied
  }
}

const EVENING_SUMMARY_ID = 'evening-business-summary';

export interface DaySummary {
  invoices: number;
  quotations: number;
  purchases: number;
  customers: number;
  vendors: number;
  creditNotes: number;
  debitNotes: number;
}

function buildEveningMessage(s: DaySummary): string {
  const total = s.invoices + s.quotations + s.purchases + s.customers + s.vendors + s.creditNotes + s.debitNotes;

  if (total === 0) {
    const idle = [
      "Every big business started with a single step. Tomorrow is a fresh opportunity — keep going!",
      "Rest well tonight. Tomorrow, go out and close those deals. Your business is counting on you!",
      "A quiet day is still a day forward. Plan tomorrow's moves tonight and wake up ready!",
      "Success isn't built in a day, but every day counts. Make tomorrow matter!",
    ];
    return idle[new Date().getDay() % idle.length];
  }

  const parts: string[] = [];
  if (s.invoices > 0) parts.push(`${s.invoices} invoice${s.invoices > 1 ? 's' : ''}`);
  if (s.quotations > 0) parts.push(`${s.quotations} quotation${s.quotations > 1 ? 's' : ''}`);
  if (s.purchases > 0) parts.push(`${s.purchases} purchase${s.purchases > 1 ? 's' : ''}`);
  if (s.customers > 0) parts.push(`${s.customers} new customer${s.customers > 1 ? 's' : ''}`);
  if (s.vendors > 0) parts.push(`${s.vendors} new vendor${s.vendors > 1 ? 's' : ''}`);
  if (s.creditNotes > 0) parts.push(`${s.creditNotes} credit note${s.creditNotes > 1 ? 's' : ''}`);
  if (s.debitNotes > 0) parts.push(`${s.debitNotes} debit note${s.debitNotes > 1 ? 's' : ''}`);

  const summary = parts.length === 1
    ? parts[0]
    : parts.slice(0, -1).join(', ') + ' & ' + parts[parts.length - 1];

  const closings = [
    "Outstanding work — you're building something great!",
    "Every transaction brings you closer to your goals. Keep it up!",
    "That's the spirit! Consistency is the key to success.",
    "You're on fire! Tomorrow, let's do even more.",
    "Fantastic day! Your hard work is paying off.",
  ];
  const closing = closings[new Date().getDay() % closings.length];

  return `Today you created ${summary}. ${closing}`;
}

export async function scheduleEveningMotivation(summary: DaySummary): Promise<void> {
  try {
    // Cancel old one and reschedule with today's updated summary
    await Notifications.cancelScheduledNotificationAsync(EVENING_SUMMARY_ID).catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: EVENING_SUMMARY_ID,
      content: {
        title: "Evening Wrap-Up 🌙",
        body: buildEveningMessage(summary),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });
  } catch (e) {
    // Silently fail on simulators or when permissions are denied
  }
}

export async function sendLocalNotification(title: string, body: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch (e) {
    // Silently fail if notifications not permitted
  }
}

export async function scheduleOverdueCheck(invoiceNumber: string, dueDate: string, invoiceId: string): Promise<void> {
  try {
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) {
      await sendLocalNotification(
        'Invoice Overdue',
        `Invoice ${invoiceNumber} is past its due date`
      );
    } else {
      // Schedule for due date
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Invoice Due Today',
          body: `Invoice ${invoiceNumber} is due today`,
          data: { type: 'invoice', id: invoiceId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: due,
        },
      });
    }
  } catch (e) {
    // Silently fail
  }
}

export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (e) {
    // Silently fail
  }
}

export async function clearAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
