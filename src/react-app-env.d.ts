/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_MAPTILER_TOKEN?: string;
    REACT_APP_OTP_API?: string;
  }
}