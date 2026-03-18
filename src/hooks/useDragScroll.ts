import { useEffect, type RefObject } from 'react';

export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      // Only start drag-scroll for the primary (left) mouse button
      if (e.button !== 0) return;

      // Only allow drag-scroll when clicking directly on the wrapper background
      // or the inner .columns div — not on any interactive/card content
      const target = e.target as HTMLElement;
      const isOnWrapper = target === el || target === el.firstElementChild;
      if (!isOnWrapper) return;

      isDown = true;
      startX = e.clientX;
      startY = e.clientY;
      scrollLeft = el.scrollLeft;
      scrollTop = el.scrollTop;
      el.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const walkX = e.clientX - startX;
      const walkY = e.clientY - startY;
      el.scrollLeft = scrollLeft - walkX;
      el.scrollTop = scrollTop - walkY;
    };

    const onMouseUp = () => {
      isDown = false;
      el.style.cursor = '';
    };

    el.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [ref]);
}
