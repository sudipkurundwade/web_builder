import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import LaserFlow from '../components/LaserFlow.jsx';
import homeImg from '@/assets/home.jpeg';

const Landing = () => {
    const revealRef = useRef<HTMLDivElement>(null);

    return (
        <div className="w-full bg-background text-foreground overflow-x-hidden">
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 w-full h-[70px] flex items-center justify-between px-[5%] z-[100] bg-background/50 backdrop-blur-md border-b border-border">
                <div className="text-foreground text-2xl font-bold cursor-default">
                    Web<span className="text-primary">Builder</span>
                </div>
                <div className="flex gap-[30px] items-center">
                    <a href="#" className="text-muted-foreground no-underline text-base hover:text-foreground">Features</a>
                    <a href="#" className="text-muted-foreground no-underline text-base hover:text-foreground">Pricing</a>
                    <Link 
                        to={ROUTES.LOGIN} 
                        className="px-5 py-2 bg-primary text-primary-foreground rounded-md no-underline font-bold text-sm"
                    >
                        Login
                    </Link>
                </div>
            </nav>

            {/* Hero Section (Hero is full screen) */}
            <div 
              className="h-[800px] relative overflow-hidden bg-background"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const el = revealRef.current;
                if (el) {
                  el.style.setProperty('--mx', `${x}px`);
                  el.style.setProperty('--my', `${y}px`);
                }
              }}
              onMouseLeave={() => {
                const el = revealRef.current;
                if (el) {
                  el.style.setProperty('--mx', '-9999px');
                  el.style.setProperty('--my', '-9999px');
                }
              }}
            >
              <LaserFlow
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 6 }}
                horizontalBeamOffset={0.1}
                verticalBeamOffset={0.0}
                color="#8880FF"
              />
                
                {/* Centered Content Box */}
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-background/95 rounded-[20px] border-2 border-primary flex flex-col items-center justify-center text-foreground z-10">
                    <h1 className="text-foreground text-[2.5rem] font-bold">Welcome</h1>
                    <Link 
                        to={ROUTES.LOGIN} 
                        className="px-6 py-3 bg-foreground text-background rounded-lg no-underline font-bold text-[1.1rem] mt-2 hover:bg-foreground/90"
                    >
                        Login
                    </Link>
                </div>

                {/* Interactive Image Reveal Layer */}
                <div
                    ref={revealRef}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        zIndex: 5,
                        pointerEvents: 'none',
                        '--mx': '-9999px',
                        '--my': '-9999px',
                        WebkitMaskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 80px, rgba(255,255,255,0.6) 160px, rgba(255,255,255,0.25) 240px, rgba(255,255,255,0) 320px)',
                        maskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 80px, rgba(255,255,255,0.6) 160px, rgba(255,255,255,0.25) 240px, rgba(255,255,255,0) 320px)',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat'
                    } as React.CSSProperties}
                >
                    <img 
                        src={homeImg} 
                        alt="Home background" 
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            top: '0',
                            left: '0',
                            objectFit: 'cover',
                            zIndex: 5,
                            mixBlendMode: 'lighten',
                            opacity: 0.4,
                            pointerEvents: 'none'
                        } as React.CSSProperties}
                    />
                </div>
            </div>

            {/* Scrollable Content Sections */}
            <div className="py-[100px] px-5 text-center text-foreground bg-muted/20">
                <h2 className="text-[3.5rem] font-bold mb-6">Infinite Possibilities</h2>
                <p className="text-[1.3rem] max-w-[900px] mx-auto text-muted-foreground leading-[1.8]">
                    Our intuitive web builder empowers you to create stunning, interactive experiences 
                    with ease. From smooth animations to responsive layouts, we provide everything you 
                    need to stand out in the digital landscape.
                </p>
            </div>

            <div className="h-[600px] flex items-center justify-center bg-gradient-to-b from-muted/20 to-background">
                <div className="p-[60px] border border-primary/30 rounded-[24px] text-center bg-primary/5">
                    <h3 className="text-primary text-[2.5rem] mb-4">Dynamic Components</h3>
                    <p className="text-muted-foreground text-[1.1rem]">Fully customizable and ready for any project.</p>
                </div>
            </div>

            <footer className="py-[60px] px-5 text-center border-t border-border bg-muted/10">
                <p className="text-muted-foreground">© 2024 Web Builder. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;
