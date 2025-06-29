// components/NewLeadForm.tsx

"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Lead } from '@/app/page';

const leadSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  phone: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface NewLeadFormProps {
  onLeadAdded: (newLead: Lead) => void;
  onClose: () => void;
}

export function NewLeadForm({ onLeadAdded, onClose }: NewLeadFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", phone: "" }
  });

  const onSubmit = async (data: LeadFormValues) => {
    const newLeadData = { 
        ...data, 
        qualification_status: "Novo" as const,
        origem: 'Manual' // Define uma origem padrão para leads criados manualmente
    };
    const { data: newLead, error } = await supabase.from('leads').insert([newLeadData]).select().single();
    if (error) {
      alert("Erro ao adicionar lead: " + error.message);
    } else if (newLead) {
      onLeadAdded(newLead);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" {...register("phone")} />
        {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "A Adicionar..." : "Adicionar Lead"}
        </Button>
      </DialogFooter>
    </form>
  );
}