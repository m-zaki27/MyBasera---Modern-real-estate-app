// Map `className` → `style` for third-party components NativeWind doesn't know about.
// Imported once from the root layout so every screen gets the mapping.
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

cssInterop(Image, { className: 'style' });
