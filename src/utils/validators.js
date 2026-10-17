import * as z from "zod";

/**
 * Expresiones regulares estandarizadas para validación en el sistema
 */
export const PATTERNS = {
  // Solo letras (incluyendo acentos en español, ñ, diéresis) y espacios.
  // NO permite apóstrofes ni guiones ni números ni caracteres especiales.
  PERSON_NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  
  // Nombres de entidades/marcas/categorías/productos: letras, números y espacios (sin caracteres raros)
  BRAND_NAME: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  CATEGORY_NAME: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  PRODUCT_NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  ROLE_NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  COLOR_NAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,

  // NIT: Solo números (entre 4 y 12 dígitos, opcional guion antes del último dígito) o valor "CF"
  // NO acepta letras
  NIT: /^(CF|[0-9]{4,12}(-[0-9])?)$/i,
};

/**
 * Esquemas Zod reutilizables
 */

// Validación para nombres de personas (Usuarios, Clientes, Registro)
export const personNameSchema = (fieldName = "El nombre") =>
  z
    .string()
    .trim()
    .min(1, "Este campo no puede quedarse vacío")
    .max(100, "Máximo 100 caracteres")
    .refine(
      (val) => PATTERNS.PERSON_NAME.test(val),
      "Solo se permiten letras y espacios (sin números, guiones ni caracteres especiales)"
    );

// Validación para nombre de marca
export const brandNameSchema = z
  .string()
  .trim()
  .min(1, "Este campo no puede quedarse vacío")
  .max(80, "Máximo 80 caracteres")
  .refine(
    (val) => PATTERNS.BRAND_NAME.test(val),
    "Solo se permiten letras, números y espacios (sin caracteres especiales)"
  );

// Validación para nombre de producto
export const productNameSchema = z
  .string()
  .trim()
  .min(1, "Este campo no puede quedarse vacío")
  .max(150, "Máximo 150 caracteres")
  .refine(
    (val) => PATTERNS.PRODUCT_NAME.test(val),
    "Solo se permiten letras y espacios (sin números ni caracteres especiales)"
  );

// Validación para nombre de categoría
export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "Este campo no puede quedarse vacío")
  .max(80, "Máximo 80 caracteres")
  .refine(
    (val) => PATTERNS.CATEGORY_NAME.test(val),
    "Solo se permiten letras, números y espacios (sin caracteres especiales)"
  );

// Validación de NIT (solo dígitos numéricos entre 4 y 12 caracteres, opcional guión, o la opción 'CF' sin letras adicionales)
export const nitSchema = z
  .string()
  .trim()
  .max(14, "El NIT no puede tener más de 14 caracteres")
  .refine(
    (val) => {
      if (!val) return true;
      const upper = val.toUpperCase().trim();
      if (upper === "CF" || upper === "C/F") return true;
      // No debe contener ninguna letra
      if (/[a-zA-Z]/.test(val)) return false;
      const digitsOnly = val.replace(/-/g, "");
      return digitsOnly.length >= 4 && digitsOnly.length <= 12 && /^[0-9]+(-[0-9])?$/.test(val);
    },
    "El NIT solo acepta números (4 a 12 dígitos) sin letras, o la opción 'CF'"
  )
  .optional()
  .or(z.literal(""));

// Validación de teléfono
export const phoneSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      const digitsOnly = val.replace(/\D/g, "");
      return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    },
    "El número de teléfono debe tener al menos 7 dígitos válidos"
  )
  .optional()
  .or(z.literal(""));

// Validación de email
export const emailSchema = (fieldName = "El correo electrónico") =>
  z
    .string()
    .trim()
    .min(1, "Este campo no puede quedarse vacío")
    .email("Ingresa un correo electrónico válido")
    .max(120, "Máximo 120 caracteres");

// Validación de color en variantes
export const colorSchema = z
  .string()
  .trim()
  .min(1, "Este campo no puede quedarse vacío")
  .max(50, "Máximo 50 caracteres")
  .refine(
    (val) => PATTERNS.COLOR_NAME.test(val),
    "El color solo puede contener letras y espacios (sin números)"
  );

// Validación de precio (mayor o igual a 0, hasta 2 decimales)
export const priceSchema = (fieldName = "El precio", isRequired = true) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) {
        return isRequired ? NaN : null;
      }
      const num = Number(val);
      return isNaN(num) ? NaN : num;
    },
    isRequired
      ? z
          .number({
            required_error: "Este campo no puede quedarse vacío",
            invalid_type_error: `${fieldName} debe ser un valor numérico`,
          })
          .min(0, `${fieldName} no puede ser negativo`)
          .refine(
            (val) => Number.isFinite(val) && Math.round(val * 100) === val * 100,
            `${fieldName} no puede tener más de 2 decimales`
          )
      : z
          .number({
            invalid_type_error: `${fieldName} debe ser un valor numérico`,
          })
          .min(0, `${fieldName} no puede ser negativo`)
          .refine(
            (val) => Number.isFinite(val) && Math.round(val * 100) === val * 100,
            `${fieldName} no puede tener más de 2 decimales`
          )
          .nullable()
          .optional()
  );

// Validación de stock (entero >= 0)
export const stockSchema = (fieldName = "El stock") =>
  z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? NaN : num;
    },
    z
      .number({
        invalid_type_error: `${fieldName} debe ser un número entero`,
      })
      .int(`${fieldName} debe ser un número entero sin decimales`)
      .min(0, `${fieldName} no puede ser negativo`)
      .nullable()
      .optional()
  );
