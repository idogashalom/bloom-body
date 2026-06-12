export const toast = (message, duration = 3500) => {
  window.dispatchEvent(new CustomEvent('bloom-toast', { detail: { message, duration } }));
};
