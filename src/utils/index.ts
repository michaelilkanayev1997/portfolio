export const isMobile: boolean = window.innerWidth <= 500;

export const isiPhone = (): boolean => {
  return (
    /iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  );
};

export const is3XLorLarger = (): boolean => {
  return window.innerWidth >= 1920;
};
