import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Coffee, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Replace this with your actual Google Apps Script Web App URL
const scriptURL = 'https://script.google.com/macros/s/AKfycby3JSCKVsBfqI4zbhoLP-VQs9Jm5qSKGSsya0Ouo1F7Vq5FTzMY_pRUVA60Fp2brim_sw/exec';

interface Message {
  role: "user" | "model";
  text: string;
}

type BookingStep = 'idle' | 'collecting_date' | 'collecting_time' | 'collecting_pax' | 'collecting_name' | 'collecting_phone' | 'confirming';

const CAFE_INFO = {
  name: "Be Right Back Cafe",
  company: "VF Ventures",
  location: "D-01-02 (First Floor, Eco Ardence Huni Square, 8, Persiaran Setia Damai, Seksyen U13, 40170 Shah Alam, Selangor",
  hours: "Wed-Mon 11am-9pm, Tue Closed",
  phone: "[017-887 0665](tel:0178870665)",
  halal: {
    en: "Yes, we are **Halal**, Boss! We use only Halal-certified ingredients and our kitchen is strictly pork-free and alcohol-free. No worries lah!",
    ms: "Ya, kami **Halal**, Boss! Kami hanya menggunakan bahan-bahan yang disahkan Halal dan dapur kami bebas daripada daging khinzir dan alkohol. Jangan risau lah!"
  },
  parking: {
    en: "There is a **basement car park** available, Boss. Street parking is also usually easier behind the shop. No problem lah!",
    ms: "Ada **basement car park** kat sini, Boss. Parking tepi jalan pun biasanya lebih senang kat belakang kedai. Takde hal lah!"
  },
  specialRequests: {
    en: "We can prepare a small cake or birthday decor if you let us know 24 hours in advance, Boss!",
    ms: "Kami boleh sediakan kek kecil atau dekorasi hari jadi kalau Boss bagitahu kami 24 jam awal!"
  },
  story: {
    en: "Be Right Back Cafe started with a simple dream by **VF Ventures**: to bring a slice of paradise to the heart of Shah Alam. We're all about community, quality coffee, and that warm 'balik kampung' feeling. Every cup we serve is a tribute to our local roots here in Eco Ardence!",
    ms: "Be Right Back Cafe bermula dengan impian ringkas daripada **VF Ventures**: untuk membawa secebis syurga ke tengah-tengah Shah Alam. Kami mementingkan komuniti, kopi berkualiti, dan perasaan 'balik kampung' yang mesra. Setiap cawan yang kami hidangkan adalah penghormatan kepada akar umbi tempatan kami di Eco Ardence!"
  },
  menu: `**Signature Coffee:**
- Be Right Back Gula Melaka Latte (**RM16**)
- Pandan Infused Cold Brew (**RM14**)
- Charcoal Seasalt Latte (**RM15**)

**Local Favorites:**
- Modern Kopi O (**RM8**)
- Teh Tarik Special (**RM10**)
- Rose Bandung Fizz (**RM12**)`
};

const parseAndValidateDate = (input: string): { valid: boolean, formattedDate?: string, isPast?: boolean } => {
  const lower = input.toLowerCase();
  const msTimeStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' });
  const msNow = new Date(msTimeStr);
  const today = new Date(msNow.getFullYear(), msNow.getMonth(), msNow.getDate());

  let targetDate: Date | null = null;

  if (lower.includes('today') || lower.includes('hari ini')) {
    targetDate = today;
  } else if (lower.includes('tomorrow') || lower.includes('esok')) {
    targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 1);
  } else {
    const match = input.match(/(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?/);
    if (match) {
      let [_, d, m, y] = match;
      if (!y) y = today.getFullYear().toString();
      if (y.length === 2) y = "20" + y;
      
      const day = parseInt(d, 10);
      const month = parseInt(m, 10) - 1;
      const year = parseInt(y, 10);
      
      targetDate = new Date(year, month, day);
    } else {
      const textMatch = input.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})|(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/i);
      if (textMatch) {
         let monthStr = textMatch[1] || textMatch[4];
         let dayStr = textMatch[2] || textMatch[3];
         const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
         const month = months.indexOf(monthStr.toLowerCase().substring(0,3));
         const day = parseInt(dayStr, 10);
         targetDate = new Date(today.getFullYear(), month, day);
      }
    }
  }

  if (!targetDate || isNaN(targetDate.getTime())) {
    return { valid: false };
  }

  if (targetDate < today) {
    return { valid: false, isPast: true };
  }

  const dd = targetDate.getDate().toString().padStart(2, '0');
  const mm = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = targetDate.getFullYear().toString();

  return { valid: true, formattedDate: `${dd}/${mm}/${yyyy}` };
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hello! I'm Be Right Back Assistant, your friendly local digital manager from **VF Ventures**. How can I help you today, Boss?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>('idle');
  const [bookingDate, setBookingDate] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [userPax, setUserPax] = useState("");
  const [chitchatCount, setChitchatCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const resetBooking = () => {
    setBookingStep('idle');
    setBookingDate("");
    setUserName("");
    setUserPhone("");
    setBookingTime("");
    setUserPax("");
  };

  const handleSubmit = (lang: "en" | "ms" = "en") => {
    setIsSubmitting(true);
    
    const url = 'https://script.google.com/macros/s/AKfycbzR_N3fBZ_jMq6bBYEokchhjwBXlm3KWhu2GrWL7iPC8ds-y8fTbX0-aedT0dk7jo3xhg/exec';
    
    const rawData = {
      name: userName,
      phone: userPhone,
      date: bookingDate,
      time: bookingTime,
      pax: userPax
    };
    
    const formData = new URLSearchParams(rawData);

    console.log('Final Data Sent:', Object.fromEntries(formData));

    fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      credentials: 'omit',
      body: formData
    }).then(() => {
      setIsSubmitting(false);
      resetBooking();
      setMessages(prev => [...prev, { 
        role: "model", 
        text: lang === "ms" 
          ? "Tahniah! Tempahan anda berjaya! Ada apa-apa lagi saya boleh bantu, Boss?" 
          : "Congratulations! Your booking is successful! Anything else I can help with, Boss?" 
      }]);
    }).catch(err => {
      console.error("Actual fetch error details:", err);
      setIsSubmitting(false);
      setMessages(prev => [...prev, { 
        role: "model", 
        text: lang === "ms" 
          ? "Alamak! Sistem kami tengah sibuk sikit. Boleh Boss cuba lagi kejap lagi atau WhatsApp kami terus?" 
          : "Oops! Our system is a bit busy. Please try again or WhatsApp us directly." 
      }]);
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleTriggerBooking = () => {
      setIsOpen(true);
      setBookingStep('collecting_date');
      resetBooking();
      setBookingStep('collecting_date'); // Ensure it stays in collecting_date after reset
      setMessages(prev => [
        ...prev,
        { role: "model", text: "I'd love to help you book a table! Which date would you like to reserve, Boss?" }
      ]);
    };

    window.addEventListener('trigger-booking', handleTriggerBooking);
    return () => window.removeEventListener('trigger-booking', handleTriggerBooking);
  }, []);

  const detectLanguage = (text: string): "en" | "ms" => {
    const malayKeywords = ["apa", "boleh", "makan", "minum", "terima kasih", "mana", "pukul", "ada", "kerusi", "meja", "halal", "parking", "alamat", "buka", "tutup", "abang", "kak", "betul", "mantap", "syok"];
    const lowerText = text.toLowerCase();
    return malayKeywords.some(word => lowerText.includes(word)) ? "ms" : "en";
  };

  const getBotResponse = (userInput: string): { text: string; isChitchat: boolean } => {
    const lowerInput = userInput.toLowerCase();
    const lang = detectLanguage(userInput);
    
    const whatsappLink = "https://wa.me/60178870665?text=Hello%20Be%20Right%20Back%20Cafe,%20I%20have%20a%20question%20about%20my%20booking.";
    const clickToCallMsg = lang === "ms" 
      ? `Kalau Boss nak cakap dengan team kami terus, Boss boleh [WhatsApp kami kat sini](${whatsappLink}) atau call kat ${CAFE_INFO.phone}.` 
      : `If you'd like to talk to our team directly, you can [WhatsApp us here](${whatsappLink}) or call us at ${CAFE_INFO.phone}.`;

    // 0. SPAM FILTER: Gibberish check
    const isGibberish = (text: string) => {
      const hasVowelOrNumber = /[aeiouy0-9]/i;
      const lower = text.toLowerCase().trim();
      if (lower.length > 0 && lower.length < 4 && !hasVowelOrNumber.test(lower)) return true;
      if (/^(.)\1+$/.test(lower) && lower.length > 2) return true;
      return false;
    };

    if (isGibberish(userInput)) {
      return { 
        text: lang === "ms" ? "Eh? Boss cakap apa tu? Saya tak faham lah." : "Huh? What was that, Boss? I didn't quite catch that.",
        isChitchat: true 
      };
    }

    // 0. GREETING: Handle general greetings first
    const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "hai", "selamat pagi", "selamat petang", "helo", "boss", "你好", "早安", "哈啰", "selamat datang", "ni hao"];
    if (greetings.includes(lowerInput)) {
      resetBooking();
      return { 
        text: "Hello Boss! Welcome to Be Right Back Cafe. 欢迎光临！Selamat datang! How can I help you today?",
        isChitchat: true 
      };
    }

    // 0.1 FRUSTRATION / PROFANITY CHECK
    const frustrationKeywords = ["stupid", "dumb", "useless", "idiot", "suck", "bad bot", "bodoh", "tak guna", "babi", "anjing", "pukimak", "sial", "penat", "geram", "angry", "marah", "hate", "benci"];
    if (frustrationKeywords.some(word => lowerInput.includes(word))) {
      return {
        text: lang === "ms"
          ? "Minta maaf Boss, saya ada buat salah ke? Saya masih belajar lagi ni! Macam mana saya boleh betul-betul bantu Boss sekarang?"
          : "I'm sorry Boss, did I get something wrong? I'm still learning! How can I actually help you?",
        isChitchat: false
      };
    }

    // 0.2 GLOBAL RESET / START OVER
    if (lowerInput === "no" || lowerInput === "start over" || lowerInput === "reset" || lowerInput === "mula balik" || lowerInput === "start fresh") {
      if (bookingStep !== 'idle') {
        resetBooking();
        setBookingStep('collecting_date');
        return { 
          text: lang === "ms" 
            ? "Takde hal, Boss! Kita mula balik. Boss nak datang tarikh bila?" 
            : "No problem, Boss! Let's start fresh. Which date would you like to reserve, Boss?", 
          isChitchat: false 
        };
      }
    }

    // Human Handoff / Click-to-Call Protocol
    if (lowerInput.includes("help") || lowerInput.includes("manager") || lowerInput.includes("complaint") || lowerInput.includes("call") || lowerInput.includes("number") || lowerInput.includes("nombor")) {
      return { text: (lang === "ms" 
        ? "Saya akan hubungkan Boss dengan manager kami segera. " 
        : "I'll put you in touch with our manager immediately. ") + clickToCallMsg, isChitchat: false };
    }

    // Summary / Status Check
    if (lowerInput.includes("summary") || lowerInput.includes("status") || lowerInput.includes("what have i booked") || lowerInput.includes("apa yang saya dah book")) {
      if (bookingStep !== 'idle') {
        return { text: lang === "ms" 
          ? `Ini status booking Boss setakat ni:\n- Tarikh: **${bookingDate || "N/A"}**\n- Masa: **${bookingTime || "N/A"}**\n- Pax: **${userPax || "N/A"}**\n- Nama: **${userName || "N/A"}**\n- Phone: **${userPhone || "N/A"}**\n\nSila teruskan untuk completekan booking ya, Boss!` 
          : `Here is your booking status so far, Boss:\n- Date: **${bookingDate || "N/A"}**\n- Time: **${bookingTime || "N/A"}**\n- Pax: **${userPax || "N/A"}**\n- Name: **${userName || "N/A"}**\n- Phone: **${userPhone || "N/A"}**\n\nPlease continue to complete your booking, Boss!`, isChitchat: false };
      }
    }

    // Identity / VF Ventures
    if (lowerInput.includes("who are you") || lowerInput.includes("siapa awak") || lowerInput.includes("identity")) {
      return { text: lang === "ms"
        ? `Saya Be Right Back Assistant, manager digital untuk Be Right Back Cafe yang mewakili **${CAFE_INFO.company}**. Saya sedia membantu Boss!`
        : `I am Be Right Back Assistant, the friendly local digital manager for Be Right Back Cafe, representing **${CAFE_INFO.company}**. I'm here to help you, Boss!`, isChitchat: false };
    }

    // Rebuttal for "Too Busy"
    if (lowerInput.includes("full") || lowerInput.includes("busy") || lowerInput.includes("late") || lowerInput.includes("lambat") || lowerInput.includes("penuh")) {
      return { text: lang === "ms"
        ? `Kami memang agak penuh, tapi Boss cuba call ${CAFE_INFO.phone} jap kot-kot ada orang cancel last minute!`
        : `We are quite full, but give us a quick call at ${CAFE_INFO.phone} just in case we have a last-minute cancellation, Boss!`, isChitchat: false };
    }

    // 0. ANSWER FIRST: Check for FAQs, Menu, and Story before booking steps
    let answeredQuestion = "";

    if (lowerInput.includes("story") || lowerInput.includes("sejarah") || lowerInput.includes("asal usul") || lowerInput.includes("about you") || lowerInput.includes("pasal awak")) {
      answeredQuestion = CAFE_INFO.story[lang];
    } else if (lowerInput.includes("location") || lowerInput.includes("mana") || lowerInput.includes("address") || lowerInput.includes("alamat") || lowerInput.includes("find you") || lowerInput.includes("located")) {
      answeredQuestion = lang === "ms" ? `Kami kat sini, Boss:\n${CAFE_INFO.location}` : `We are located here, Boss:\n${CAFE_INFO.location}`;
    } else if (lowerInput.includes("hour") || lowerInput.includes("opening") || lowerInput.includes("open") || lowerInput.includes("buka") || lowerInput.includes("tutup") || lowerInput.includes("waktu operasi")) {
      answeredQuestion = lang === "ms" ? `Waktu operasi kami:\n${CAFE_INFO.hours}` : `Our opening hours are, Boss:\n${CAFE_INFO.hours}`;
    } else if (lowerInput.includes("halal")) {
      answeredQuestion = CAFE_INFO.halal[lang];
    } else if (lowerInput.includes("parking") || lowerInput.includes("letak kereta")) {
      answeredQuestion = CAFE_INFO.parking[lang];
    } else if (lowerInput.includes("special request") || lowerInput.includes("birthday") || lowerInput.includes("cake") || lowerInput.includes("kek") || lowerInput.includes("celebrate")) {
      answeredQuestion = CAFE_INFO.specialRequests[lang];
    } else if (lowerInput.includes("menu") || lowerInput.includes("makan") || lowerInput.includes("minum") || lowerInput.includes("food") || lowerInput.includes("drink")) {
      answeredQuestion = lang === "ms" 
        ? `Boss kena cuba **Chef's Special: Salted Egg Soft Shell Crab Pasta**. Memang laku keras! Boss nak tengok link menu digital penuh kami tak?\n\n${CAFE_INFO.menu}`
        : `You must try our **Chef's Special: Salted Egg Soft Shell Crab Pasta**. It's a crowd favorite! Would you like to see our full digital menu link, Boss?\n\n${CAFE_INFO.menu}`;
    } else if (lowerInput.includes("website") || lowerInput.includes("site") || lowerInput.includes("page") || lowerInput.includes("web") || lowerInput.includes("button") || lowerInput.includes("click") || lowerInput.includes("how does this work") || lowerInput.includes("how to use") || lowerInput.includes("cara guna") || lowerInput.includes("macam mana") || lowerInput.includes("instruction")) {
      answeredQuestion = lang === "ms"
        ? "Website kami ni senang je Boss! Boss boleh scroll untuk tengok gambar cafe, klik button 'Book Now' untuk reserve meja, atau tanya saya terus kat sini. Saya ni Assistant Digital Boss yang sedia membantu!"
        : "Our website is simple, Boss! You can scroll to see cafe photos, click the 'Book Now' buttons to reserve a table, or just ask me anything here. I'm your Digital Assistant and I'm here to help!";
    } else if (userInput.includes("?") || lowerInput.startsWith("why") || lowerInput.startsWith("how") || lowerInput.startsWith("what") || lowerInput.startsWith("kenapa") || lowerInput.startsWith("bagaimana") || lowerInput.startsWith("apa")) {
      // Catch-all for other questions during booking
      if (bookingStep !== 'idle') {
        answeredQuestion = lang === "ms"
          ? "Itu soalan yang bagus, Boss! Tapi saya ni bot yang tengah belajar lagi, so saya mungkin tak tahu jawapan tepat untuk tu. Ada apa-apa lagi pasal cafe atau booking yang saya boleh bantu?"
          : "That's a great question, Boss! However, I'm still a learning bot and might not have the exact answer for that yet. Is there anything else about the cafe or your booking I can help with?";
      }
    }

    if (answeredQuestion) {
      if (bookingStep !== 'idle') {
        const resumeMsg = lang === "ms" 
          ? "\n\nAnyway, berbalik kepada booking tadi—" 
          : "\n\nAnyway, back to your booking—";
        
        let nextStepMsg = "";
        switch (bookingStep) {
          case 'collecting_date': nextStepMsg = lang === "ms" ? "Boss nak datang tarikh bila?" : "Which date would you like to reserve, Boss?"; break;
          case 'collecting_time': nextStepMsg = lang === "ms" ? "Pukul berapa ya?" : "For what time?"; break;
          case 'collecting_pax': nextStepMsg = lang === "ms" ? "Untuk berapa orang (pax)?" : "For how many pax, Boss?"; break;
          case 'collecting_name': nextStepMsg = lang === "ms" ? "Boleh saya tahu Nama Penuh Boss?" : "May I have your Full Name, Boss?"; break;
          case 'collecting_phone': nextStepMsg = lang === "ms" ? "Dan nombor WhatsApp Boss?" : "And your WhatsApp Number, Boss?"; break;
          case 'confirming': nextStepMsg = lang === "ms" ? "Betul tak semua details tadi, Boss?" : "Is everything correct with the details, Boss?"; break;
        }
        return { text: answeredQuestion + resumeMsg + nextStepMsg, isChitchat: false };
      }
      return { text: answeredQuestion + "\n\nWould you like to book a table now?", isChitchat: false };
    }

    // Booking Workflow (One-by-one collection)
    if (bookingStep !== 'idle') {
      switch (bookingStep) {
        case 'collecting_date':
          const dateResult = parseAndValidateDate(userInput);
          if (dateResult.isPast) {
            return {
              text: lang === "ms"
                ? "Maaf Boss, tarikh tu dah lepas! Sila pilih tarikh hari ini atau akan datang."
                : "Sorry Boss, that date has already passed! Please pick a date for today or in the future.",
              isChitchat: false
            };
          }
          if (!dateResult.valid || !dateResult.formattedDate) {
             return {
               text: lang === "ms"
                 ? "Maaf Boss, saya tak dapat tangkap tarikh tu. Boleh bagi format macam 'DD/MM/YYYY' atau 'esok'?"
                 : "Sorry Boss, I didn't quite catch that date. Could you provide it like 'DD/MM/YYYY' or 'tomorrow'?",
               isChitchat: false
             };
          }
          setBookingDate(dateResult.formattedDate);
          setBookingStep('collecting_time');
          return { text: lang === "ms" ? "Boleh, Boss. Pukul berapa ya?" : "Got it, Boss. For what time?", isChitchat: false };
        
        case 'collecting_time':
          const timeRegex = /([01]?[0-9]|2[0-3])\s*[:.]?\s*([0-5][0-9])?\s*(am|pm)?/i;
          if (!timeRegex.test(userInput)) {
            return {
              text: lang === "ms" 
                ? "Maaf Boss, saya tak dapat tangkap masa tu. Boleh bagi format macam '2pm' atau '14:00'?"
                : "Sorry Boss, I didn't quite catch that time. Could you provide it like '2pm' or '14:00'?",
              isChitchat: false
            };
          }
          setBookingTime(userInput);
          setBookingStep('collecting_pax');
          return { text: lang === "ms" ? "Untuk berapa orang (pax)?" : "For how many pax, Boss?", isChitchat: false };

        case 'collecting_pax':
          const paxMatch = userInput.match(/\d+/);
          if (!paxMatch) {
            return {
              text: lang === "ms"
                ? "Berapa orang ya Boss? Boleh bagi nombor, contohnya '2' atau '4'?"
                : "How many people, Boss? Could you provide a number, like '2' or '4'?",
              isChitchat: false
            };
          }
          setUserPax(paxMatch[0]);
          setBookingStep('collecting_name');
          return { text: lang === "ms" ? "Great! Boleh saya tahu Nama Penuh Boss?" : "Great! May I have your Full Name, Boss?", isChitchat: false };

        case 'collecting_name':
          setUserName(userInput);
          setBookingStep('collecting_phone');
          return { text: lang === "ms" ? "Dan nombor WhatsApp Boss?" : "And your WhatsApp Number, Boss?", isChitchat: false };

        case 'collecting_phone':
          const phoneOnly = userInput.replace(/\D/g, '');
          if (phoneOnly.length < 10) {
            return { 
              text: lang === "ms" 
                ? "Maaf Boss, nombor telefon tu nampak tak cukup panjang. Boleh bagi nombor WhatsApp yang betul (sekurang-kurangnya 10 digit)?" 
                : "Sorry Boss, that phone number doesn't seem long enough. Could you provide a valid WhatsApp number (at least 10 digits)?", 
              isChitchat: false 
            };
          }
          setUserPhone(phoneOnly);
          setBookingStep('confirming');
          
          return { 
            text: lang === "ms" 
              ? `Baik Boss! Jom kita double-check jap:\n📅 Tarikh: **${bookingDate}**\n⏰ Masa: **${bookingTime}**\n👥 Pax: **${userPax}**\n📞 Contact: **${phoneOnly}**\n\nBetul tak semua ni, Boss? (Sila tekan Confirm di bawah)` 
              : `Got it, Boss! Just to double-check:\n📅 Date: **${bookingDate}**\n⏰ Time: **${bookingTime}**\n👥 Pax: **${userPax}**\n📞 Contact: **${phoneOnly}**\n\nIs this correct, Boss? (Please click Confirm below)`, 
            isChitchat: false 
          };

        case 'confirming':
          if (lowerInput.includes("yes") || lowerInput.includes("betul") || lowerInput.includes("ya") || lowerInput.includes("correct") || lowerInput.includes("confirm")) {
            handleSubmit(lang);
            
            return { 
              text: lang === "ms" 
                ? "Tunggu jap ya Boss, saya tengah save details..." 
                : "Just a moment Boss, I'm saving your details...", 
              isChitchat: false 
            };
          } else {
            resetBooking();
            setBookingStep('collecting_date');
            return { 
              text: lang === "ms" 
                ? "Takde hal, Boss! Kita mula balik. Boss nak datang tarikh bila?" 
                : "No problem, Boss! Let's start fresh. Which date would you like to reserve, Boss?", 
              isChitchat: false 
            };
          }
      }
    }

    // Start Booking
    if (lowerInput.includes("book") || lowerInput.includes("reserve") || lowerInput.includes("reservation") || lowerInput.includes("meja") || lowerInput.includes("booking")) {
      setBookingStep('collecting_date');
      return { text: lang === "ms" 
        ? "Saya sedia membantu! Boss nak datang tarikh bila?" 
        : "I'd love to help! Which date would you like to reserve, Boss?", isChitchat: false };
    }

    // Date Detection for starting booking (Flexibility)
    const datePattern = /(tomorrow|today|\d{1,2}\/\d{1,2}|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{1,2}|\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/i;
    if (bookingStep === 'idle' && datePattern.test(lowerInput)) {
       const dateMatch = lowerInput.match(datePattern)?.[0] || "";
       const dateResult = parseAndValidateDate(dateMatch);
       
       if (dateResult.isPast) {
         setBookingStep('collecting_date');
         return {
           text: lang === "ms"
             ? "Maaf Boss, tarikh tu dah lepas! Sila pilih tarikh hari ini atau akan datang."
             : "Sorry Boss, that date has already passed! Please pick a date for today or in the future.",
           isChitchat: false
         };
       }
       
       if (dateResult.valid && dateResult.formattedDate) {
         setBookingDate(dateResult.formattedDate);
         setBookingStep('collecting_time');
         return { 
           text: lang === "ms" 
             ? `Boleh, Boss. Untuk tarikh **${dateResult.formattedDate}** tu, pukul berapa ya?` 
             : `Got it, Boss. For **${dateResult.formattedDate}**, what time were you thinking?`, 
           isChitchat: false 
         };
       }
    }

    // --- Chitchat Layer ---
    let chitchatResponse = "";
    
    if (lowerInput.includes("how are you") || lowerInput.includes("apa khabar")) {
      chitchatResponse = lang === "ms"
        ? "Saya sihat je, boss! Sedia membantu. Harap hari Boss pun mantap hari ni. Ada plan nak makan-makan nanti?"
        : "I'm doing great, boss! Just here and ready to help. Hope you're having a fantastic day. Planning to grab some food later?";
    } else if (lowerInput.includes("thank you") || lowerInput.includes("thanks") || lowerInput.includes("terima kasih")) {
      chitchatResponse = lang === "ms" ? "Sama-sama! Happy dapat tolong. Ada apa-apa lagi sebelum Boss pergi?" : "You're most welcome! Happy to help. Anything else you need before you go?";
    } else if (lowerInput.includes("dah makan") || lowerInput.includes("sudah makan")) {
      chitchatResponse = lang === "ms"
        ? "Haha, saya ni bot jadi saya tak makan, tapi bau kopi kat sini buat saya rasa macam nak makan sekali! Boss dah makan tengahari ke belum?"
        : "Haha, I'm a bot so I don't eat, but the smell of the coffee here is making me wish I could! Have you had your lunch yet, Boss?";
    } else if (lowerInput === "boss") {
      chitchatResponse = lang === "ms" ? "Ya, Boss! Apa yang saya boleh bantu?" : "Yes, Boss! What can I do for you?";
    } else if (lowerInput.includes("can i ask") || lowerInput.includes("boleh saya tanya")) {
      chitchatResponse = lang === "ms" ? "Mestilah boleh! Tanya je. Saya tahu hampir semua benda pasal cafe kami." : "Of course! Ask away. I know almost everything about our cafe.";
    } else if (lowerInput.includes("bye") || lowerInput.includes("see you") || lowerInput.includes("jumpa lagi")) {
      chitchatResponse = lang === "ms" ? "Jumpa lagi kat cafe nanti! Semoga hari Boss ceria selalu. 👋" : "See you soon at the cafe! Have a great day ahead, Boss. 👋";
    } else if (lowerInput.includes("think about it") || lowerInput.includes("fikir dulu")) {
      chitchatResponse = lang === "ms" ? "Takde hal! Ambil la masa dulu. Saya ada kat sini kalau Boss decide nak booking meja nanti." : "No problem at all! Take your time. I'll be right here if you decide to book a table later.";
    } else if (lowerInput.includes("hot") || lowerInput.includes("panas") || lowerInput.includes("weather") || lowerInput.includes("cuaca") || lowerInput.includes("rain") || lowerInput.includes("hujan")) {
      chitchatResponse = lang === "ms"
        ? "Betul, Boss! Cuaca hari ni memang tak main-main. Hari yang sesuai untuk duduk dalam air-con dan minum air sejuk. Kami ada Iced Latte yang mantap kalau Boss nak sejukkan badan!"
        : "Betul, Boss! Weather today is no joke. Perfect day to stay in the air-con and have a cold drink. We have a great Iced Latte if you need to cool down!";
    } else if (lowerInput.includes("funny") || lowerInput.includes("joke") || lowerInput.includes("lawak") || lowerInput.includes("kelakar")) {
      chitchatResponse = lang === "ms"
        ? "Haha, saya cuba yang terbaik! Walaupun saya ni bot, saya tahu makanan yang sedap. Cakap pasal tu, Boss dah tengok menu dessert terbaru kami?"
        : "Haha, I try my best! I might be a bot, but I know good food. Speaking of which, have you seen our latest dessert menu, Boss?";
    } else if (lowerInput.includes("talk to staff") || lowerInput.includes("call") || lowerInput.includes("human") || lowerInput.includes("orang") || lowerInput.includes("manusia")) {
      return { 
        text: lang === "ms" 
          ? `Boleh Boss! [Klik sini untuk chat dengan team kami kat WhatsApp](${whatsappLink}).` 
          : `Sure Boss! [Click here to chat with our team on WhatsApp](${whatsappLink}).`, 
        isChitchat: false 
      };
    } else if (lowerInput.includes("syok") || lowerInput.includes("walao") || lowerInput.includes("mantap") || lowerInput.includes("jam") || lowerInput.includes("jem")) {
      chitchatResponse = lang === "ms"
        ? "Saya faham sangat, Boss! Jem kat Georgetown hari ni memang gila. Baik parking awal-awal pastu relax kat cafe kami."
        : "I hear you, Boss! The jam in Georgetown today is crazy. Better to park early and relax at our cafe.";
    }

    if (chitchatResponse) {
      // Pivot Logic: After 2 sentences of drift (on the 3rd message)
      if (chitchatCount >= 2) {
        const pivots = [
          lang === "ms" ? "\n\nAnyway, cukup pasal saya—Boss lapar tak? **Salted Egg Soft Shell Crab Pasta** kami tengah laku keras hari ni!" : "\n\nAnyway, enough about me—are you hungry? Our **Salted Egg Soft Shell Crab Pasta** is selling fast today!",
          lang === "ms" ? "\n\nAlang-alang tu, kalau Boss plan nak datang nanti, saya boleh simpan meja sekarang supaya tak payah tunggu lama." : "\n\nBy the way, if you're planning to come over later, I can save you a seat right now so you don't have to wait, Boss."
        ];
        const bridge = pivots[Math.floor(Math.random() * pivots.length)];
        return { text: chitchatResponse + bridge, isChitchat: true };
      }
      return { text: chitchatResponse, isChitchat: true };
    }

    // Fallback / Complex Request
    if (lowerInput.length > 50) {
      return { text: (lang === "ms" 
        ? "Biar saya check dengan manager jap and saya bagitahu Boss balik, ya? " 
        : "Let me check with the manager and get back to you on that, Boss. ") + clickToCallMsg, isChitchat: false };
    }

    if (bookingStep !== 'idle') {
      return { text: (lang === "ms" 
        ? "Maaf Boss, saya tak berapa faham. Boleh Boss bagi info yang betul untuk booking ni?" 
        : "I'm sorry Boss, I didn't quite catch that. Could you provide the correct info for this booking?") + "\n\n" + clickToCallMsg, isChitchat: false };
    }

    return { text: (lang === "ms" 
      ? "Ada apa-apa lagi yang saya boleh bantu Boss hari ni? Tanya je pasal menu atau location!" 
      : "Is there anything else I can help you with today, Boss? Feel free to ask about our menu or location!") + "\n\n" + clickToCallMsg, isChitchat: true };
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    // Professional delay: 2-4 seconds for "typing" feel
    const delay = 2000 + Math.random() * 2000;
    
    setTimeout(() => {
      const response = getBotResponse(userMessage);
      setMessages((prev) => [...prev, { role: "model", text: response.text }]);
      setIsLoading(false);
      
      if (response.isChitchat) {
        setChitchatCount(prev => prev + 1);
      } else {
        setChitchatCount(0);
      }
    }, delay);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        id="chatbot-toggle"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-charcoal text-gold rounded-full flex items-center justify-center shadow-2xl border border-gold/20"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 md:right-8 z-50 w-[calc(100%-2rem)] md:w-[400px] h-[500px] max-h-[calc(100vh-120px)] bg-cream border border-charcoal/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-charcoal p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
                  <Coffee size={20} className="text-gold" />
                </div>
                <div>
                  <h4 className="text-cream font-serif text-sm font-semibold tracking-wide">Be Right Back Assistant</h4>
                  <p className="text-[10px] text-gold uppercase tracking-widest">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-cream/50 hover:text-gold transition-colors p-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-charcoal text-cream rounded-tr-none"
                        : "bg-charcoal/5 text-charcoal rounded-tl-none border border-charcoal/5"
                    }`}
                  >
                    <div className="markdown-body">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-charcoal/5 p-3 rounded-2xl rounded-tl-none border border-charcoal/5 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-gold" />
                    <span className="text-xs text-charcoal/50 italic">Be Right Back is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {bookingStep === 'confirming' ? (
              <div className="p-4 border-t border-charcoal/5 bg-cream flex gap-2">
                <button
                  onClick={() => {
                    setMessages((prev) => [...prev, { role: "user", text: "Confirm" }]);
                    handleSubmit("en");
                  }}
                  disabled={!bookingDate || !userName || !userPhone || !bookingTime || !userPax}
                  className="flex-1 bg-gold text-charcoal font-semibold py-3 rounded-full disabled:opacity-50 hover:bg-gold-light transition-colors"
                >
                  Confirm Booking
                </button>
                <button
                  onClick={() => {
                    setMessages((prev) => [...prev, { role: "user", text: "Cancel" }]);
                    resetBooking();
                    setBookingStep('collecting_date');
                    setMessages(prev => [...prev, { role: "model", text: "No problem, Boss! Let's start fresh. Which date would you like to reserve, Boss?" }]);
                  }}
                  className="flex-1 bg-charcoal/10 text-charcoal font-semibold py-3 rounded-full hover:bg-charcoal/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="p-4 border-t border-charcoal/5 bg-cream">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about our menu or location..."
                    className="w-full bg-charcoal/5 border border-charcoal/10 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || isSubmitting || !input.trim()}
                    className="absolute right-2 p-2 text-gold hover:text-gold-light disabled:opacity-30 transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase tracking-widest">Sending...</span>
                        <Loader2 size={14} className="animate-spin" />
                      </div>
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-center mt-3 text-charcoal/30 uppercase tracking-widest">
                  Be Right Back Digital Receptionist
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
