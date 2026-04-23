import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { ShoppingBag, User, ArrowRight, ArrowUpRight, Menu, Plus, Check, ChevronDown, Star, Mail, MapPin, Phone, X, ArrowDown } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  image?: string;
  isLimited?: boolean;
  category: string;
  hairTypes: string[];
}

interface CartItem extends Product {
  quantity: number;
}

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Page Wrapper for consistent scroll reveal
function PageWrapper({ children }: { children: React.ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useGSAP(() => {
    // Reveal animations
    const reveals = gsap.utils.toArray('.reveal');
    reveals.forEach((el: any) => {
      gsap.fromTo(el, 
        { y: 60, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.2, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          }
        }
      );
    });

    // Staggered reveals
    const staggerSections = gsap.utils.toArray('.stagger-section');
    staggerSections.forEach((section: any) => {
      gsap.fromTo(section.querySelectorAll('.stagger-item'),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
          }
        }
      );
    });

    // Scroll top on navigation
    window.scrollTo(0, 0);
  }, [location]);

  return <div ref={pageRef}>{children}</div>;
}

function ConditionalFooter() {
  const location = useLocation();
  const isCollectionsPage = location.pathname === '/collections';
  
  if (isCollectionsPage) return null;
  return <Footer />;
}

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useGSAP(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
    
    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <Router>
      <div className="bg-background min-h-screen selection:bg-primary selection:text-on-primary">
        <TopNavBar cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />
        <main className="max-w-[2000px] mx-auto overflow-hidden">
          <PageWrapper>
            <Routes>
              <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/collections" element={<CollectionsPage onAddToCart={addToCart} />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </PageWrapper>
        </main>
        <ConditionalFooter />
        
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
        />
      </div>
    </Router>
  );
}

const PRODUCTS: Product[] = [
  { 
    id: '1', title: 'SILK HYDRATION MIST', subtitle: '150ML / 5.1 FL.OZ', price: 38,
    category: 'SILK SERIES', hairTypes: ['STRAIGHT', 'WAVY'],
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: '2', title: 'ROOT REVIVAL SERUM', subtitle: '50ML / 1.7 FL.OZ', price: 52, isLimited: true,
    category: 'VOLUME ROOTS', hairTypes: ['CURLY', 'COILY'],
    image: 'https://images.unsplash.com/photo-1631730359585-38a4935cbb2e?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: '3', title: 'GLOSSING TREATMENT', subtitle: '200ML / 6.8 FL.OZ', price: 44,
    category: 'SILK SERIES', hairTypes: ['STRAIGHT'],
    image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: '4', title: 'VOLUME TEXTURE SPRAY', subtitle: '150ML / 5.1 FL.OZ', price: 32,
    category: 'VOLUME ROOTS', hairTypes: ['WAVY', 'CURLY'],
    image: 'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: '5', title: 'ESSENTIAL CLEANSER', subtitle: '250ML / 8.5 FL.OZ', price: 34,
    category: 'ESSENTIAL CARE', hairTypes: ['STRAIGHT', 'WAVY', 'CURLY', 'COILY'],
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143af7be?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: '6', title: 'SCALP DETOX OIL', subtitle: '100ML / 3.4 FL.OZ', price: 48,
    category: 'ESSENTIAL CARE', hairTypes: ['STRAIGHT', 'WAVY'],
    image: 'https://images.unsplash.com/photo-1601055283742-ce3a638977ee?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: '7', title: 'MOISTURE LOCK MASK', subtitle: '300ML / 10.1 FL.OZ', price: 56,
    category: 'SILK SERIES', hairTypes: ['CURLY', 'COILY'],
    image: 'https://images.unsplash.com/photo-1552046122-03184de85e08?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: '8', title: 'BOND REPAIR ELIXIR', subtitle: '30ML / 1.0 FL.OZ', price: 64,
    category: 'ESSENTIAL CARE', hairTypes: ['STRAIGHT', 'WAVY', 'CURLY', 'COILY'],
    image: 'https://images.unsplash.com/photo-1624454002302-36b824d7bd0a?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: '9', title: 'DAILY BRIGHTENING SHAMPOO', subtitle: '250ML / 8.5 FL.OZ', price: 32,
    category: 'ESSENTIAL CARE', hairTypes: ['STRAIGHT', 'WAVY'],
    image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: '10', title: 'FIBER SEALANT', subtitle: '50ML / 1.7 FL.OZ', price: 42,
    category: 'VOLUME ROOTS', hairTypes: ['WAVY'],
    image: 'https://images.unsplash.com/photo-1600431521340-491dea880bf1?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: '11', title: 'LUSTRE FINISH', subtitle: '100ML / 3.4 FL.OZ', price: 36,
    category: 'SILK SERIES', hairTypes: ['STRAIGHT', 'WAVY'],
    image: 'https://images.unsplash.com/photo-1527799822394-4d1445722104?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: '12', title: 'VELVET CONDITIONER', subtitle: '500ML / 16.9 FL.OZ', price: 78,
    category: 'VOLUME ROOTS', hairTypes: ['CURLY', 'COILY'],
    image: 'https://images.unsplash.com/photo-1535585209827-a15fefbc74a9?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '13', title: 'NIGHT REPAIR BALM', subtitle: '50ML / 1.7 FL.OZ', price: 68,
    category: 'ESSENTIAL CARE', hairTypes: ['CURLY', 'COILY'],
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '14', title: 'SHINE INFUSION', subtitle: '100ML / 3.4 FL.OZ', price: 45,
    category: 'SILK SERIES', hairTypes: ['STRAIGHT'],
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '15', title: 'THICKENING FOAM', subtitle: '150ML / 5.1 FL.OZ', price: 39,
    category: 'VOLUME ROOTS', hairTypes: ['WAVY', 'CURLY'],
    image: 'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?q=80&w=800&auto=format&fit=crop'
  }
];

function HomePage({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  return (
    <>
      <section className="pt-[90px] px-6 md:px-10 mb-6 reveal overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 h-auto md:h-[calc(100vh-160px)]">
          {/* Left Panel */}
          <div className="flex-grow h-[300px] md:h-full rounded-[40px] overflow-hidden relative group">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              className="w-full h-full object-cover"
              src="https://res.cloudinary.com/dad155oxi/video/upload/v1776916650/baby_.jewels_ft_our_26_Burmese_Raw_Unit_Hair_specs_26_jnkv0u.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-600/60 via-stone-400/20 to-transparent"></div>
            <div className="absolute bottom-12 left-12 flex items-baseline group pointer-events-none">
              <h1 className="font-display font-medium text-white mix-blend-overlay text-5xl md:text-7xl leading-none tracking-tighter uppercase">
                EVANÉ
              </h1>
            </div>
          </div>
          
          {/* Right Column Cards */}
          <div className="w-full md:w-[320px] lg:w-[380px] flex flex-col gap-4 stagger-section h-full">
            <HeroCategoryCard 
              category="01" 
              title="Collections" 
              image="https://res.cloudinary.com/dad155oxi/image/upload/v1776926154/WhatsApp_Image_2026-04-23_at_1.33.01_AM_wc7t0i.jpg"
              link="/collections"
              className="stagger-item" 
            />
            <HeroCategoryCard 
              category="02" 
              title="About Us" 
              image="https://res.cloudinary.com/dad155oxi/image/upload/v1776919139/WhatsApp_Image_2026-04-22_at_11.01.51_PM_qj53ul.jpg"
              link="/about"
              className="stagger-item" 
            />
            <HeroCategoryCard 
              category="03" 
              title="Contact Us" 
              video="https://res.cloudinary.com/dad155oxi/video/upload/v1776926695/Evane_bag_Gif_zwgusm.mp4"
              link="/contact"
              className="stagger-item" 
            />
          </div>
        </div>
      </section>

      {/* Philosophy Marquee */}
      <section className="py-20 border-y border-black/5 overflow-hidden bg-stone-50">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-10 px-5">
              <span className="text-[10px] tracking-[0.6em] font-bold uppercase opacity-30">Purity by Design</span>
              <div className="w-2 h-2 rounded-full bg-black/10" />
              <span className="text-[10px] tracking-[0.6em] font-bold uppercase opacity-30">Artisanal Fiber</span>
              <div className="w-2 h-2 rounded-full bg-black/10" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideImages = [
    "https://res.cloudinary.com/dad155oxi/image/upload/v1776929488/evane_model_sdpgcf.jpg",
    "https://res.cloudinary.com/dad155oxi/image/upload/v1776930148/evane_model_3_oetagk.jpg",
    "https://res.cloudinary.com/dad155oxi/image/upload/v1776930150/evane_model_2_cel7co.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slideImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slideImages.length]);

  return (
    <section className="h-screen w-full flex overflow-hidden border-t border-black bg-white relative z-30">
      {/* LEFT PANEL: STATIC MAG CANVAS (60%) */}
      <div className="w-[60%] h-full flex items-end p-12 border-r border-black relative shrink-0 overflow-hidden bg-[#EDEDED]">
        {slideImages.map((src, idx) => (
          <img 
            key={idx}
            src={src} 
            alt={`About slide ${idx + 1}`} 
            className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-all duration-[1500ms] ease-in-out hover:scale-105 ${idx === currentSlide ? 'opacity-80 z-10' : 'opacity-0 z-0'}`}
          />
        ))}
        <h2 className="text-[16vw] font-display select-none uppercase -ml-4 -mb-4 relative z-10 leading-none text-black/15 pointer-events-none">
          ABOUT
        </h2>
      </div>

      {/* SCROLL INDICATOR PILL - AT THE SEAM */}
      <div className="absolute bottom-10 left-[60%] -translate-x-1/2 z-40 bg-white border border-black rounded-full px-2 py-6 flex flex-col items-center gap-6 shadow-sm transition-luxury hover:scale-110">
        <span className="vertical-text text-[10px] tracking-[0.5em] font-bold opacity-30 uppercase">SCROLL</span>
        <div className="w-[1px] h-16 bg-black/20" />
      </div>

      {/* RIGHT PANEL: INDEPENDENT SCROLL ZONE (40%) */}
      <div className="w-[40%] h-full overflow-y-auto custom-scrollbar bg-white relative z-20" data-lenis-prevent>
        <div className="p-10 flex flex-col gap-12 pb-40 stagger-section">
          <div className="flex flex-row gap-4 stagger-item">
            <div className="flex-1 rounded-[40px] border border-black p-10 flex flex-col justify-center space-y-6">
              <h3 className="text-3xl uppercase tracking-widest font-display">WHO ARE WE?</h3>
              <p className="text-sm leading-relaxed opacity-70">
                We specialize in premium hair care formulations and artisanal extensions. We create high-quality, sustainable and visually refined hair products for brands and creators.
              </p>
            </div>
            <div className="w-32 h-64 rounded-[40px] border border-black overflow-hidden shrink-0">
              <img 
                src="https://res.cloudinary.com/dad155oxi/image/upload/v1776926695/WhatsApp_Image_2026-04-23_at_1.42.55_AM_ibh2ik.jpg" 
                alt="Artisanal detail" 
                className="w-full h-full object-cover transition-luxury hover:scale-110"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 stagger-item">
            <AboutValueCard title="PREMIUM QUALITY" subtext="COLD-PRESSED ESSENCE" />
            <AboutValueCard title="HAND CRAFTED" subtext="SMALL BATCH" />
            <AboutValueCard title="DESIGN FOCUSED" subtext="MODERN SCIENCE" />
          </div>

          <div className="flex flex-row gap-4 stagger-item">
            <div className="w-40 h-auto self-stretch rounded-[40px] border border-black overflow-hidden shrink-0">
              <img 
                src="https://res.cloudinary.com/dad155oxi/image/upload/v1776930657/WhatsApp_Image_2026-04-23_at_2.49.12_AM_ixoab4.jpg" 
                alt="Process detail" 
                className="w-full h-full object-cover transition-luxury hover:scale-110"
              />
            </div>
            <div className="flex-1 rounded-[40px] border border-black p-10 flex flex-col items-center text-center space-y-8">
              <div className="flex items-center gap-4 w-full">
                <div className="h-[1px] flex-grow bg-neutral-200" />
                <span className="text-[10px] tracking-widest font-bold opacity-30">EST. 2024</span>
                <div className="h-[1px] flex-grow bg-neutral-200" />
              </div>
              <div className="space-y-4">
                <h4 className="text-xl uppercase tracking-widest font-display">OUR STORY</h4>
                <p className="text-xs leading-relaxed italic-display opacity-80 italic font-display">
                  "Bridging artisanal heritage and modern fiber science."
                </p>
                <div className="text-[11px] leading-[1.8] opacity-70 space-y-4">
                  <p>Every strand undergoes a proprietary purification process that preserves natural integrity.</p>
                  <p className="uppercase tracking-[0.2em] font-medium border-t border-black/10 pt-4 mt-2">
                    Purified strand integrity. <br/> Artisanal fiber science.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CollectionsPage({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  const [activeCategory, setActiveCategory] = useState('ALL PRODUCTS');
  const [hairType, setHairType] = useState<string[]>([]);

  const [priceRange, setPriceRange] = useState<number>(100);

  const categories = [
    { name: 'ALL PRODUCTS', count: PRODUCTS.length },
    { name: 'SILK SERIES', count: PRODUCTS.filter(p => p.category === 'SILK SERIES').length },
    { name: 'VOLUME ROOTS', count: PRODUCTS.filter(p => p.category === 'VOLUME ROOTS').length },
    { name: 'ESSENTIAL CARE', count: PRODUCTS.filter(p => p.category === 'ESSENTIAL CARE').length },
  ];

  const hairTypes = ['STRAIGHT', 'WAVY', 'CURLY', 'COILY'];

  const toggleHairType = (type: string) => {
    setHairType(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = activeCategory === 'ALL PRODUCTS' || product.category === activeCategory;
    const matchesHairType = hairType.length === 0 || product.hairTypes.some(ht => hairType.includes(ht));
    const matchesPrice = product.price <= priceRange;
    return matchesCategory && matchesHairType && matchesPrice;
  });

  return (
    <section className="h-screen w-full flex overflow-hidden bg-white">
      {/* SIDEBAR ZONE - SCROLL ZONE 1 */}
      <aside 
        data-lenis-prevent
        className="w-[280px] h-full border-r border-wire flex flex-col shrink-0 p-8 pt-32 relative z-20 bg-white overflow-y-auto custom-scrollbar"
      >
        <div className="mb-12">
          <h4 className="text-[10px] tracking-[0.5em] font-bold mb-2 uppercase opacity-40">FILTERS</h4>
        </div>
        
        <div className="space-y-12 flex-grow">
          {/* CATEGORY ACCORDION */}
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.3em] uppercase opacity-40 font-bold block">CATEGORY</span>
            <div className="space-y-3">
              {categories.map((cat) => (
                <button 
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`w-full flex justify-between items-center text-[10px] tracking-widest transition-luxury py-1 border-b ${
                    activeCategory === cat.name ? 'border-black font-bold opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[9px] opacity-40">({cat.count < 10 ? `0${cat.count}` : cat.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* HAIR TYPE CHECKBOXES */}
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.3em] uppercase opacity-40 font-bold block">HAIR TYPE</span>
            <div className="space-y-3">
              {hairTypes.map((type) => (
                <button 
                  key={type}
                  onClick={() => toggleHairType(type)}
                  className="flex items-center gap-3 group w-full"
                >
                  <div className={`w-3 h-3 border border-black flex-shrink-0 transition-luxury rounded-[2px] ${hairType.includes(type) ? 'bg-black' : 'bg-transparent'}`} />
                  <span className={`text-[10px] tracking-[0.1em] transition-luxury ${hairType.includes(type) ? 'opacity-100 font-bold' : 'opacity-40 group-hover:opacity-100'}`}>
                    {type}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* PRICE SLIDER */}
          <div className="space-y-6">
            <span className="text-[10px] tracking-[0.3em] uppercase opacity-40 font-bold block">PRICE RANGE (UP TO £{priceRange})</span>
            <div className="relative pt-2">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-[1px] bg-black/20 appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between mt-4">
                <span className="text-[10px] font-medium">£0.00</span>
                <span className="text-[10px] font-medium">£100.00</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT ZONE - SCROLL ZONE 2 */}
      <div 
        data-lenis-prevent
        className="flex-grow h-full overflow-y-auto custom-scrollbar p-6 pt-32 pb-32 pr-2 stagger-section"
      >
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-10">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={() => onAddToCart(product)}
                className="stagger-item"
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] tracking-[0.3em] uppercase opacity-40">No products match your filters.</p>
          </div>
        )}

        {/* LOAD MORE */}
        <div className="flex flex-col items-center mt-20 mb-12">
          <button className="w-12 h-12 border-wire rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-luxury group">
            <ArrowDown size={16} className="group-hover:translate-y-0.5 transition-luxury" />
          </button>
          <span className="mt-4 text-[10px] tracking-[0.4em] uppercase opacity-40 font-bold">LOAD MORE</span>
        </div>
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="pt-32 px-6 md:px-10 mb-24 reveal min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-7xl font-display uppercase tracking-tighter">Contact Us</h2>
            <p className="text-lg opacity-60 leading-relaxed max-w-md">
              Whether you're looking for a bespoke consultation or have questions about our artisanal range, we're here to help.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-luxury">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] font-bold opacity-40 uppercase">Email Us</p>
                <p className="text-lg">studio@evanehair.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-luxury">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] font-bold opacity-40 uppercase">Call Us</p>
                <p className="text-lg">+44 (0) 20 7946 0123</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-luxury">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] font-bold opacity-40 uppercase">Visit Us</p>
                <p className="text-lg">15 Savile Row, London, W1S 3PJ</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-stone-50 rounded-[40px] p-10 md:p-12 border hairline-border">
          <form className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] tracking-[0.2em] font-bold uppercase opacity-40">First Name</label>
                <input type="text" className="w-full bg-transparent border-b border-black/10 py-2 focus:border-black outline-none transition-luxury" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] tracking-[0.2em] font-bold uppercase opacity-40">Last Name</label>
                <input type="text" className="w-full bg-transparent border-b border-black/10 py-2 focus:border-black outline-none transition-luxury" />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] tracking-[0.2em] font-bold uppercase opacity-40">Email Address</label>
              <input type="email" className="w-full bg-transparent border-b border-black/10 py-2 focus:border-black outline-none transition-luxury" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] tracking-[0.2em] font-bold uppercase opacity-40">Your Message</label>
              <textarea rows={4} className="w-full bg-transparent border-b border-black/10 py-2 focus:border-black outline-none transition-luxury resize-none" />
            </div>
            <button className="w-full bg-black text-white py-5 rounded-full text-[10px] tracking-[0.3em] font-bold hover:bg-neutral-800 transition-luxury uppercase">
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function AboutValueCard({ title, subtext }: { title: string; subtext: string }) {
  return (
    <div className="rounded-[30px] border border-black p-6 flex flex-col items-center text-center space-y-4">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} fill="black" strokeWidth={0} className="scale-75" />
        ))}
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] uppercase font-bold tracking-widest">{title}</h4>
        <p className="text-[8px] text-neutral-400 uppercase tracking-widest leading-tight">{subtext}</p>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  className?: string;
  key?: any;
}

function ProductCard({ product, onAddToCart, className = "" }: ProductCardProps) {
  const { title, price, subtitle, isLimited, image } = product;
  
  return (
    <div className={`group cursor-pointer ${className}`}>
      <div className={`relative aspect-[4/5] border-wire overflow-hidden rounded-[24px] ${isLimited ? 'bg-black' : 'bg-white'}`}>
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover transition-luxury group-hover:scale-110 opacity-80" />
        ) : isLimited ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-white text-[10px] tracking-[0.5em] uppercase font-bold rotate-90 whitespace-nowrap">
              LIMITED RELEASE
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 wireframe-placeholder" />
        )}
        
        <div className={`absolute inset-0 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-luxury backdrop-blur-[1px] ${isLimited ? 'bg-black/60' : 'bg-white/40'}`}>
          <button 
            onClick={(e) => {
              e.preventDefault();
              onAddToCart();
            }}
            className={`w-full h-11 border-wire text-[10px] tracking-[0.2em] font-bold flex items-center justify-center gap-2 transition-luxury uppercase rounded-full ${
              isLimited ? 'text-white border-white' : 'text-black border-black'
            }`}
          >
            QUICK ADD
          </button>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-start">
        <div className="space-y-0.5">
          <h3 className="text-sm font-normal tracking-tighter uppercase leading-tight">{title}</h3>
          <p className="text-[10px] opacity-50 uppercase tracking-[0.05em]">{subtitle}</p>
        </div>
        <span className="text-sm font-normal">£{price.toFixed(2)}</span>
      </div>
    </div>
  );
}

function TopNavBar({ cartCount, onOpenCart }: { cartCount: number; onOpenCart: () => void }) {
  return (
    <nav className="fixed top-0 w-full z-50 h-[100px] px-8 md:px-16 flex justify-between items-center bg-transparent">
      <Link to="/" className="flex items-baseline flex-shrink-0 group">
        <span className="text-xl font-display font-bold tracking-tighter">EVANÉ</span>
        <span className="font-display italic text-2xl ml-1 lowercase leading-none opacity-80 group-hover:opacity-100 transition-luxury">hair</span>
      </Link>
      <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
        <Link to="/collections" className="text-[10px] font-bold tracking-[0.2em] uppercase hover:opacity-60 transition-luxury">COLLECTIONS</Link>
        <Link to="/about" className="text-[10px] font-bold tracking-[0.2em] uppercase hover:opacity-60 transition-luxury">ABOUT US</Link>
        <Link to="/contact" className="text-[10px] font-bold tracking-[0.2em] uppercase hover:opacity-60 transition-luxury">CONTACT US</Link>
      </div>
      <div className="flex items-center flex-shrink-0">
        <button onClick={onOpenCart} className="hover:opacity-50 transition-luxury relative">
          <ShoppingBag size={20} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}

function HeroCategoryCard({ category, title, image, video, link, className = "" }: { category: string; title: string; image?: string; video?: string; link: string; className?: string }) {
  // Determine bottom text based on the title to resemble the reference
  const bottomText = title.toUpperCase() === "COLLECTIONS" ? "SHOP" : title.split(" ")[0].toUpperCase();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) videoRef.current.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    if (videoRef.current) videoRef.current.pause();
  };

  return (
    <Link 
      to={link} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`flex-1 rounded-[28px] border hairline-border bg-stone-50 overflow-hidden group transition-luxury relative cursor-pointer block min-h-[280px] md:min-h-[0] ${className}`}
    >
      {video ? (
        <video 
          ref={videoRef}
          src={video}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-luxury group-hover:scale-110"
          poster={image}
        />
      ) : (
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-luxury group-hover:scale-110" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/60 transition-luxury"></div>
      
      {/* Top Left Text */}
      <div className="absolute top-6 left-6 z-10 w-28">
        <h3 className="text-[#f8f5f0] text-lg lg:text-xl font-display uppercase tracking-widest leading-snug">
          {title.split(' ').map((word, i) => <span key={i} className="block">{word}</span>)}
        </h3>
      </div>
      
      {/* Bottom Left: SEE MORE + Line */}
      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3 w-1/2">
        <span className="text-[#f8f5f0] text-[10px] tracking-[0.2em] font-medium whitespace-nowrap">SEE MORE</span>
        <div className="h-[1px] bg-[#f8f5f0]/80 flex-grow"></div>
      </div>

      {/* Bottom Right: Cutout Block */}
      <div className="absolute bottom-0 right-0 z-10 bg-black rounded-tl-[20px] pl-5 pt-3 pb-3 pr-4 flex items-center gap-3 transition-transform group-hover:bg-neutral-900">
        <span className="text-[#ebd9b1] text-[10px] tracking-[0.2em] font-bold uppercase whitespace-nowrap">
          {bottomText}
        </span>
        <div className="w-7 h-7 rounded-full border border-[#ebd9b1]/30 flex items-center justify-center text-[#ebd9b1] group-hover:bg-[#ebd9b1] group-hover:text-black transition-luxury">
          <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}

function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemove }: { 
  isOpen: boolean; 
  onClose: () => void; 
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}) {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      {/* OVERLAY */}
      <div 
        className={`fixed inset-0 bg-black/20 z-[60] backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      {/* DRAWER */}
      <div className={`fixed top-0 right-0 h-full w-[400px] bg-white z-[70] transition-transform duration-500 ease-luxury ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col border-l border-wire`}>
        <div className="p-8 border-b border-wire flex justify-between items-center shrink-0">
          <h2 className="text-[10px] tracking-[0.3em] font-bold uppercase">SHOPPING BAG ({items.length})</h2>
          <button onClick={onClose} className="hover:opacity-60 transition-luxury">
            <X size={20} strokeWidth={1} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-8 space-y-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4">
              <p className="text-[10px] tracking-widest uppercase">YOUR BAG IS EMPTY</p>
              <button 
                onClick={onClose}
                className="text-[10px] border-b border-black pb-1 tracking-[0.2em]"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-6 animate-in slide-in-from-right-4 duration-500">
                <div className="w-24 aspect-[4/5] bg-[#EDEDED] border border-wire overflow-hidden shrink-0">
                  <div className="w-full h-full wireframe-placeholder" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest">{item.title}</h3>
                      <button onClick={() => onRemove(item.id)} className="opacity-40 hover:opacity-100 transition-luxury">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-[8px] opacity-40 uppercase tracking-widest">{item.subtitle}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center border border-wire px-3 py-1 gap-4">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-[10px]">-</button>
                      <span className="text-[10px] font-bold">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-[10px]">+</button>
                    </div>
                    <span className="text-[10px] font-bold">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 border-t border-wire space-y-6 bg-stone-50 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-[10px] tracking-widest opacity-40 uppercase">SUBTOTAL</span>
            <span className="text-sm font-bold">£{total.toFixed(2)}</span>
          </div>
          <button className="w-full bg-black text-white py-5 text-[10px] tracking-[0.3em] font-bold hover:bg-neutral-800 transition-luxury uppercase disabled:opacity-30 disabled:pointer-events-none" disabled={items.length === 0}>
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-black/10 py-24 px-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tighter">EVANÉ</h2>
          <p className="text-[10px] tracking-[0.2em] leading-relaxed opacity-40 uppercase">
            Artisanal hair science from London. Built for the modern silhouette.
          </p>
        </div>
        
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase">COLLECTIONS</h4>
          <ul className="space-y-3">
            <li><Link to="/collections" className="text-[10px] tracking-[0.2em] opacity-40 hover:opacity-100 transition-luxury uppercase">SHAMPOOS</Link></li>
            <li><Link to="/collections" className="text-[10px] tracking-[0.2em] opacity-40 hover:opacity-100 transition-luxury uppercase">CONDITIONERS</Link></li>
            <li><Link to="/collections" className="text-[10px] tracking-[0.2em] opacity-40 hover:opacity-100 transition-luxury uppercase">TREATMENTS</Link></li>
          </ul>
        </div>
        
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase">STAY UPDATED</h4>
          <form className="flex group">
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS" 
              className="bg-transparent border-b border-black/10 py-2 text-[10px] tracking-[0.2em] focus:border-black outline-none transition-luxury w-full"
            />
            <button className="border-b border-black/10 px-4 hover:border-black transition-luxury">
              <ArrowUpRight size={14} className="opacity-40" />
            </button>
          </form>
        </div>
        
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase">LEGAL</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-[10px] tracking-[0.2em] opacity-40 hover:opacity-100 transition-luxury uppercase">PRIVACY POLICY</a></li>
            <li><a href="#" className="text-[10px] tracking-[0.2em] opacity-40 hover:opacity-100 transition-luxury uppercase">TERMS OF SERVICE</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-24 pt-8 border-t border-black/5 flex justify-between items-end text-[8px] tracking-[0.4em] opacity-30 uppercase font-bold">
        <div className="flex items-baseline gap-1">
          <span>© 2024</span>
          <span className="font-display font-bold text-[10px] tracking-tight">EVANÉ</span>
          <span className="font-display italic text-lg normal-case tracking-normal">hair</span>
          <span className="ml-1 tracking-[0.4em]">COLLECTION</span>
        </div>
        <span>CRAFTED IN LONDON</span>
      </div>
    </footer>
  );
}

export default App;
