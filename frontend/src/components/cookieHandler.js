import React from "react";

const expireCookie = "expires=Thu, 01 Jan 1970 00:00:00 UTC;";
const globalPath = "path=/;";

function getCookies() {
  if (!document.cookie) return {};
  return document.cookie.split(/;\s/).reduce((acc, cookie) => {
    const [key, value] = cookie.split(/=(.*)/);
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

export default function useCookies() {
  const [cookies, setUseCookies] = React.useState(getCookies());

  return [
    cookies,
    cookieKeysObj => {
      let cookieChanged = false;
      Object.entries(cookieKeysObj).forEach(([cookieKey, cookieValue]) => {
        if (cookies[cookieKey] !== cookieValue) {
          cookieChanged = true;
          document.cookie = `${cookieKey}=${cookieValue}; ${globalPath}`;
        }
      });
      if (cookieChanged) setUseCookies(getCookies());
    },
    cookieKeys => {
      let cookieChanged = false;
      // If an array isn't passed, make it an array
      if (!Array.isArray(cookieKeys)) cookieKeys = [cookieKeys];
      cookieKeys.forEach(cookieKey => {
        if (cookies.hasOwnProperty(cookieKey)) {
          cookieChanged = true;
          document.cookie = `${cookieKey}=; ${expireCookie} ${globalPath}`;
        }
      });
      if (cookieChanged) setUseCookies(getCookies());
    }
  ];
}
