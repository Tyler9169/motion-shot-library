import { gsap } from '../vendor/gsap.mjs';
import './type-motion.js';
import './camera-motion.js';
import './vibe-motion.js';
if (!window.gsap) window.gsap = gsap;
export const TypeMotion = window.TypeMotion;
export const CameraMotion = window.CameraMotion;

export const VibeMotion = window.VibeMotion;
