import { gsap } from '../vendor/gsap.mjs';
import './type-motion.js';
import './camera-motion.js';
if (!window.gsap) window.gsap = gsap;
export const TypeMotion = window.TypeMotion;
export const CameraMotion = window.CameraMotion;
