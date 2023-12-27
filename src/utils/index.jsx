export const isMobile = window.innerWidth <= 500;

export const isiPhone = () => {
  return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};
