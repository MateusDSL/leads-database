import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte uma string de data UTC do Supabase para um objeto Date
 * que reflete o dia e a hora corretos no fuso horário local do usuário.
 */
export const parseUTCToLocalDate = (dateString: string | null | undefined): Date | null => {
  // Se a data for nula ou indefinida, retorna nulo para evitar erros
  if (!dateString) {
    return null;
  }
  
  // Remove a informação de fuso horário (Z, +00:00, etc.) da string.
  // Ex: '2025-06-23T01:00:00+00:00' se torna '2025-06-23T01:00:00'
  // Isso força o JavaScript a interpretar a data como se fosse no fuso horário local.
  const sanitizedString = dateString.substring(0, 19);
  return new Date(sanitizedString);
};