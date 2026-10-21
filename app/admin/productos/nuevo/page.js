"use client";

import ProductoForm from "../ProductoForm";
import { EMPTY } from "../campos";

// Nuevo producto en página completa (HU-18).
export default function NuevoProductoPage() {
  return <ProductoForm inicial={EMPTY} id={null} />;
}
