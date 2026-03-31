import { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageNavContext } from '../context/PageNavContext';
import Home from '../pages/Home';
import FullMap from '../pages/Map';
import Report from '../pages/Report';
import FloatingNav from './FloatingNav';

const PAGE_PATHS = ['/', '/map', '/report'];
const PATH_TO_PAGE = { '/': 0, '/map': 1, '/report': 2 };

export default function SwipeableApp() {
  const containerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isScrollingByCode = useRef(false);
  const scrollTimer = useRef(null);

  const initialPage = PATH_TO_PAGE[location.pathname] ?? 0;
  const [activePage, setActivePage] = useState(initialPage);

  // Sync scroll position when URL changes externally (e.g. pages calling navigate())
  useEffect(() => {
    const target = PATH_TO_PAGE[location.pathname] ?? 0;
    if (target !== activePage && !isScrollingByCode.current) {
      isScrollingByCode.current = true;
      setActivePage(target);
      if (containerRef.current) {
        containerRef.current.scrollLeft = target * window.innerWidth;
      }
      setTimeout(() => { isScrollingByCode.current = false; }, 150);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect user swipe and update URL
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onScroll() {
      if (isScrollingByCode.current) return;
      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        const page = Math.round(el.scrollLeft / window.innerWidth);
        if (page >= 0 && page <= 2) {
          setActivePage(page);
          navigate(PAGE_PATHS[page], { replace: true });
        }
      }, 60);
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimer.current);
    };
  }, [navigate]);

  const goToPage = useCallback((index, searchParams = '') => {
    if (index < 0 || index > 2) return;
    isScrollingByCode.current = true;
    setActivePage(index);
    const path = PAGE_PATHS[index] + (searchParams ? `?${searchParams}` : '');
    navigate(path, { replace: true });
    if (containerRef.current) {
      containerRef.current.scrollLeft = index * window.innerWidth;
    }
    setTimeout(() => { isScrollingByCode.current = false; }, 150);
  }, [navigate]);

  return (
    <PageNavContext.Provider value={{ goToPage, activePage }}>
      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <div
          ref={containerRef}
          className="swipe-container"
          style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            overflowX: 'scroll',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Page 0 — Home */}
          <div className="snap-page">
            <Home />
          </div>

          {/* Page 1 — Map */}
          <div className="snap-page snap-page-map">
            <FullMap />
          </div>

          {/* Page 2 — Report */}
          <div className="snap-page">
            <Report />
          </div>
        </div>

        <FloatingNav activePage={activePage} onNavigate={goToPage} />
      </div>
    </PageNavContext.Provider>
  );
}
