import { createIcons, LayoutDashboard, MessageSquare, User, Settings } from "lucide";
import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

createIcons({
  icons: { LayoutDashboard, MessageSquare, User, Settings },
});

/* This JS file is only to manage:
- Clicks on the menu
- having a clean effect on mobile 
- The tweakpane and icons
- ** All the animations and CSS scroll-driven animations are made in the CSS **
*/

const panels = document.querySelectorAll(".content-panel");
const tabs = document.querySelectorAll(".tab");
const scrollContainer = document.querySelector(".content-scroll-container");
const tabContainer = document.querySelector(".tabs");

// 1. Observer to auto-scroll the active tab with the least amount of movement
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = Array.from(panels).indexOf(entry.target);
        const targetTab = tabs[index];

        if (targetTab) {
          // Get the exact positions of the tab and its scrolling container
          const tabRect = targetTab.getBoundingClientRect();
          const containerRect = tabContainer.getBoundingClientRect();

          // Check if the tab is 100% visible inside the container
          const isFullyVisible =
            tabRect.left >= containerRect.left &&
            tabRect.right <= containerRect.right;

          // ONLY scroll if it is not 100% visible
          if (!isFullyVisible) {
            targetTab.scrollIntoView({
              behavior: "smooth",
              inline: "nearest",
              block: "nearest",
            });
          }
        }
      }
    });
  },
  {
    root: scrollContainer,
    threshold: 0.5,
  },
);

panels.forEach((panel) => observer.observe(panel));

// 2. Updated Click Listener with Dynamic Timeout
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    const panelWidth = scrollContainer.clientWidth;
    const currentIndex = Math.round(scrollContainer.scrollLeft / panelWidth);
    const distance = Math.abs(index - currentIndex);

    // If we are jumping across multiple tabs (e.g., from 1 to 4, distance is 3)
    if (distance > 1) {
      tabs.forEach((t, i) => {
        // Disable animations for all intermediate tabs
        if (i !== currentIndex && i !== index) {
          t.classList.add("suppress-animation");
        }
      });

      const cleanup = () => {
        tabs.forEach((t) => t.classList.remove("suppress-animation"));
        scrollContainer.removeEventListener("scrollend", cleanup);
      };

      // Modern browsers: fires exactly when scrolling physically stops
      scrollContainer.addEventListener("scrollend", cleanup, { once: true });

      // Older browsers fallback: Calculate time based on distance (e.g., 300ms per panel + 200ms buffer)
      // Jump 2 panels = 800ms, Jump 3 panels = 1100ms
      const dynamicFallbackTime = distance * 300 + 200;
      setTimeout(cleanup, dynamicFallbackTime);
    }

    // Trigger the smooth scroll to the target panel
    panels[index].scrollIntoView({ behavior: "smooth", inline: "start" });
  });
});




const STYLES = {
  'Tab Menu': 'style-tab-menu',
  'Tab icons': 'style-tab-icon',
};

export function initTweakpane() {
  const params = {
    debug: false,
    disableScroll: false,
    style: 'Tab Menu',
  };

  const pane = new Pane({ title: 'Settings' });
  pane.registerPlugin(EssentialsPlugin);

  const applyDebug = () => {
    document.body.classList.toggle('debug', params.debug);
  };

  const applyDisableScroll = () => {
    document.body.classList.toggle('disable-scroll', params.disableScroll);
  };

  const applyStyle = () => {
    document.querySelectorAll('.tabs').forEach((tabs) => {
      tabs.classList.remove(...Object.values(STYLES));
      tabs.classList.add(STYLES[params.style]);
    });
  };

  pane.addBinding(params, 'debug', { label: 'Debug' }).on('change', applyDebug);
  pane.addBinding(params, 'disableScroll', { label: 'Disable Scroll' }).on('change', applyDisableScroll);

  pane
    .addBlade({
      view: 'radiogrid',
      label: 'Style',
      groupName: 'style',
      size: [2, 1],
      cells: (x) => ({ title: Object.keys(STYLES)[x], value: Object.keys(STYLES)[x] }),
      value: params.style,
    })
    .on('change', (ev) => {
      params.style = ev.value;
      applyStyle();
    });

  applyDebug();
  applyStyle();

  return pane;
}

initTweakpane();
