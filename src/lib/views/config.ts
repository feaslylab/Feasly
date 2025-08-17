import type { ViewMode } from '@/lib/view-mode';
import { PATHS } from '@/routes/paths';

export type ViewConfig = {
  nav: {
    hiddenRoutes: string[];   // paths to hide entirely
    showAdvanced: boolean;    // you can use this to group items
  };
  features: {
    showWaterfallDebug: boolean; // debug panels & traces
    showScenarioDock: boolean;   // scenario selector/comparison
    showPresets: boolean;        // presets panel
  };
  defaults: {
    landingRoute: string;        // where index "/" should go for this mode
  };
};

export const VIEW_CONFIG: Record<ViewMode, ViewConfig> = {
  lite: {
    nav: { hiddenRoutes: ['/feasly-alerts', '/settings'], showAdvanced: false },
    features: { showWaterfallDebug: false, showScenarioDock: true, showPresets: true },
    defaults: { landingRoute: PATHS.model },
  },
  standard: {
    nav: { hiddenRoutes: ['/feasly-alerts'], showAdvanced: true },
    features: { showWaterfallDebug: false, showScenarioDock: true, showPresets: true },
    defaults: { landingRoute: PATHS.dashboard },
  },
  giga: {
    nav: { hiddenRoutes: [], showAdvanced: true },
    features: { showWaterfallDebug: true, showScenarioDock: true, showPresets: true },
    defaults: { landingRoute: PATHS.dashboard },
  },
};