/**
 * Animation duration configuration (in milliseconds)
 * Keep these values in sync with CSS animations in application.css
 */

export const ANIMATION_DURATIONS = {
  // Item transition animations (moving between sections)
  ITEM_FADE_OUT: 200,
  ITEM_FADE_IN: 250,
  ITEM_TRANSITION_PAUSE: 50,

  // Derived durations
  get ITEM_FULL_TRANSITION() {
    return this.ITEM_FADE_OUT + this.ITEM_TRANSITION_PAUSE + this.ITEM_FADE_IN
  },
}
