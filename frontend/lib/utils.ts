import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// SWR fetcher utility
export const fetcher = (input: RequestInfo, init?: RequestInit) =>
  fetch(input, init).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });
