import 'whatwg-fetch';

// Polyfill for TextEncoder in some Node versions used by JSDOM
import { TextEncoder, TextDecoder } from 'util';
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;
