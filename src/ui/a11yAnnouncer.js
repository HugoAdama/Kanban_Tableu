// Accessible Screen Reader Announcer using persistent ARIA Live Regions
class A11yAnnouncer {
  constructor() {
    this.politeRegion = null;
    this.assertiveRegion = null;
    this._initRegions();
  }

  _initRegions() {
    if (this.politeRegion && this.assertiveRegion) return;

    // Polite live region for routine movements and selections
    this.politeRegion = document.createElement('div');
    this.politeRegion.id = 'a11y-announcer-polite';
    this.politeRegion.className = 'sr-only';
    this.politeRegion.setAttribute('role', 'status');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.politeRegion);

    // Assertive live region for critical errors/actions
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.id = 'a11y-announcer-assertive';
    this.assertiveRegion.className = 'sr-only';
    this.assertiveRegion.setAttribute('role', 'alert');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.assertiveRegion);
  }

  announce(message, priority = 'polite') {
    this._initRegions();
    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;

    // Clear content first to guarantee screen readers announce repeated text
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 50);
  }
}

export const announcer = new A11yAnnouncer();
