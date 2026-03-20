import { motion, AnimatePresence } from "motion/react";
import { Coffee, MapPin, Clock, Instagram, Menu as MenuIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface LayoutProps {
  onReserveClick: () => void;
}

export const Navbar = ({ onReserveClick }: LayoutProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Menu", href: "#menu" },
    { name: "Reviews", href: "#reviews" },
    { name: "Location", href: "#location" },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-cream/90 backdrop-blur-md py-4 shadow-sm" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a 
          href="#home"
          className="text-2xl font-serif font-semibold tracking-tight"
        >
          Be Right Back <span className="text-gold">Cafe</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm uppercase tracking-widest hover:text-gold transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all group-hover:w-full"></span>
            </a>
          ))}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReserveClick}
            className="px-6 py-2 border border-charcoal text-xs uppercase tracking-widest hover:bg-charcoal hover:text-cream transition-all"
          >
            Reserve
          </motion.button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-cream border-t border-charcoal/5 py-8 px-6 flex flex-col space-y-6 md:hidden shadow-xl"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-serif tracking-wide"
            >
              {link.name}
            </a>
          ))}
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              onReserveClick();
            }}
            className="w-full py-4 border border-charcoal text-sm uppercase tracking-widest"
          >
            Reserve a Table
          </button>
        </motion.div>
      )}
    </nav>
  );
};

export const Hero = ({ onReserveClick }: LDayoutProps) => (
  <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 z-0">
      <img
        src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=2078"
        alt="Coffee"
        className="w-full h-full object-cover opacity-40 grayscale-[0.3]"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cream/20 via-transparent to-cream"></div>
    </div>

    <div className="relative z-10 text-center px-6 max-w-4xl">
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-charcoal uppercase tracking-[0.3em] text-xs font-semibold mb-4 block"
      >
        Est. 2024 • Malaysia, Selangor
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-6xl md:text-8xl font-serif mb-8 leading-tight"
      >
        Artisanal Coffee, <br />
        <span className="italic">Malaysian Soul.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-lg md:text-xl text-charcoal/70 mb-10 max-w-2xl mx-auto font-light leading-relaxed"
      >
        Experience the perfect blend of traditional Malaysian hospitality and modern brewing excellence in the heart of Shah Alam.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <a href="#menu" className="px-10 py-4 bg-charcoal text-cream text-sm uppercase tracking-widest hover:bg-gold transition-colors hover:scale-105 transform duration-200">
          View Menu
        </a>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReserveClick}
          className="px-10 py-4 border border-charcoal text-sm uppercase tracking-widest hover:bg-charcoal hover:text-cream transition-colors"
        >
          Reserve Table
        </motion.button>
      </motion.div>
    </div>

    <motion.div
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30"
    >
      <div className="w-[1px] h-12 bg-charcoal"></div>
    </motion.div>
  </section>
);

export const About = () => (
  <section id="about" className="py-24 px-6 bg-cream">
<div className="max-w-3xl mx-auto text-center">        
  <h2 className="text-gold uppercase tracking-widest text-sm font-semibold mb-4">Our Story</h2>
        <h3 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">
          Where Heritage Meets <br />
          <span className="italic">Modernity.</span>
        </h3>
        <div className="space-y-6 text-charcoal/80 leading-relaxed font-light">
          <p>
            Be Right Back Cafe was born from a simple desire: to elevate the Malaysian 'Kopitiam' experience for the modern era. The name represents a sanctuary where people gather under one roof.
          </p>
          <p>
            We source our beans from sustainable farms across Southeast Asia, roasting them locally in small batches to ensure every cup tells a story of its origin. Our space is designed to be your urban escape—minimalist, warm, and inviting.
          </p>
        </div>
    </div>
  </section>
);

export const Menu = () => {
  const categories = [
    {
      title: "Signature Coffee",
      items: [
        { name: "Be Right Back Gula Melaka Latte", price: "RM 16", desc: "Double espresso with artisanal palm sugar and creamy milk." },
        { name: "Pandan Infused Cold Brew", price: "RM 14", desc: "12-hour slow drip with fresh pandan leaf essence." },
        { name: "Charcoal Seasalt Latte", price: "RM 15", desc: "Our signature dark roast with a hint of oceanic saltiness." },
      ]
    },
    {
      title: "Local Favorites",
      items: [
        { name: "Modern Kopi O", price: "RM 8", desc: "Traditional dark roast served with a modern clarity." },
        { name: "Teh Tarik Special", price: "RM 10", desc: "Pulled tea with a layer of frothy condensed milk foam." },
        { name: "Rose Bandung Fizz", price: "RM 12", desc: "Sparkling rose syrup with a splash of evaporated milk." },
      ]
    }
  ];

  return (
    <section id="menu" className="py-24 px-6 bg-charcoal text-cream">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-[#E5C158] uppercase tracking-widest text-sm font-semibold mb-4">The Menu</h2>
          <h3 className="text-4xl md:text-6xl font-serif italic">Crafted with Care</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-32">
          {categories.map((cat) => (
            <div key={cat.title}>
              <h4 className="text-xl font-serif mb-10 border-b border-cream/10 pb-4 text-[#E5C158]">{cat.title}</h4>
              <div className="space-y-12">
                {cat.items.map((item) => (
                  <div key={item.name} className="group cursor-default">
                    <div className="flex justify-between items-baseline mb-2">
                      <h5 className="text-lg font-medium text-white">{item.name}</h5>
                      <span className="text-cream font-serif">{item.price}</span>
                    </div>
                    <p className="text-sm text-cream/50 font-light italic">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <button className="px-12 py-5 bg-cream text-charcoal font-semibold text-sm uppercase tracking-[0.2em] hover:bg-white transition-all">
            Download Full Menu
          </button>
        </div>
      </div>
    </section>
  );
};

export const Reviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const reviews = [
    {
      name: "Nina Arisha",
      rating: 5,
      text: "We got the Strawberry Matcha latte which was delicious! The coffee is good as well, We also had Houjicha burnt cheesecake that we would definitely get again! The service here was good too. The cafe was clean and very comfortable"
    },
    {
      name: "aisah omar",
      rating: 5,
      text: "This is my go-to coffee place. Their Iced Latte, by far, is the best one! Another favourite is Iced Shaken Oat Vanilla Latte; it's so good, definitely a 10/10 (if you're into coffee but doesn't like too bitter aftertaste, go for this"
    },
    {
      name: "zaidatul mardiah",
      rating: 5,
      text: "I love the vibe! The staff also so kind, we ask to celebrate our friend’s birthday and they very supportive to do the suprise! Hehe thank you! The cake is so good! Definitely will come again to try other cakes"
    },
    {
      name: "Angel D",
      rating: 5,
      text: "Nice assortment of cakes with interesting flavors. Appreciated the lower sugar content and unique and light flavor pairings. The earl grey lychee was light and airy and had flavors of both. My son devoured the lemon slice. The hojicha"
    },
    {
      name: "Ipoh Mali Leong",
      rating: 5,
      text: "A small little cafe that steal my heart. The coffee served are super good with delicious cakes! The sea salt cake is extraordinary and tasty. The cup cakes are so pretty. The cafe is very brightly lit with soft pastel decor. Very modern"
    },
    {
      name: "Shareena Budi",
      rating: 5,
      text: "Love the atmosphere here—very chill and suitable if you want to study or get some work done. They also have power sockets! 👍🏻 and the staff here very friendly too!"
    },
    {
      name: "Wei Lin Woon",
      rating: 5,
      text: "My sisters and I love their umami matcha the most! We ordered ice dark chocolate and rose latte. I personally love the umami matcha as it does really give a well balance of umami. Love their dark chocolate (it's an eye opening for us)."
    },
    {
      name: "Hazel Teh",
      rating: 5,
      text: "I absolutely love the environment here—it's cozy and peaceful. Tried the rose-flavored latte, homemade osmanthus syrup latte, and the Mango Tango (mango cheesecake). The sweetness of both the drinks and cake is perfectly balanced. Will definitely revisit 🫶🏻"
    },
    {
      name: "balkis razak",
      rating: 5,
      text: "Love the cafe and drinks here. Had a wonderful experience and the cafe is beautiful too!! Ofcz will repeat !!"
    },
    {
      name: "YL Choong",
      rating: 5,
      text: "Be Right Back is a hidden gem for dessert and coffee lovers. Their freshly baked cakes are a delight—perfectly moist with smooth, subtly sweet cream that’s just right. They make an excellent dessert choice, especially after a meal."
    },
    {
      name: "noshini suppiah",
      rating: 5,
      text: "We had the Earl Grey Lychee Rose cake and a slice of the Macadamia cake which were light, airy with perfectly balanced flavours. Not too sweet, just lovely! We also had a Vanilla Latte and the Matcha Latte with oatmilk, which paired well with our cakes. The mango sticky rice was nice too. Ambience was nice and relaxing while the staff were knowledgeable and friendly! Will be back for sure!❤️🌸"
    },
    {
      name: "Pui Ye Yee",
      rating: 5,
      text: "Really enjoyed and amazed by their Earl Grey Lychee Rose Cake. Well balanced and not too sweet. Glad that there’s such a good cake shop in setia alam area and the cafe is cosy too! Do drop by and give it a try! 😊 Will definitely ‘be right back’ again to try other cakes and pastries 😋"
    },
    {
      name: "Raudhatul Farhana",
      rating: 5,
      text: "Such a cozy and beautifully designed space! The calm ambiance, thoughtful decor, and delicious treats make this spot a true hidden gem. The cake tasted very nice and delicious. The matcha latte also very sedap! Perfect for a chill hangout or a quiet moment alone. Can’t wait to come back!"
    },
    {
      name: "Aisyah Nabilah",
      rating: 5,
      text: "Comfortable place to hang out with your friends! I ordered their Iced Oat Chocolate and the sweetness is satisfactory. I love this place so much."
    },
    {
      name: "Bella Md Nor",
      rating: 5,
      text: "Be right back is the perfect spot for cake and coffee lovers. The burnt cheese cake is my favourite, rich creamy and perfectly balanced. The coffee is smooth and pairs beautifully with desserts. If you're looking for a cafe with delicious cakes and great coffee and a cozy ambiance, Be right back is the place to be! I'll definitely coming back for more. 🤍🤍🤍"
    }
  ];

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, reviews.length]);

  const nextReview = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <section id="reviews" className="py-24 px-6 bg-cream overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-gold uppercase tracking-widest text-sm font-semibold mb-4">Reviews</h2>
          <h3 className="text-4xl md:text-5xl font-serif italic">What Our Customers Say</h3>
        </div>

        <div 
          className="relative bg-white p-8 md:p-16 rounded-sm shadow-sm border border-charcoal/5 min-h-[400px] flex flex-col justify-center items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-center max-w-3xl mx-auto w-full"
            >
              <div className="flex justify-center gap-1 mb-8">
                {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-[#E5C158] fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xl md:text-2xl text-charcoal/80 font-light italic mb-8 leading-relaxed">
                "{reviews[currentIndex].text}"
              </p>
              <div className="font-semibold text-sm uppercase tracking-wider text-charcoal">
                {reviews[currentIndex].name}
              </div>
            </motion.div>
          </AnimatePresence>

          <button 
            onClick={prevReview}
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-2 text-charcoal/30 hover:text-gold transition-colors"
            aria-label="Previous review"
          >
            <ChevronLeft size={36} />
          </button>
          <button 
            onClick={nextReview}
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-2 text-charcoal/30 hover:text-gold transition-colors"
            aria-label="Next review"
          >
            <ChevronRight size={36} />
          </button>
        </div>

        <div className="flex justify-center flex-wrap gap-2 mt-10 max-w-2xl mx-auto">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "bg-gold w-8" : "bg-charcoal/20 w-2 hover:bg-charcoal/40"
              }`}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const Location = () => (
  <section id="location" className="py-24 px-6 bg-cream">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
      <div className="lg:w-1/3">
        <h2 className="text-gold uppercase tracking-widest text-sm font-semibold mb-4">Visit Us</h2>
        <h3 className="text-4xl font-serif mb-8">Find Your Sanctuary</h3>
        
        <div className="space-y-8">
          <div className="flex gap-4">
            <MapPin className="text-gold shrink-0" size={24} />
            <div>
              <h4 className="font-semibold mb-1">Address</h4>
              <p className="text-charcoal/70 font-light">
                D-01-02 (First Floor, Eco Ardence Huni Square,<br />
                8, Persiaran Setia Damai, Seksyen U13,<br />
                40170 Shah Alam, Selangor
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Clock className="text-gold shrink-0" size={24} />
            <div>
              <h4 className="font-semibold mb-1">Hours</h4>
              <p className="text-charcoal/70 font-light">
                Wed - Mon: 11:00 AM - 9:00 PM<br />
                Tue: Closed
              </p>
            </div>
          </div>

          <div className="pt-8 flex gap-6">
            <a 
              href="https://www.instagram.com/berightback.cafe/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-3 border border-charcoal/10 hover:border-gold hover:text-gold transition-all"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
      
      <div className="lg:w-2/3 w-full h-[450px] bg-charcoal/5 relative overflow-hidden rounded-[15px] shadow-sm">
        <iframe 
          src="https://www.google.com/maps?q=Be+Right+Back+Cafe,+Eco+Ardence+Huni+Square,+Shah+Alam&output=embed" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={true} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Be Right Back Cafe Location"
        ></iframe>
      </div>
    </div>
  </section>
);

export const Footer = () => (
  <footer className="py-12 px-6 border-t border-charcoal/5 bg-cream">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="text-xl font-serif font-semibold">
        Be Right Back <span className="text-gold">Cafe</span>
      </div>
      
      <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
        <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-gold transition-colors">Careers</a>
      </div>
      
      <div className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
        © 2024 Be Right Back Cafe. All Rights Reserved.
      </div>
    </div>
  </footer>
);
