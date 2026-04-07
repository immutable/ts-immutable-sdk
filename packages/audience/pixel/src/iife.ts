/**
 * IIFE entry point for the CDN bundle (dist/imtbl.js).
 *
 * Only imports the bootstrap side-effect — no development utilities
 * like snippet generator or createLoader are exposed, keeping the
 * bundle as small as possible.
 */
import './bootstrap';
